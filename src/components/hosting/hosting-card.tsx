import Link from "next/link"

import { AffiliateButton } from "@/components/hosting/affiliate-button"
import { RatingBadge } from "@/components/hosting/rating-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function arrayItems(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

export function HostingCard({
  name,
  href,
  logoUrl,
  shortDescription,
  rating,
  pricingFrom,
  currency,
  bestFor,
  affiliateUrl,
  featured,
  className,
}: {
  name: string
  href: string
  logoUrl?: string | null
  shortDescription?: string | null
  rating?: number | string | null
  pricingFrom?: number | string | null
  currency?: string | null
  bestFor?: unknown
  affiliateUrl?: string | null
  featured?: boolean
  className?: string
}) {
  const bestForItems = arrayItems(bestFor).slice(0, 3)
  const price = pricingFrom == null ? null : Number(pricingFrom)

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={name} className="size-11 rounded-lg border object-contain p-1" />
          ) : (
            <div className="flex size-11 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
              {name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold">
                <Link href={href}>{name}</Link>
              </h3>
              {featured ? (
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                  Featured
                </span>
              ) : null}
            </div>
            <div className="mt-1">
              <RatingBadge rating={rating} />
            </div>
          </div>
        </div>
      </div>
      {shortDescription ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {shortDescription}
        </p>
      ) : null}
      <div className="mt-4 text-sm">
        {price == null || Number.isNaN(price) ? (
          <span className="text-muted-foreground">Pricing not listed</span>
        ) : (
          <span>
            From <strong>{currency ?? "USD"} {price.toFixed(2)}</strong>
          </span>
        )}
      </div>
      {bestForItems.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {bestForItems.map((item) => (
            <span key={item} className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
              {item}
            </span>
          ))}
        </div>
      ) : null}
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button asChild variant="outline">
          <Link href={href}>Read review</Link>
        </Button>
        <AffiliateButton href={affiliateUrl}>Visit host</AffiliateButton>
      </div>
    </article>
  )
}
