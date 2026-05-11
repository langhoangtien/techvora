import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import type { SiteConfigFromSettings } from "@/lib/settings"

const publishedHostingWhere = {
  status: "PUBLISHED" as const,
}

export async function getPublishedHostingProviders() {
  return prisma.hostingProvider.findMany({
    where: publishedHostingWhere,
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { rating: "desc" }],
  })
}

export async function getPublishedHostingBySlug(slug: string) {
  return prisma.hostingProvider.findFirst({
    where: {
      ...publishedHostingWhere,
      slug,
    },
  })
}

export async function getPublishedHostingStaticParams() {
  return prisma.hostingProvider.findMany({
    where: publishedHostingWhere,
    select: { slug: true },
  })
}

export async function getRelatedHostingProviders(id: string) {
  return prisma.hostingProvider.findMany({
    where: {
      ...publishedHostingWhere,
      id: { not: id },
    },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }, { rating: "desc" }],
    take: 4,
  })
}

export async function getSitemapHostingProviders() {
  return prisma.hostingProvider.findMany({
    where: publishedHostingWhere,
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  })
}

export function hostingMetadata({
  provider,
  site,
  path,
}: {
  provider: {
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
  const title = provider.seoTitle || provider.name || site.seoTitle
  const description =
    provider.seoDescription ||
    provider.shortDescription ||
    provider.description ||
    site.seoDescription
  const canonical = provider.canonicalUrl || new URL(path, site.url).toString()
  const image = provider.ogImageUrl || provider.logoUrl || site.ogImage

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !provider.noindex && site.robots.index,
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
