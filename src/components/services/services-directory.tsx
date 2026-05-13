"use client"

import { useMemo, useState } from "react"

import { EmptyState } from "@/components/layout/empty-state"
import { ServiceCard } from "@/components/services/service-card"

export type DirectoryProduct = {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  logoUrl: string | null
  websiteUrl: string | null
  affiliateUrl: string | null
  category: string | null
  pricingModel: string | null
  pricingFrom: { toString(): string } | string | number | null
  currency: string
  rating: { toString(): string } | string | number | null
  isFeatured: boolean
}

export function ServicesDirectory({
  products,
  categories,
}: {
  products: DirectoryProduct[]
  categories: string[]
}) {
  const [category, setCategory] = useState("")
  const visibleProducts = useMemo(
    () => products.filter((product) => (category ? product.category === category : true)),
    [category, products]
  )

  return (
    <div className="mt-6">
      {categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm hover:text-primary"
            onClick={() => setCategory("")}
          >
            Alle
          </button>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-primary"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      {visibleProducts.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <ServiceCard
              key={product.id}
              name={product.name}
              href={`/services/${product.slug}`}
              logoUrl={product.logoUrl}
              shortDescription={product.shortDescription}
              category={product.category}
              rating={product.rating?.toString()}
              pricingFrom={product.pricingFrom?.toString()}
              pricingModel={product.pricingModel}
              currency={product.currency}
              affiliateUrl={product.affiliateUrl ?? product.websiteUrl}
              featured={product.isFeatured}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="Keine Services gefunden" />
        </div>
      )}
    </div>
  )
}
