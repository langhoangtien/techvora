import type { PostStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const pageSize = 10

export type ServiceListFilters = {
  q?: string
  status?: string
  category?: string
  featured?: string
  page?: number
}

export async function getServiceList(filters: ServiceListFilters = {}) {
  const page = Math.max(filters.page ?? 1, 1)
  const where = {
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" as const } },
            { slug: { contains: filters.q, mode: "insensitive" as const } },
            { shortDescription: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status as PostStatus } : {}),
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.featured === "true"
      ? { isFeatured: true }
      : filters.featured === "false"
        ? { isFeatured: false }
        : {}),
  }

  const [products, total, categories] = await Promise.all([
    prisma.serviceProduct.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.serviceProduct.count({ where }),
    prisma.serviceProduct.findMany({
      where: { category: { not: null } },
      distinct: ["category"],
      select: { category: true },
      orderBy: { category: "asc" },
    }),
  ])

  return {
    products,
    categories: categories.map((item) => item.category).filter(Boolean) as string[],
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getServiceForEdit(id: string) {
  return prisma.serviceProduct.findUnique({
    where: { id },
  })
}
