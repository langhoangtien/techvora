import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AffiliateButton } from "@/components/hosting/affiliate-button"
import { HostingCard } from "@/components/hosting/hosting-card"
import { ProsConsList } from "@/components/hosting/pros-cons-list"
import { RatingBadge } from "@/components/hosting/rating-badge"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Container } from "@/components/layout/container"
import { PublicAdSlot } from "@/components/layout/public-ad-slot"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import {
  getPublishedHostingBySlug,
  getPublishedHostingStaticParams,
  getRelatedHostingProviders,
  hostingMetadata,
} from "@/modules/hosting/public"
import { jsonArray, priceLabel } from "@/modules/hosting/utils"

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const providers = await getPublishedHostingStaticParams()
  return providers.map((provider) => ({ slug: provider.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [provider, site] = await Promise.all([
    getPublishedHostingBySlug(slug),
    getSiteConfig(),
  ])

  if (!provider) {
    return {}
  }

  return hostingMetadata({
    provider,
    site,
    path: `/hosting/${provider.slug}`,
  })
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null

  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <ul className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="rounded-md border bg-background px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function HostingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [provider, site] = await Promise.all([
    getPublishedHostingBySlug(slug),
    getSiteConfig(),
  ])

  if (!provider) {
    notFound()
  }

  const related = await getRelatedHostingProviders(provider.id)
  const providerUrl = new URL(`/hosting/${provider.slug}`, site.url).toString()
  const ctaUrl = provider.affiliateUrl ?? provider.websiteUrl
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Hosting", item: new URL("/hosting", site.url).toString() },
      { "@type": "ListItem", position: 3, name: provider.name, item: providerUrl },
    ],
  }
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: provider.name,
    description: provider.shortDescription ?? provider.description ?? site.seoDescription,
    image: provider.logoUrl ? new URL(provider.logoUrl, site.url).toString() : undefined,
    brand: { "@type": "Brand", name: provider.name },
    aggregateRating: provider.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: provider.rating.toString(),
          bestRating: "5",
          ratingCount: "1",
        }
      : undefined,
    review: {
      "@type": "Review",
      reviewRating: provider.rating
        ? {
            "@type": "Rating",
            ratingValue: provider.rating.toString(),
            bestRating: "5",
          }
        : undefined,
      author: { "@type": "Organization", name: site.name },
      reviewBody: provider.shortDescription ?? provider.description ?? undefined,
    },
  }

  return (
    <>
      <SeoJsonLd data={[productJsonLd, breadcrumbJsonLd]} />
      <Container className="py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Hosting", href: "/hosting" },
            { label: provider.name },
          ]}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-4">
              {provider.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={provider.logoUrl} alt={provider.name} className="size-16 rounded-xl border object-contain p-2" />
              ) : null}
              <div>
                <RatingBadge rating={provider.rating?.toString()} />
                <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                  {provider.name}
                </h1>
              </div>
            </div>
            {provider.shortDescription ? (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {provider.shortDescription}
              </p>
            ) : null}
          </div>
          <aside className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Rating</p>
            <div className="mt-2 text-3xl font-semibold">{provider.rating?.toString() ?? "N/A"}</div>
            <p className="mt-4 text-sm text-muted-foreground">Starting price</p>
            <div className="mt-1 text-lg font-medium">
              {priceLabel(provider.pricingFrom?.toString(), provider.currency)}
            </div>
            <div className="mt-5">
              <AffiliateButton href={ctaUrl}>Visit {provider.name}</AffiliateButton>
            </div>
          </aside>
        </div>
        <PublicAdSlot ads={site.ads} label="Advertisement" className="mt-8" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_260px]">
          <div className="space-y-8">
            {provider.description ? (
              <section className="rounded-lg border bg-card p-5">
                <h2 className="text-lg font-semibold tracking-tight">Quick verdict</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{provider.description}</p>
              </section>
            ) : null}
            <ProsConsList pros={provider.pros} cons={provider.cons} />
            <section className="rounded-lg border bg-card p-5">
              <h2 className="text-lg font-semibold tracking-tight">Pricing</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Plans start from {priceLabel(provider.pricingFrom?.toString(), provider.currency)}.
              </p>
            </section>
            <DetailList title="Features" items={jsonArray(provider.features)} />
            <DetailList title="Best for" items={jsonArray(provider.bestFor)} />
            {provider.performanceNotes ? (
              <section className="rounded-lg border bg-card p-5">
                <h2 className="text-lg font-semibold tracking-tight">Performance notes</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{provider.performanceNotes}</p>
              </section>
            ) : null}
            {provider.supportNotes ? (
              <section className="rounded-lg border bg-card p-5">
                <h2 className="text-lg font-semibold tracking-tight">Support notes</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{provider.supportNotes}</p>
              </section>
            ) : null}
            <DetailList title="Data center locations" items={jsonArray(provider.dataCenterLocations)} />
            <PublicAdSlot ads={site.ads} label="Advertisement" />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <PublicAdSlot ads={site.ads} label="Sidebar Ad" />
          </aside>
        </div>
        {related.length > 0 ? (
          <section className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-semibold tracking-tight">Related Hosting Providers</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <HostingCard
                  key={item.id}
                  name={item.name}
                  href={`/hosting/${item.slug}`}
                  logoUrl={item.logoUrl}
                  shortDescription={item.shortDescription}
                  rating={item.rating?.toString()}
                  pricingFrom={item.pricingFrom?.toString()}
                  currency={item.currency}
                  bestFor={item.bestFor}
                  affiliateUrl={item.affiliateUrl ?? item.websiteUrl}
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
