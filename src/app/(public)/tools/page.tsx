import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { SectionHeader } from "@/components/layout/section-header"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { ToolDirectory } from "@/components/tools/tool-directory"
import { getSiteConfig } from "@/lib/settings"
import { getPublishedToolDirectory, getToolCategories } from "@/modules/tools/public"

export const revalidate = 3600

export const metadata: Metadata = {
  title: "Tools",
  description: "Free technical tools for developers, operators, and SaaS teams.",
}

export default async function ToolsPage() {
  const [site, categories, tools] = await Promise.all([
    getSiteConfig(),
    getToolCategories(),
    getPublishedToolDirectory(),
  ])
  const pageUrl = new URL("/tools", site.url).toString()
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Tools",
    description: "Free technical tools for developers, operators, and SaaS teams.",
    url: pageUrl,
  }

  return (
    <>
      <SeoJsonLd data={collectionJsonLd} />
      <Container className="py-10">
        <SectionHeader
          eyebrow="Tools"
          title="Fast technical utilities for everyday work"
          description="Format data, generate identifiers, encode text, and convert timestamps without leaving your browser."
        />
        <div id="tools">
          <ToolDirectory tools={tools} categories={categories} />
        </div>
      </Container>
    </>
  )
}
