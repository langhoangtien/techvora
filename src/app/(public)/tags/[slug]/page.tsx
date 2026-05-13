import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleGrid } from "@/components/article/article-grid"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Container } from "@/components/layout/container"
import { Pagination } from "@/components/layout/pagination"
import { SectionHeader } from "@/components/layout/section-header"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import {
  collectionMetadata,
  getPublishedArticleList,
  getTagBySlug,
} from "@/modules/posts/public"

export const revalidate = 3600
export const dynamic = "force-dynamic"
export const dynamicParams = true

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const [tag, site] = await Promise.all([getTagBySlug(slug), getSiteConfig()])
  if (!tag) return {}
  return collectionMetadata({
    title: tag.seoTitle || tag.name,
    description: tag.seoDesc || tag.description,
    path: `/tags/${tag.slug}`,
    site,
    noIndex: tag.noIndex,
  })
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const query = (await searchParams) ?? {}
  const page = Number(value(query, "page") ?? 1)
  const [tag, site] = await Promise.all([getTagBySlug(slug), getSiteConfig()])
  if (!tag) notFound()
  const { posts, totalPages } = await getPublishedArticleList({ page, tagId: tag.id })

  return (
    <>
      <SeoJsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: tag.name, url: new URL(`/tags/${tag.slug}`, site.url).toString() }} />
      <Container className="py-10">
        <Breadcrumb items={[{ label: "Startseite", href: "/" }, { label: "Tags" }, { label: tag.name }]} />
        <SectionHeader className="mt-8" eyebrow="Tag" title={tag.name} description={tag.description ?? "Artikel mit diesem Tag."} />
        <div className="mt-8"><ArticleGrid posts={posts} emptyTitle="Keine Artikel mit diesem Tag" /></div>
        <Pagination className="mt-8" page={page} totalPages={totalPages} getPageHref={(nextPage) => `/tags/${tag.slug}?page=${nextPage}`} />
      </Container>
    </>
  )
}
