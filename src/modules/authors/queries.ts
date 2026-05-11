import { prisma } from "@/lib/prisma"

export async function getAuthorsForAdmin(query = "") {
  const search = query.trim()

  return prisma.author.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { bio: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      _count: {
        select: {
          posts: true,
          tools: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getAuthorForEdit(id?: string) {
  if (!id) {
    return null
  }

  return prisma.author.findUnique({
    where: { id },
  })
}

