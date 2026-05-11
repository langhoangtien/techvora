import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import { SaaSDirectory } from "@/components/saas/saas-directory"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import {
  getPublishedSaaSCategories,
  getPublishedSaaSProducts,
} from "@/modules/saas/public"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "SaaS Directory",
  description: "SaaS product profiles, pricing, ratings, and practical use cases.",
}

export default async function SaaSPage() {
  const [site, categories, products] = await Promise.all([
    getSiteConfig(),
    getPublishedSaaSCategories(),
    getPublishedSaaSProducts(),
  ])
  const pageUrl = new URL("/saas", site.url).toString()
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "SaaS Directory",
    description: "SaaS product profiles, pricing, ratings, and practical use cases.",
    url: pageUrl,
  }

  return (
    <>
      <SeoJsonLd data={collectionJsonLd} />
      <Container className="py-10">
        <SectionHeader
          eyebrow="SaaS"
          title="SaaS directory for modern teams"
          description="Compare SaaS products by category, pricing model, rating, strengths, limitations, and best-fit use cases."
        />
        <SaaSDirectory
          products={products.map((product) => ({
            ...product,
            pricingFrom: product.pricingFrom?.toString() ?? null,
            rating: product.rating?.toString() ?? null,
          }))}
          categories={categories}
        />
      </Container>
    </>
  )
}
