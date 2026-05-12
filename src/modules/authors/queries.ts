import { prisma } from "@/lib/prisma"

const pageSize = 10

export async function getAuthorsForAdmin(query = "", pageValue = 1) {
  const search = query.trim()
  const page = Math.max(pageValue, 1)
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
          { bio: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined

  const [authors, total] = await Promise.all([
    prisma.author.findMany({
      where,
      include: {
        _count: {
          select: {
            posts: true,
            tools: true,
          },
        },
      },
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.author.count({ where }),
  ])

  return {
    authors,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getAuthorForEdit(id?: string) {
  if (!id) {
    return null
  }

  return prisma.author.findUnique({
    where: { id },
  })
}

