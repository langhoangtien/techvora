import { prisma } from "@/lib/prisma"

export async function getTagsForAdmin(query = "") {
  const search = query.trim()

  return prisma.tag.findMany({
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
      _count: {
        select: {
          posts: true,
        },
      },
    },
    orderBy: { name: "asc" },
  })
}

export async function getTagForEdit(id?: string) {
  if (!id) {
    return null
  }

  return prisma.tag.findUnique({
    where: { id },
  })
}

