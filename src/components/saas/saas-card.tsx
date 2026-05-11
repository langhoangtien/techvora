import Link from "next/link"

import { AffiliateButton } from "@/components/hosting/affiliate-button"
import { RatingBadge } from "@/components/hosting/rating-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SaaSCard({
  name,
  href,
  logoUrl,
  shortDescription,
  category,
  rating,
  pricingFrom,
  pricingModel,
  currency,
  affiliateUrl,
  featured,
  className,
}: {
  name: string
  href: string
  logoUrl?: string | null
  shortDescription?: string | null
  category?: string | null
  rating?: number | string | null
  pricingFrom?: number | string | null
  pricingModel?: string | null
  currency?: string | null
  affiliateUrl?: string | null
  featured?: boolean
  className?: string
}) {
  const price = pricingFrom == null ? null : Number(pricingFrom)

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={name} className="size-11 rounded-lg border object-contain p-1" />
        ) : (
          <div className="flex size-11 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
            {name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {category ? <span className="text-xs text-muted-foreground">{category}</span> : null}
            {featured ? (
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                Featured
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 truncate text-base font-semibold">
            <Link href={href}>{name}</Link>
          </h3>
          <div className="mt-2">
            <RatingBadge rating={rating} />
          </div>
        </div>
      </div>
      {shortDescription ? (
        <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {shortDescription}
        </p>
      ) : null}
      <div className="mt-4 space-y-1 text-sm">
        <p>
          {price == null || Number.isNaN(price) ? (
            <span className="text-muted-foreground">Pricing not listed</span>
          ) : (
            <>
              From <strong>{currency ?? "USD"} {price.toFixed(2)}</strong>
            </>
          )}
        </p>
        {pricingModel ? <p className="text-muted-foreground">{pricingModel}</p> : null}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-5">
        <Button asChild variant="outline">
          <Link href={href}>View profile</Link>
        </Button>
        <AffiliateButton href={affiliateUrl}>Visit site</AffiliateButton>
      </div>
    </article>
  )
}
