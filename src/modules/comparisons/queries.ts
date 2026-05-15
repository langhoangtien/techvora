import type { PostStatus } from "@/generated/prisma/client"

import { prisma } from "@/lib/prisma"

const pageSize = 10

export type ComparisonListFilters = {
  q?: string
  status?: string
  featured?: string
  page?: number
}

export async function getComparisonList(filters: ComparisonListFilters = {}) {
  const page = Math.max(filters.page ?? 1, 1)
  const where = {
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" as const } },
            { itemAName: { contains: filters.q, mode: "insensitive" as const } },
            { itemBName: { contains: filters.q, mode: "insensitive" as const } },
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

  const [comparisons, total] = await Promise.all([
    prisma.comparison.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.comparison.count({ where }),
  ])

  return {
    comparisons,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getComparisonForEdit(id: string) {
  return prisma.comparison.findUnique({ where: { id } })
}
