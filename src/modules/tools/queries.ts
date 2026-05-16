import type { PostStatus } from "@/generated/prisma/client"

import { sortCategoriesByTree } from "@/modules/categories/labels"
import { prisma } from "@/lib/prisma"

const pageSize = 10

export type ToolListFilters = {
  q?: string
  status?: string
  categoryId?: string
  componentKey?: string
  page?: number
}

export async function getToolList(filters: ToolListFilters = {}) {
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
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.componentKey ? { componentKey: filters.componentKey } : {}),
  }

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      include: { category: true },
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tool.count({ where }),
  ])

  return {
    tools,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getToolEditorOptions() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, parentId: true },
  })

  return { categories: sortCategoriesByTree(categories) }
}

export async function getToolForEdit(id: string) {
  return prisma.tool.findUnique({
    where: { id },
  })
}
