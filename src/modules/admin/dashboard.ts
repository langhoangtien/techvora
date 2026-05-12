import { prisma } from "@/lib/prisma"

const trackedCategoryNames = [
  "AI",
  "Hosting",
  "VPN",
  "Domains",
  "SEO",
  "Developer Tools",
]

export async function getAdminDashboard() {
  const [
    totalPosts,
    totalServices,
    totalTools,
    totalComparisons,
    publishedPosts,
    draftPosts,
    recentArticles,
    recentServices,
    postsMissingSeoTitle,
    postsMissingMetaDescription,
    postsMissingCover,
    servicesMissingCategory,
    categories,
    serviceCategories,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.serviceProduct.count(),
    prisma.tool.count(),
    prisma.comparison.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.findMany({
      where: { type: "ARTICLE" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.serviceProduct.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.post.count({
      where: {
        OR: [{ seoTitle: null }, { seoTitle: "" }],
      },
    }),
    prisma.post.count({
      where: {
        OR: [{ seoDesc: null }, { seoDesc: "" }],
      },
    }),
    prisma.post.count({
      where: {
        coverImageUrl: null,
        featuredImageId: null,
      },
    }),
    prisma.serviceProduct.count({
      where: {
        OR: [{ category: null }, { category: "" }],
      },
    }),
    prisma.category.findMany({
      where: { name: { in: trackedCategoryNames } },
      select: {
        name: true,
        _count: {
          select: {
            posts: true,
            tools: true,
          },
        },
      },
    }),
    prisma.serviceProduct.groupBy({
      by: ["category"],
      where: { category: { in: trackedCategoryNames } },
      _count: { _all: true },
    }),
  ])

  const categoryCounts = new Map<string, number>()

  for (const category of categories) {
    categoryCounts.set(
      category.name,
      (categoryCounts.get(category.name) ?? 0) +
        category._count.posts +
        category._count.tools
    )
  }

  for (const item of serviceCategories) {
    if (!item.category) continue
    categoryCounts.set(
      item.category,
      (categoryCounts.get(item.category) ?? 0) + item._count._all
    )
  }

  return {
    stats: {
      totalPosts,
      totalServices,
      totalTools,
      totalComparisons,
      publishedPosts,
      draftPosts,
    },
    recentArticles,
    recentServices: recentServices.map(({ name, ...service }) => ({
      ...service,
      title: name,
      author: { name: "Tekvora team" },
    })),
    health: {
      postsMissingSeoTitle,
      postsMissingMetaDescription,
      postsMissingCover,
      servicesMissingCategory,
    },
    topCategories: trackedCategoryNames.map((name) => ({
      name,
      count: categoryCounts.get(name) ?? 0,
    })),
  }
}
