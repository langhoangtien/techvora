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
  getCategoryBySlug,
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
  const [category, site] = await Promise.all([getCategoryBySlug(slug), getSiteConfig()])

  if (!category) return {}

  return collectionMetadata({
    title: category.seoTitle || category.name,
    description: category.seoDesc || category.description,
    path: `/categories/${category.slug}`,
    site,
    noIndex: category.noIndex,
  })
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const query = (await searchParams) ?? {}
  const page = Number(value(query, "page") ?? 1)
  const [category, site] = await Promise.all([getCategoryBySlug(slug), getSiteConfig()])

  if (!category) notFound()

  const categoryIds = [
    category.id,
    ...category.children.map((child: { id: string }) => child.id),
  ]
  const { posts, totalPages } = await getPublishedArticleList({ page, categoryIds })

  return (
    <>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: category.name,
          url: new URL(`/categories/${category.slug}`, site.url).toString(),
        }}
      />
      <Container className="py-10">
        <Breadcrumb
          items={[
            { label: "Startseite", href: "/" },
            { label: "Kategorien" },
            { label: category.name },
          ]}
        />
        <SectionHeader
          className="mt-8"
          eyebrow="Kategorie"
          title={category.name}
          description={category.description ?? "Artikel in dieser Kategorie."}
        />
        {category.children.length > 0 ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {category.children.map((child: { id: string; slug: string; name: string }) => (
              <a
                key={child.id}
                href={`/categories/${child.slug}`}
                className="rounded-md border px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground"
              >
                {child.name}
              </a>
            ))}
          </div>
        ) : null}
        <div className="mt-8">
          <ArticleGrid posts={posts} emptyTitle="Keine Artikel in dieser Kategorie" />
        </div>
        <Pagination
          className="mt-8"
          page={page}
          totalPages={totalPages}
          getPageHref={(nextPage) => `/categories/${category.slug}?page=${nextPage}`}
        />
      </Container>
    </>
  )
}
