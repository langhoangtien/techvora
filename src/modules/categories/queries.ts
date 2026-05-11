import { prisma } from "@/lib/prisma"

export async function getCategoriesForAdmin(query = "") {
  const search = query.trim()

  return prisma.category.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
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
  })
}

export async function getCategoryOptions() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
      parentId: true,
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })
}

export async function getCategoryForEdit(id?: string) {
  if (!id) {
    return null
  }

  return prisma.category.findUnique({
    where: { id },
  })
}

