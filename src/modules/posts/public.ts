import type { Metadata } from "next"

import { prisma } from "@/lib/prisma"
import type { SiteConfigFromSettings } from "@/lib/settings"
import { slugify } from "@/lib/slugify"

const pageSize = 9
const locale = "de-DE"

const publishedArticleWhere = {
  status: "PUBLISHED" as const,
  type: "ARTICLE" as const,
  locale,
}

export type PublicPostListFilters = {
  page?: number
  q?: string
  categoryId?: string
  categoryIds?: string[]
  tagId?: string
  authorId?: string
}

export async function getPublishedArticleList(filters: PublicPostListFilters = {}) {
  const page = Math.max(filters.page ?? 1, 1)
  const where = {
    ...publishedArticleWhere,
    ...(filters.q
      ? {
          OR: [
            { title: { contains: filters.q, mode: "insensitive" as const } },
            { excerpt: { contains: filters.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(filters.categoryIds?.length
      ? { categoryId: { in: filters.categoryIds } }
      : filters.categoryId
        ? { categoryId: filters.categoryId }
        : {}),
    ...(filters.authorId ? { authorId: filters.authorId } : {}),
    ...(filters.tagId
      ? {
          tags: {
            some: {
              tagId: filters.tagId,
            },
          },
        }
      : {}),
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.post.count({ where }),
  ])

  return {
    posts,
    total,
    page,
    totalPages: Math.max(Math.ceil(total / pageSize), 1),
  }
}

export async function getPublishedArticleBySlug(slug: string) {
  return prisma.post.findFirst({
    where: {
      ...publishedArticleWhere,
      slug,
    },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
    },
  })
}

export async function getRelatedArticles(postId: string, categoryId: string | null, tagIds: string[]) {
  const byTags =
    tagIds.length > 0
      ? await prisma.post.findMany({
          where: {
            ...publishedArticleWhere,
            id: { not: postId },
            tags: {
              some: {
                tagId: { in: tagIds },
              },
            },
          },
          include: { category: true, author: true },
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          take: 6,
        })
      : []

  if (byTags.length >= 4 || !categoryId) {
    return byTags.slice(0, 6)
  }

  const existingIds = new Set(byTags.map((post) => post.id))
  const sameCategory = await prisma.post.findMany({
    where: {
      ...publishedArticleWhere,
      id: { notIn: [postId, ...existingIds] },
      categoryId,
    },
    include: { category: true, author: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 6 - byTags.length,
  })

  return [...byTags, ...sameCategory].slice(0, 6)
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug_locale: { slug, locale } },
    include: { children: true },
  })
}

export async function getTagBySlug(slug: string) {
  return prisma.tag.findUnique({
    where: { slug_locale: { slug, locale } },
  })
}

export async function getAuthorBySlug(slug: string) {
  return prisma.author.findUnique({
    where: { slug_locale: { slug, locale } },
  })
}

export async function getPublishedArticleStaticParams() {
  return prisma.post.findMany({
    where: publishedArticleWhere,
    select: { slug: true },
  })
}

export async function getCategoryStaticParams() {
  const categories = await prisma.category.findMany({
    where: {
      posts: { some: publishedArticleWhere },
    },
    select: { slug: true },
  })
  return categories
}

export async function getTagStaticParams() {
  const tags = await prisma.tag.findMany({
    where: {
      posts: {
        some: {
          post: publishedArticleWhere,
        },
      },
    },
    select: { slug: true },
  })
  return tags
}

export async function getAuthorStaticParams() {
  return prisma.author.findMany({
    where: {
      posts: { some: publishedArticleWhere },
    },
    select: { slug: true },
  })
}

export async function getSitemapArticles() {
  return prisma.post.findMany({
    where: publishedArticleWhere,
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: "desc" },
  })
}

export function formatPublicDate(date: Date | null) {
  if (!date) return ""
  return new Intl.DateTimeFormat("de-DE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

export function addHeadingIds(html: string) {
  const seen = new Map<string, number>()

  return html.replace(/<h([23])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    if (/\sid=/.test(attrs)) return match

    const cleanText = text.replace(/<[^>]+>/g, "").trim()
    const base = slugify(cleanText) || `section-${level}`
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    const id = count > 0 ? `${base}-${count + 1}` : base
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`
  })
}

export function extractTableOfContents(html: string) {
  return [...html.matchAll(/<h([23])[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h\1>/gi)].map(
    (match) => ({
      depth: Number(match[1]),
      id: match[2],
      title: match[3].replace(/<[^>]+>/g, "").trim(),
    })
  )
}

export function articleMetadata({
  post,
  site,
  path,
}: {
  post: {
    title: string
    excerpt: string | null
    seoTitle: string | null
    seoDesc: string | null
    canonical: string | null
    ogImageUrl: string | null
    coverImageUrl: string | null
    noIndex: boolean
  }
  site: SiteConfigFromSettings
  path: string
}): Metadata {
  const title = post.seoTitle || post.title || site.seoTitle
  const description = post.seoDesc || post.excerpt || site.seoDescription
  const canonical = post.canonical || new URL(path, site.url).toString()
  const image = post.ogImageUrl || post.coverImageUrl || site.ogImage

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: !post.noIndex,
      follow: !post.noIndex,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: canonical,
      images: image ? [{ url: new URL(image, site.url).toString() }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [new URL(image, site.url).toString()] : undefined,
    },
  }
}

export function collectionMetadata({
  title,
  description,
  path,
  site,
  noIndex,
}: {
  title: string
  description?: string | null
  path: string
  site: SiteConfigFromSettings
  noIndex?: boolean
}): Metadata {
  const canonical = new URL(path, site.url).toString()
  const pageDescription = description || site.seoDescription

  return {
    title,
    description: pageDescription,
    alternates: { canonical },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      title,
      description: pageDescription,
      type: "website",
      url: canonical,
      images: site.ogImage ? [{ url: new URL(site.ogImage, site.url).toString() }] : undefined,
    },
    twitter: {
      card: site.ogImage ? "summary_large_image" : "summary",
      title,
      description: pageDescription,
      images: site.ogImage ? [new URL(site.ogImage, site.url).toString()] : undefined,
    },
  }
}
