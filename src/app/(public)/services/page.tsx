import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import {
  ServicesDirectory,
  type DirectoryProduct,
} from "@/components/services/services-directory"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import {
  getPublishedServiceCategories,
  getPublishedServices,
} from "@/modules/services/public"

export const revalidate = 3600
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Service-Verzeichnis",
  description: "Service-Profile, Preise, Bewertungen und praktische Einsatzszenarien.",
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
    name: "Service-Verzeichnis",
    description: "Service-Profile, Preise, Bewertungen und praktische Einsatzszenarien.",
    url: pageUrl,
  }

  return (
    <>
      <SeoJsonLd data={collectionJsonLd} />
      <Container className="py-10">
        <SectionHeader
          eyebrow="Services"
          title="Service-Verzeichnis für moderne Teams"
          description="Vergleichen Sie Services nach Kategorie, Preismodell, Bewertung, Stärken, Grenzen und passenden Einsatzfällen."
        />
        <ServicesDirectory
          products={products.map((product: DirectoryProduct) => ({
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
