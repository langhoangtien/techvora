import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ArticleGrid } from "@/components/article/article-grid"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Container } from "@/components/layout/container"
import { Pagination } from "@/components/layout/pagination"
import { SectionHeader } from "@/components/layout/section-header"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getSiteConfig } from "@/lib/settings"
import {
  collectionMetadata,
  getAuthorBySlug,
  getPublishedArticleList,
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
  const [author, site] = await Promise.all([getAuthorBySlug(slug), getSiteConfig()])
  if (!author) return {}
  return collectionMetadata({
    title: author.seoTitle || author.name,
    description: author.seoDesc || author.bio,
    path: `/authors/${author.slug}`,
    site,
    noIndex: author.noIndex,
  })
}

export default async function AuthorPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const query = (await searchParams) ?? {}
  const page = Number(value(query, "page") ?? 1)
  const [author, site] = await Promise.all([getAuthorBySlug(slug), getSiteConfig()])
  if (!author) notFound()
  const { posts, totalPages } = await getPublishedArticleList({ page, authorId: author.id })

  return (
    <>
      <SeoJsonLd data={{ "@context": "https://schema.org", "@type": "CollectionPage", name: author.name, url: new URL(`/authors/${author.slug}`, site.url).toString() }} />
      <Container className="py-10">
        <Breadcrumb items={[{ label: "Startseite", href: "/" }, { label: "Autoren" }, { label: author.name }]} />
        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center">
          <Avatar className="size-20 rounded-xl">
            <AvatarImage src={author.avatarUrl ?? ""} alt={author.name} />
            <AvatarFallback className="rounded-xl">{author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <SectionHeader eyebrow="Autor" title={author.name} description={author.bio ?? "Artikel dieses Autors."} />
        </div>
        <div className="mt-8"><ArticleGrid posts={posts} emptyTitle="Keine Artikel dieses Autors" /></div>
        <Pagination className="mt-8" page={page} totalPages={totalPages} getPageHref={(nextPage) => `/authors/${author.slug}?page=${nextPage}`} />
      </Container>
    </>
  )
}
