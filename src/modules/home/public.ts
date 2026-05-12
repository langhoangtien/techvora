import { prisma } from "@/lib/prisma"

const publishedWhere = {
  status: "PUBLISHED" as const,
}

export async function getHomepageContent() {
  const [tools, articles, services, comparisons, categories] =
    await Promise.all([
      prisma.tool.findMany({
        where: publishedWhere,
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          shortDescription: true,
          pricingSummary: true,
          isFeatured: true,
          category: { select: { name: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { name: "asc" }],
        take: 6,
      }),
      prisma.post.findMany({
        where: {
          ...publishedWhere,
          type: "ARTICLE",
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImageUrl: true,
          publishedAt: true,
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        take: 6,
      }),
      prisma.serviceProduct.findMany({
        where: publishedWhere,
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          shortDescription: true,
          category: true,
          rating: true,
          pricingFrom: true,
          pricingModel: true,
          currency: true,
          affiliateUrl: true,
          websiteUrl: true,
          isFeatured: true,
        },
        orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { rating: "desc" }],
        take: 4,
      }),
      prisma.comparison.findMany({
        where: publishedWhere,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          itemAName: true,
          itemBName: true,
          itemALogoUrl: true,
          itemBLogoUrl: true,
          winner: true,
          isFeatured: true,
        },
        orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
        take: 4,
      }),
      prisma.category.findMany({
        where: { isFeatured: true },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
        },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        take: 6,
      }),
    ])

  return {
    tools,
    articles,
    services,
    comparisons,
    categories,
  }
}
