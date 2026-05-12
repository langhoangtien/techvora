import type { Metadata } from "next"

import { ArticleGrid } from "@/components/article/article-grid"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export const revalidate = 3600

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()
  return collectionMetadata({
    title: "Articles",
    description: "Practical guides, reviews, and comparisons for technical software decisions.",
    path: "/articles",
    site,
  })
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const page = Number(value(params, "page") ?? 1)
  const q = value(params, "q") ?? ""
  const categorySlug = value(params, "category")
  const [site, category] = await Promise.all([
    getSiteConfig(),
    categorySlug ? getCategoryBySlug(categorySlug) : Promise.resolve(null),
  ])
  const { posts, totalPages } = await getPublishedArticleList({
    page,
    q,
    categoryId: category?.id,
  })

  return (
    <>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Articles",
          url: new URL("/articles", site.url).toString(),
        }}
      />
      <Container className="py-12">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Articles"
              title={category ? `${category.name} Articles` : "Latest Articles"}
              description="Independent research and practical guidance for software, Services, and infrastructure decisions."
            />
            <form className="flex gap-2 md:w-80">
              {categorySlug ? <input type="hidden" name="category" value={categorySlug} /> : null}
              <Input name="q" defaultValue={q} placeholder="Search articles" />
              <Button type="submit" variant="outline">Search</Button>
            </form>
          </div>
          <ArticleGrid posts={posts} />
          <Pagination
            page={page}
            totalPages={totalPages}
            getPageHref={(nextPage) => {
              const search = new URLSearchParams()
              if (q) search.set("q", q)
              if (categorySlug) search.set("category", categorySlug)
              search.set("page", String(nextPage))
              return `/articles?${search.toString()}`
            }}
          />
        </div>
      </Container>
    </>
  )
}
