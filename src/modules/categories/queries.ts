import { prisma } from "@/lib/prisma"
import { sortCategoriesByTree } from "@/modules/categories/labels"

const pageSize = 10

export async function getCategoriesForAdmin(query = "", pageValue = 1) {
  const search = query.trim()
  const page = Math.max(pageValue, 1)
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            posts: true,
            tools: true,
            children: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.count({ where }),
  ])

  return {
    categories,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getCategoryOptions() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })

  return sortCategoriesByTree(categories)
}

export async function getCategoryForEdit(id?: string) {
  if (!id) {
    return null
  }

  return prisma.category.findUnique({
    where: { id },
  })
}

