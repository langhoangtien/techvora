import { prisma } from "@/lib/prisma"

const pageSize = 10

export async function getTagsForAdmin(query = "", pageValue = 1) {
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

  const [tags, total] = await Promise.all([
    prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tag.count({ where }),
  ])

  return {
    tags,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getTagForEdit(id?: string) {
  if (!id) {
    return null
  }

  return prisma.tag.findUnique({
    where: { id },
  })
}

