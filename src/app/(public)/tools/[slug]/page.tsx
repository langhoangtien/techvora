import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContentRenderer } from "@/components/article/content-renderer"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Container } from "@/components/layout/container"
import { PublicAdSlot } from "@/components/layout/public-ad-slot"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { ToolCard } from "@/components/tools/tool-card"
import { getSiteConfig } from "@/lib/settings"
import { getToolRegistryItem } from "@/modules/tools/registry"
import {
  getPublishedToolBySlug,
  getPublishedToolStaticParams,
  getRelatedTools,
  toolMetadata,
} from "@/modules/tools/public"

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const tools = await getPublishedToolStaticParams()
  return tools.map((tool) => ({ slug: tool.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [tool, site] = await Promise.all([getPublishedToolBySlug(slug), getSiteConfig()])

  if (!tool) {
    return {}
  }

  return toolMetadata({
    tool,
    site,
    path: `/tools/${tool.slug}`,
  })
}

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [tool, site] = await Promise.all([getPublishedToolBySlug(slug), getSiteConfig()])

  if (!tool) {
    notFound()
  }

  const registryItem = getToolRegistryItem(tool.componentKey)
  const ToolComponent = registryItem?.component
  const related = await getRelatedTools(tool.id, tool.categoryId)
  const toolUrl = new URL(`/tools/${tool.slug}`, site.url).toString()
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Tools", item: new URL("/tools", site.url).toString() },
      { "@type": "ListItem", position: 3, name: tool.name, item: toolUrl },
    ],
  }
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.shortDescription ?? tool.description ?? site.seoDescription,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: toolUrl,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }

  return (
    <>
      <SeoJsonLd data={[softwareJsonLd, breadcrumbJsonLd]} />
      <Container className="py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Tools", href: "/tools" },
            { label: tool.name },
          ]}
        />
        <div className="mt-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {tool.category ? (
              <Link href={`/tools?categoryId=${tool.category.id}`} className="hover:text-foreground">
                {tool.category.name}
              </Link>
            ) : null}
            {registryItem ? <span>{registryItem.label}</span> : null}
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {tool.name}
          </h1>
          {tool.shortDescription || tool.tagline ? (
            <p className="mt-5 text-lg leading-8 text-muted-foreground">
              {tool.shortDescription ?? tool.tagline}
            </p>
          ) : null}
        </div>
        <PublicAdSlot ads={site.ads} label="Advertisement" className="mt-8" />
        <section className="mt-8 rounded-lg border bg-card p-4 md:p-6">
          {ToolComponent ? (
            <ToolComponent />
          ) : (
            <p className="text-sm text-muted-foreground">
              This tool is not connected to an interactive component yet.
            </p>
          )}
        </section>
        <div className="mx-auto mt-10 grid max-w-6xl gap-8 lg:grid-cols-[1fr_260px]">
          <div className="min-w-0">
            {tool.description ? (
              <p className="mb-8 text-base leading-7 text-muted-foreground">{tool.description}</p>
            ) : null}
            {tool.content ? <ContentRenderer html={tool.content} /> : null}
            <PublicAdSlot ads={site.ads} label="Advertisement" className="mt-8" />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <PublicAdSlot ads={site.ads} label="Sidebar Ad" />
          </aside>
        </div>
        {related.length > 0 ? (
          <section className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-semibold tracking-tight">Related Tools</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ToolCard
                  key={item.id}
                  name={item.name}
                  href={`/tools/${item.slug}`}
                  tagline={item.shortDescription ?? item.tagline ?? undefined}
                  category={item.category?.name}
                  featured={item.isFeatured}
                />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </>
  )
}
