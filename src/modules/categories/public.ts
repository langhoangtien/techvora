import { prisma } from "@/lib/prisma"

export async function getFeaturedHeaderCategories() {
  return prisma.category.findMany({
    where: {
      locale: "en",
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
}
