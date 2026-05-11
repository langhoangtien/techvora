import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import type { SiteConfigFromSettings } from "@/lib/settings"

const publishedComparisonWhere = { status: "PUBLISHED" as const }

export async function getPublishedComparisons() {
  return prisma.comparison.findMany({
    where: publishedComparisonWhere,
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
  })
}

export async function getPublishedComparisonBySlug(slug: string) {
  return prisma.comparison.findFirst({
    where: { ...publishedComparisonWhere, slug },
  })
}

export async function getPublishedComparisonStaticParams() {
  return prisma.comparison.findMany({
    where: publishedComparisonWhere,
    select: { slug: true },
  })
}

export async function getRelatedComparisons(id: string) {
  return prisma.comparison.findMany({
    where: { ...publishedComparisonWhere, id: { not: id } },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { createdAt: "desc" }],
    take: 4,
  })
}

export async function getSitemapComparisons() {
  return prisma.comparison.findMany({
    where: publishedComparisonWhere,
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  })
}

export function comparisonMetadata({
  comparison,
  site,
  path,
}: {
  comparison: {
    title: string
    excerpt: string | null
    seoTitle: string | null
    seoDescription: string | null
    canonicalUrl: string | null
    ogImageUrl: string | null
    noindex: boolean
  }
  site: SiteConfigFromSettings
  path: string
}): Metadata {
  const title = comparison.seoTitle || comparison.title || site.seoTitle
  const description = comparison.seoDescription || comparison.excerpt || site.seoDescription
  const canonical = comparison.canonicalUrl || new URL(path, site.url).toString()
  const image = comparison.ogImageUrl || site.ogImage

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !comparison.noindex && site.robots.index,
      follow: site.robots.follow,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: site.name,
      type: "article",
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
