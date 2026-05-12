import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import { ServicesDirectory } from "@/components/services/services-directory"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import {
  getPublishedServiceCategories,
  getPublishedServices,
} from "@/modules/services/public"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Services Directory",
  description: "service profiles, pricing, ratings, and practical use cases.",
}

export default async function ServicesPage() {
  const [site, categories, products] = await Promise.all([
    getSiteConfig(),
    getPublishedServiceCategories(),
    getPublishedServices(),
  ])
  const pageUrl = new URL("/services", site.url).toString()
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Services Directory",
    description: "service profiles, pricing, ratings, and practical use cases.",
    url: pageUrl,
  }

  return (
    <>
      <SeoJsonLd data={collectionJsonLd} />
      <Container className="py-10">
        <SectionHeader
          eyebrow="Services"
          title="Services directory for modern teams"
          description="Compare services by category, pricing model, rating, strengths, limitations, and best-fit use cases."
        />
        <ServicesDirectory
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
