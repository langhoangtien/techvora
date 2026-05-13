import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import type { SiteConfigFromSettings } from "@/lib/settings"

const pageSize = 12
const locale = "de-DE"

const publishedToolWhere = {
  status: "PUBLISHED" as const,
  locale,
}

export type PublicToolListFilters = {
  page?: number
  q?: string
  categoryId?: string
}

export async function getPublishedToolList(filters: PublicToolListFilters = {}) {
  const page = Math.max(filters.page ?? 1, 1)
  const where = {
    ...publishedToolWhere,
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" as const } },
            { shortDescription: { contains: filters.q, mode: "insensitive" as const } },
            { description: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
  }

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { name: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.tool.count({ where }),
  ])

  return {
    tools,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getPublishedToolDirectory() {
  return prisma.tool.findMany({
    where: publishedToolWhere,
    include: { category: true },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { name: "asc" }],
  })
}

export async function getPublishedToolBySlug(slug: string) {
  return prisma.tool.findFirst({
    where: {
      ...publishedToolWhere,
      slug,
    },
    include: { category: true },
  })
}

export async function getToolCategories() {
  return prisma.category.findMany({
    where: {
      locale,
      tools: { some: publishedToolWhere },
    },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  })
}

export async function getPublishedToolStaticParams() {
  return prisma.tool.findMany({
    where: publishedToolWhere,
    select: { slug: true },
  })
}

export async function getSitemapTools() {
  return prisma.tool.findMany({
    where: publishedToolWhere,
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getRelatedTools(toolId: string, categoryId: string | null) {
  if (!categoryId) {
    return prisma.tool.findMany({
      where: {
        ...publishedToolWhere,
        id: { not: toolId },
      },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { name: "asc" }],
      take: 4,
    })
  }

  const sameCategory = await prisma.tool.findMany({
    where: {
      ...publishedToolWhere,
      id: { not: toolId },
      categoryId,
    },
    include: { category: true },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { name: "asc" }],
    take: 6,
  })

  if (sameCategory.length >= 4) {
    return sameCategory.slice(0, 6)
  }

  const existingIds = new Set(sameCategory.map((tool) => tool.id))
  const fallback = await prisma.tool.findMany({
    where: {
      ...publishedToolWhere,
      id: { notIn: [toolId, ...existingIds] },
    },
    include: { category: true },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { name: "asc" }],
    take: 6 - sameCategory.length,
  })

  return [...sameCategory, ...fallback].slice(0, 6)
}

export function toolMetadata({
  tool,
  site,
  path,
}: {
  tool: {
    name: string
    shortDescription: string | null
    description: string | null
    seoTitle: string | null
    seoDesc: string | null
    canonical: string | null
    ogImageUrl: string | null
    noIndex: boolean
  }
  site: SiteConfigFromSettings
  path: string
}): Metadata {
  const title = tool.seoTitle || tool.name || site.seoTitle
  const description =
    tool.seoDesc || tool.shortDescription || tool.description || site.seoDescription
  const canonical = tool.canonical || new URL(path, site.url).toString()
  const image = tool.ogImageUrl || site.ogImage

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !tool.noIndex && site.robots.index,
      follow: site.robots.follow,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}
