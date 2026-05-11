import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import type { SiteConfigFromSettings } from "@/lib/settings"

const publishedSaaSWhere = {
  status: "PUBLISHED" as const,
}

export async function getPublishedSaaSProducts(category?: string) {
  return prisma.saaSProduct.findMany({
    where: {
      ...publishedSaaSWhere,
      ...(category ? { category } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { rating: "desc" }],
  })
}

export async function getPublishedSaaSCategories() {
  const categories = await prisma.saaSProduct.findMany({
    where: {
      ...publishedSaaSWhere,
      category: { not: null },
    },
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  })

  return categories.map((item) => item.category).filter(Boolean) as string[]
}

export async function getPublishedSaaSBySlug(slug: string) {
  return prisma.saaSProduct.findFirst({
    where: {
      ...publishedSaaSWhere,
      slug,
    },
  })
}

export async function getPublishedSaaSStaticParams() {
  return prisma.saaSProduct.findMany({
    where: publishedSaaSWhere,
    select: { slug: true },
  })
}

export async function getRelatedSaaSProducts(id: string, category: string | null) {
  const related = await prisma.saaSProduct.findMany({
    where: {
      ...publishedSaaSWhere,
      id: { not: id },
      ...(category ? { category } : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { rating: "desc" }],
    take: 4,
  })

  if (related.length >= 3 || !category) {
    return related
  }

  const existingIds = new Set(related.map((item) => item.id))
  const fallback = await prisma.saaSProduct.findMany({
    where: {
      ...publishedSaaSWhere,
      id: { notIn: [id, ...existingIds] },
    },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { rating: "desc" }],
    take: 4 - related.length,
  })

  return [...related, ...fallback]
}

export async function getSitemapSaaSProducts() {
  return prisma.saaSProduct.findMany({
    where: publishedSaaSWhere,
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  })
}

export function saasMetadata({
  product,
  site,
  path,
}: {
  product: {
    name: string
    shortDescription: string | null
    description: string | null
    logoUrl: string | null
    seoTitle: string | null
    seoDescription: string | null
    canonicalUrl: string | null
    ogImageUrl: string | null
    noindex: boolean
  }
  site: SiteConfigFromSettings
  path: string
}): Metadata {
  const title = product.seoTitle || product.name || site.seoTitle
  const description =
    product.seoDescription ||
    product.shortDescription ||
    product.description ||
    site.seoDescription
  const canonical = product.canonicalUrl || new URL(path, site.url).toString()
  const image = product.ogImageUrl || product.logoUrl || site.ogImage

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !product.noindex && site.robots.index,
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
