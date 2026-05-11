import type { PostStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const pageSize = 10

export type HostingListFilters = {
  q?: string
  status?: string
  featured?: string
  page?: number
}

export async function getHostingList(filters: HostingListFilters = {}) {
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
    ...(filters.featured === "true"
      ? { isFeatured: true }
      : filters.featured === "false"
        ? { isFeatured: false }
        : {}),
  }

  const [providers, total] = await Promise.all([
    prisma.hostingProvider.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.hostingProvider.count({ where }),
  ])

  return {
    providers,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getHostingForEdit(id: string) {
  return prisma.hostingProvider.findUnique({
    where: { id },
  })
}
