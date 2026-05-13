import type { Metadata } from "next"

import { ComparisonCard } from "@/components/comparisons/comparison-card"
import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/layout/empty-state"
import { SectionHeader } from "@/components/layout/section-header"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import { getPublishedComparisons } from "@/modules/comparisons/public"

type ComparisonListItem = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  itemAName: string
  itemBName: string
  itemALogoUrl: string | null
  itemBLogoUrl: string | null
  winner: string | null
  isFeatured: boolean
}

export const revalidate = 3600
export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Vergleiche", description: "Direkte Vergleiche für Software, Services und technische Tools." }

export default async function ComparePage() {
  const [site, comparisons] = await Promise.all([getSiteConfig(), getPublishedComparisons()])
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Vergleiche",
    itemListElement: comparisons.map((item: ComparisonListItem, index: number) => ({
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
        <SectionHeader eyebrow="Vergleiche" title="Direkte Produktvergleiche" description="Bewerten Sie Kompromisse, Gewinner, Einsatzfälle, Vor- und Nachteile sowie Kaufpfade für Tools und Services." />
        {comparisons.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comparisons.map((item: ComparisonListItem) => (
              <ComparisonCard key={item.id} title={item.title} href={`/compare/${item.slug}`} excerpt={item.excerpt} itemAName={item.itemAName} itemBName={item.itemBName} itemALogoUrl={item.itemALogoUrl} itemBLogoUrl={item.itemBLogoUrl} winner={item.winner} featured={item.isFeatured} />
            ))}
          </div>
        ) : <div className="mt-8"><EmptyState title="Keine Vergleiche gefunden" /></div>}
      </Container>
    </>
  )
}
