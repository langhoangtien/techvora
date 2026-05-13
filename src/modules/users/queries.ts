import { prisma } from "@/lib/prisma"

const pageSize = 10

export async function getUsersForAdmin(query = "", pageValue = 1) {
  const search = query.trim()
  const page = Math.max(pageValue, 1)
  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            slug: true,
            _count: {
              select: {
                posts: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getUserForEdit(id?: string) {
  if (!id) {
    return null
  }

  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      avatarUrl: true,
      passwordHash: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          id: true,
          slug: true,
        },
      },
    },
  })
}
