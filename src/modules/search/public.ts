import { prisma } from "@/lib/prisma"

export type SearchResultType =
  | "article"
  | "tool"
  | "service"
  | "comparison"

export type SearchResult = {
  title: string
  description: string | null
  url: string
  type: SearchResultType
  imageUrl: string | null
  date: Date | null
  itemAName?: string
  itemBName?: string
  itemALogoUrl?: string | null
  itemBLogoUrl?: string | null
  winner?: string | null
}

export type GroupedSearchResults = {
  articles: SearchResult[]
  tools: SearchResult[]
  services: SearchResult[]
  comparisons: SearchResult[]
}

export const minSearchQueryLength = 2
const locale = "de-DE"

export function normalizeSearchQuery(query: string | null | undefined) {
  return String(query ?? "").trim().slice(0, 120)
}

function containsQuery(query: string) {
  return {
    contains: query,
    mode: "insensitive" as const,
  }
}

const emptyResults: GroupedSearchResults = {
  articles: [],
  tools: [],
  services: [],
  comparisons: [],
}

export function hasSearchResults(results: GroupedSearchResults) {
  return Object.values(results).some((group) => group.length > 0)
}

export async function searchPublicContent(
  rawQuery: string | null | undefined
): Promise<GroupedSearchResults> {
  const query = normalizeSearchQuery(rawQuery)

  if (query.length < minSearchQueryLength) {
    return emptyResults
  }

  const match = containsQuery(query)

  const [articles, tools, services, comparisons] = await Promise.all([
    prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        type: "ARTICLE",
        locale,
        noIndex: false,
        OR: [{ title: match }, { excerpt: match }, { content: match }],
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
    prisma.tool.findMany({
      where: {
        status: "PUBLISHED",
        locale,
        noIndex: false,
        OR: [
          { name: match },
          { shortDescription: match },
          { description: match },
          { content: match },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        name: true,
        slug: true,
        tagline: true,
        shortDescription: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
    prisma.serviceProduct.findMany({
      where: {
        status: "PUBLISHED",
        noindex: false,
        OR: [{ name: match }, { shortDescription: match }, { description: match }],
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        name: true,
        slug: true,
        shortDescription: true,
        logoUrl: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
    prisma.comparison.findMany({
      where: {
        status: "PUBLISHED",
        noindex: false,
        OR: [
          { title: match },
          { excerpt: match },
          { summary: match },
          { verdict: match },
          { content: match },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
      take: 5,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        itemAName: true,
        itemBName: true,
        itemALogoUrl: true,
        itemBLogoUrl: true,
        winner: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
  ])

  return {
    articles: articles.map((article) => ({
      title: article.title,
      description: article.excerpt,
      url: `/articles/${article.slug}`,
      type: "article",
      imageUrl: article.coverImageUrl,
      date: article.publishedAt ?? article.updatedAt,
    })),
    tools: tools.map((tool) => ({
      title: tool.name,
      description: tool.tagline ?? tool.shortDescription,
      url: `/tools/${tool.slug}`,
      type: "tool",
      imageUrl: null,
      date: tool.publishedAt ?? tool.updatedAt,
    })),
    services: services.map((product) => ({
      title: product.name,
      description: product.shortDescription,
      url: `/services/${product.slug}`,
      type: "service",
      imageUrl: product.logoUrl,
      date: product.publishedAt ?? product.updatedAt,
    })),
    comparisons: comparisons.map((comparison) => ({
      title: comparison.title,
      description: comparison.excerpt,
      url: `/compare/${comparison.slug}`,
      type: "comparison",
      imageUrl: comparison.itemALogoUrl ?? comparison.itemBLogoUrl,
      date: comparison.publishedAt ?? comparison.updatedAt,
      itemAName: comparison.itemAName,
      itemBName: comparison.itemBName,
      itemALogoUrl: comparison.itemALogoUrl,
      itemBLogoUrl: comparison.itemBLogoUrl,
      winner: comparison.winner,
    })),
  }
}
