import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AffiliateButton } from "@/components/services/affiliate-button"
import { ProsConsList } from "@/components/services/pros-cons-list"
import { RatingBadge } from "@/components/services/rating-badge"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Container } from "@/components/layout/container"
import { PublicAdSlot } from "@/components/layout/public-ad-slot"
import { ServiceCard } from "@/components/services/service-card"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { getSiteConfig } from "@/lib/settings"
import {
  getPublishedServiceBySlug,
  getPublishedServiceStaticParams,
  getRelatedServices,
  serviceMetadata,
} from "@/modules/services/public"
import { jsonArray, priceLabel } from "@/modules/services/utils"

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  const products = await getPublishedServiceStaticParams()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const [product, site] = await Promise.all([
    getPublishedServiceBySlug(slug),
    getSiteConfig(),
  ])

  if (!product) {
    return {}
  }

  return serviceMetadata({
    product,
    site,
    path: `/services/${product.slug}`,
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

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [product, site] = await Promise.all([
    getPublishedServiceBySlug(slug),
    getSiteConfig(),
  ])

  if (!product) {
    notFound()
  }

  const related = await getRelatedServices(product.id, product.category)
  const productUrl = new URL(`/services/${product.slug}`, site.url).toString()
  const ctaUrl = product.affiliateUrl ?? product.websiteUrl
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: site.url },
      { "@type": "ListItem", position: 2, name: "Services", item: new URL("/services", site.url).toString() },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  }
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.shortDescription ?? product.description ?? site.seoDescription,
    applicationCategory: product.category ?? "BusinessApplication",
    operatingSystem: "Web",
    image: product.logoUrl ? new URL(product.logoUrl, site.url).toString() : undefined,
    url: productUrl,
    offers: product.pricingFrom
      ? {
          "@type": "Offer",
          price: product.pricingFrom.toString(),
          priceCurrency: product.currency,
        }
      : undefined,
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating.toString(),
          bestRating: "5",
          ratingCount: "1",
        }
      : undefined,
    review: {
      "@type": "Review",
      reviewRating: product.rating
        ? {
            "@type": "Rating",
            ratingValue: product.rating.toString(),
            bestRating: "5",
          }
        : undefined,
      author: { "@type": "Organization", name: site.name },
      reviewBody: product.shortDescription ?? product.description ?? undefined,
    },
  }

  return (
    <>
      <SeoJsonLd data={[softwareJsonLd, breadcrumbJsonLd]} />
      <Container className="py-10">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Services", href: "/services" },
            { label: product.name },
          ]}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-4">
              {product.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.logoUrl} alt={product.name} className="size-16 rounded-xl border object-contain p-2" />
              ) : null}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {product.category ? (
                    <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                      {product.category}
                    </span>
                  ) : null}
                  <RatingBadge rating={product.rating?.toString()} />
                </div>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                  {product.name}
                </h1>
              </div>
            </div>
            {product.shortDescription ? (
              <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">
                {product.shortDescription}
              </p>
            ) : null}
          </div>
          <aside className="rounded-lg border bg-card p-5">
            <p className="text-sm text-muted-foreground">Rating</p>
            <div className="mt-2 text-3xl font-semibold">{product.rating?.toString() ?? "N/A"}</div>
            <p className="mt-4 text-sm text-muted-foreground">Pricing</p>
            <div className="mt-1 text-lg font-medium">
              {priceLabel(product.pricingFrom?.toString(), product.currency)}
            </div>
            {product.pricingModel ? (
              <p className="mt-1 text-sm text-muted-foreground">{product.pricingModel}</p>
            ) : null}
            <div className="mt-5">
              <AffiliateButton href={ctaUrl}>Visit {product.name}</AffiliateButton>
            </div>
          </aside>
        </div>
        <PublicAdSlot ads={site.ads} label="Advertisement" className="mt-8" />
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_260px]">
          <div className="space-y-8">
            {product.description ? (
              <section className="rounded-lg border bg-card p-5">
                <h2 className="text-lg font-semibold tracking-tight">Quick verdict</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{product.description}</p>
              </section>
            ) : null}
            <section className="rounded-lg border bg-card p-5">
              <h2 className="text-lg font-semibold tracking-tight">Pricing</h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {product.name} uses {product.pricingModel ?? "a listed pricing model"} and starts from{" "}
                {priceLabel(product.pricingFrom?.toString(), product.currency)}.
              </p>
            </section>
            <DetailList title="Features" items={jsonArray(product.features)} />
            <ProsConsList pros={product.pros} cons={product.cons} />
            <DetailList title="Best for" items={jsonArray(product.bestFor)} />
            <DetailList title="Alternatives" items={jsonArray(product.alternatives)} />
            <PublicAdSlot ads={site.ads} label="Advertisement" />
          </div>
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <PublicAdSlot ads={site.ads} label="Sidebar Ad" />
          </aside>
        </div>
        {related.length > 0 ? (
          <section className="mt-16 border-t pt-12">
            <h2 className="text-2xl font-semibold tracking-tight">Related Services</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ServiceCard
                  key={item.id}
                  name={item.name}
                  href={`/services/${item.slug}`}
                  logoUrl={item.logoUrl}
                  shortDescription={item.shortDescription}
                  category={item.category}
                  rating={item.rating?.toString()}
                  pricingFrom={item.pricingFrom?.toString()}
                  pricingModel={item.pricingModel}
                  currency={item.currency}
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
