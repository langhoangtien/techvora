import type { Metadata } from "next"

import { ComparisonCard } from "@/components/comparisons/comparison-card"
import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/layout/empty-state"
import { SectionHeader } from "@/components/layout/section-header"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import { getPublishedComparisons } from "@/modules/comparisons/public"

export const revalidate = 3600
export const metadata: Metadata = { title: "Comparisons", description: "Side-by-side comparisons for software, hosting, SaaS, and technical tools." }

export default async function ComparePage() {
  const [site, comparisons] = await Promise.all([getSiteConfig(), getPublishedComparisons()])
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Comparisons",
    itemListElement: comparisons.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: new URL(`/compare/${item.slug}`, site.url).toString(),
      name: item.title,
    })),
  }

  return (
    <>
      <SeoJsonLd data={itemListJsonLd} />
      <Container className="py-10">
        <SectionHeader eyebrow="Compare" title="Side-by-side product comparisons" description="Evaluate tradeoffs, winners, use cases, pros, cons, and buying paths across tools, SaaS, and hosting providers." />
        {comparisons.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((item) => (
              <ComparisonCard key={item.id} title={item.title} href={`/compare/${item.slug}`} excerpt={item.excerpt} itemAName={item.itemAName} itemBName={item.itemBName} itemALogoUrl={item.itemALogoUrl} itemBLogoUrl={item.itemBLogoUrl} winner={item.winner} featured={item.isFeatured} />
            ))}
          </div>
        ) : <div className="mt-8"><EmptyState title="No comparisons found" /></div>}
      </Container>
    </>
  )
}
