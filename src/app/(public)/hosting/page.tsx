import type { Metadata } from "next"

import { HostingCard } from "@/components/hosting/hosting-card"
import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/layout/empty-state"
import { SectionHeader } from "@/components/layout/section-header"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import { getPublishedHostingProviders } from "@/modules/hosting/public"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Hosting and VPS Reviews",
  description: "Independent hosting and VPS reviews for technical teams.",
}

export default async function HostingPage() {
  const [site, providers] = await Promise.all([
    getSiteConfig(),
    getPublishedHostingProviders(),
  ])
  const pageUrl = new URL("/hosting", site.url).toString()
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Hosting and VPS Reviews",
    description: "Independent hosting and VPS reviews for technical teams.",
    url: pageUrl,
  }

  return (
    <>
      <SeoJsonLd data={collectionJsonLd} />
      <Container className="py-10">
        <SectionHeader
          eyebrow="Hosting"
          title="Hosting and VPS reviews for technical teams"
          description="Compare providers by pricing, performance notes, support quality, data center footprint, and practical fit."
        />
        {providers.length > 0 ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <HostingCard
                key={provider.id}
                name={provider.name}
                href={`/hosting/${provider.slug}`}
                logoUrl={provider.logoUrl}
                shortDescription={provider.shortDescription}
                rating={provider.rating?.toString()}
                pricingFrom={provider.pricingFrom?.toString()}
                currency={provider.currency}
                bestFor={provider.bestFor}
                affiliateUrl={provider.affiliateUrl ?? provider.websiteUrl}
                featured={provider.isFeatured}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState title="No hosting reviews found" />
          </div>
        )}
      </Container>
    </>
  )
}
