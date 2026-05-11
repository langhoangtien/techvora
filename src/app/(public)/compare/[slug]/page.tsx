import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComparisonCard } from "@/components/comparisons/comparison-card"
import { ComparisonTable } from "@/components/comparisons/comparison-table"
import { WinnerBadge } from "@/components/comparisons/winner-badge"
import { ContentRenderer } from "@/components/article/content-renderer"
import { AffiliateButton } from "@/components/hosting/affiliate-button"
import { ProsConsList } from "@/components/hosting/pros-cons-list"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Container } from "@/components/layout/container"
import { PublicAdSlot } from "@/components/layout/public-ad-slot"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import { comparisonMetadata, getPublishedComparisonBySlug, getPublishedComparisonStaticParams, getRelatedComparisons } from "@/modules/comparisons/public"
import { jsonArray } from "@/modules/comparisons/utils"

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const comparisons = await getPublishedComparisonStaticParams()
  return comparisons.map((comparison) => ({ slug: comparison.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const [comparison, site] = await Promise.all([getPublishedComparisonBySlug(slug), getSiteConfig()])
  if (!comparison) return {}
  return comparisonMetadata({ comparison, site, path: `/compare/${comparison.slug}` })
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null
  return <section className="rounded-lg border bg-card p-5"><h2 className="text-lg font-semibold tracking-tight">{title}</h2><ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">{items.map((item) => <li key={item} className="rounded-md border bg-background px-3 py-2">{item}</li>)}</ul></section>
}

function ItemHero({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={name} className="size-14 rounded-xl border object-contain p-2" />
      ) : null}
      <h2 className="mt-4 text-xl font-semibold tracking-tight">{name}</h2>
    </div>
  )
}

export default async function ComparisonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [comparison, site] = await Promise.all([getPublishedComparisonBySlug(slug), getSiteConfig()])
  if (!comparison) notFound()
  const related = await getRelatedComparisons(comparison.id)
  const pageUrl = new URL(`/compare/${comparison.slug}`, site.url).toString()
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Compare", item: new URL("/compare", site.url).toString() },
      { "@type": "ListItem", position: 3, name: comparison.title, item: pageUrl },
    ],
  }
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: comparison.title,
    description: comparison.excerpt ?? comparison.seoDescription ?? site.seoDescription,
    datePublished: comparison.publishedAt?.toISOString(),
    dateModified: comparison.updatedAt.toISOString(),
    author: { "@type": "Organization", name: site.name },
    mainEntityOfPage: pageUrl,
  }

  return (
    <>
      <SeoJsonLd data={[articleJsonLd, breadcrumbJsonLd]} />
      <Container className="py-10">
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Compare", href: "/compare" }, { label: comparison.title }]} />
        <div className="mt-8 max-w-3xl">
          <WinnerBadge winner={comparison.winner} />
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">{comparison.title}</h1>
          {comparison.excerpt ? <p className="mt-5 text-lg leading-8 text-muted-foreground">{comparison.excerpt}</p> : null}
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
          <ItemHero name={comparison.itemAName} logoUrl={comparison.itemALogoUrl} />
          <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">vs</div>
          <ItemHero name={comparison.itemBName} logoUrl={comparison.itemBLogoUrl} />
        </div>
        <PublicAdSlot ads={site.ads} label="Advertisement" className="mt-8" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_260px]">
          <div className="space-y-8">
            {comparison.summary || comparison.verdict ? <section className="rounded-lg border bg-card p-5"><h2 className="text-lg font-semibold tracking-tight">Quick verdict</h2>{comparison.summary ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{comparison.summary}</p> : null}{comparison.verdict ? <p className="mt-3 text-sm leading-7 text-muted-foreground">{comparison.verdict}</p> : null}</section> : null}
            <ComparisonTable value={comparison.comparisonTable} />
            <div className="grid gap-4 md:grid-cols-2">
              <ProsConsList pros={comparison.prosA} cons={comparison.consA} />
              <ProsConsList pros={comparison.prosB} cons={comparison.consB} />
            </div>
            <ListSection title={`Best for ${comparison.itemAName}`} items={jsonArray(comparison.bestForA)} />
            <ListSection title={`Best for ${comparison.itemBName}`} items={jsonArray(comparison.bestForB)} />
            {comparison.content ? <ContentRenderer html={comparison.content} /> : null}
            <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-5">
              <AffiliateButton href={comparison.itemAAffiliateUrl ?? comparison.itemAUrl}>Visit {comparison.itemAName}</AffiliateButton>
              <AffiliateButton href={comparison.itemBAffiliateUrl ?? comparison.itemBUrl}>Visit {comparison.itemBName}</AffiliateButton>
            </div>
            <PublicAdSlot ads={site.ads} label="Advertisement" />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start"><PublicAdSlot ads={site.ads} label="Sidebar Ad" /></aside>
        </div>
        {related.length > 0 ? <section className="mt-16 border-t pt-12"><h2 className="text-2xl font-semibold tracking-tight">Related Comparisons</h2><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ComparisonCard key={item.id} title={item.title} href={`/compare/${item.slug}`} excerpt={item.excerpt} itemAName={item.itemAName} itemBName={item.itemBName} itemALogoUrl={item.itemALogoUrl} itemBLogoUrl={item.itemBLogoUrl} winner={item.winner} featured={item.isFeatured} />)}</div></section> : null}
      </Container>
    </>
  )
}
