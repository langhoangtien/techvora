import { prisma } from "@/lib/prisma"

const locale = "de-DE"

export async function getFeaturedHeaderCategories() {
  try {
    return await prisma.category.findMany({
      where: {
        locale,
        parentId: null,
        isFeatured: true,
        slug: { not: "tools" },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        children: {
          where: {
            locale,
            isFeatured: true,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
          orderBy: [{ order: "asc" }, { name: "asc" }],
        },
      },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      take: 6,
    })
  } catch {
    return []
  }
}
