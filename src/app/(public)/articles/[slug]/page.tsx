import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContentRenderer } from "@/components/article/content-renderer"
import { ArticleGrid } from "@/components/article/article-grid"
import { TableOfContents } from "@/components/article/table-of-contents"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Container } from "@/components/layout/container"
import { PublicAdSlot } from "@/components/layout/public-ad-slot"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import {
  addHeadingIds,
  articleMetadata,
  extractTableOfContents,
  formatPublicDate,
  getPublishedArticleBySlug,
  getPublishedArticleStaticParams,
  getRelatedArticles,
} from "@/modules/posts/public"

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const posts = await getPublishedArticleStaticParams()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [post, site] = await Promise.all([
    getPublishedArticleBySlug(slug),
    getSiteConfig(),
  ])

  if (!post) {
    return {}
  }

  return articleMetadata({
    post,
    site,
    path: `/articles/${post.slug}`,
  })
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [post, site] = await Promise.all([
    getPublishedArticleBySlug(slug),
    getSiteConfig(),
  ])

  if (!post) {
    notFound()
  }

  const html = addHeadingIds(post.content ?? "")
  const toc = extractTableOfContents(html)
  const related = await getRelatedArticles(
    post.id,
    post.categoryId,
    post.tags.map((item) => item.tagId)
  )
  const articleUrl = new URL(`/articles/${post.slug}`, site.url).toString()
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: site.url },
      { "@type": "ListItem", position: 2, name: "Artikel", item: new URL("/articles", site.url).toString() },
      { "@type": "ListItem", position: 3, name: post.title, item: articleUrl },
    ],
  }
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? post.seoDesc ?? site.seoDescription,
    image: post.coverImageUrl ? new URL(post.coverImageUrl, site.url).toString() : undefined,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name ?? site.name,
    },
    mainEntityOfPage: articleUrl,
  }

  return (
    <>
      <SeoJsonLd data={[articleJsonLd, breadcrumbJsonLd]} />
      <Container className="py-10">
        <Breadcrumb
          items={[
            { label: "Startseite", href: "/" },
            { label: "Artikel", href: "/articles" },
            { label: post.title },
          ]}
        />
        <article className="mt-8">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {post.category ? (
                <Link href={`/categories/${post.category.slug}`} className="hover:text-foreground">
                  {post.category.name}
                </Link>
              ) : null}
              {post.author ? (
                <>
                  <span>/</span>
                  <Link href={`/authors/${post.author.slug}`} className="hover:text-foreground">
                    {post.author.name}
                  </Link>
                </>
              ) : null}
              <span>/</span>
              <time dateTime={post.publishedAt?.toISOString()}>
                {formatPublicDate(post.publishedAt)}
              </time>
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="mt-5 text-lg leading-8 text-muted-foreground">
                {post.excerpt}
              </p>
            ) : null}
            <div className="mt-4 text-sm text-muted-foreground">
              Aktualisiert am {formatPublicDate(post.updatedAt)}
            </div>
          </div>
          {post.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="mx-auto mt-8 aspect-video w-full max-w-5xl rounded-lg border object-cover"
            />
          ) : null}
          <div className="mx-auto mt-8 grid max-w-6xl gap-8 lg:grid-cols-[1fr_260px]">
            <div className="min-w-0">
              <PublicAdSlot ads={site.ads} label="Anzeige" className="mb-8" />
              <ContentRenderer html={html} />
              <PublicAdSlot ads={site.ads} label="Anzeige" className="my-8" />
              {post.tags.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {post.tags.map(({ tag }) => (
                    <Link
                      key={tag.id}
                      href={`/tags/${tag.slug}`}
                      className="rounded-md border px-2.5 py-1 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              ) : null}
              <PublicAdSlot ads={site.ads} label="Anzeige" className="mt-8" />
            </div>
            <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
              <TableOfContents items={toc} />
              <PublicAdSlot ads={site.ads} label="Sidebar-Anzeige" />
            </aside>
          </div>
        </article>
        {related.length > 0 ? (
          <section className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-semibold tracking-tight">Ähnliche Artikel</h2>
            <div className="mt-6">
              <ArticleGrid posts={related} />
            </div>
          </section>
        ) : null}
      </Container>
    </>
  )
}
