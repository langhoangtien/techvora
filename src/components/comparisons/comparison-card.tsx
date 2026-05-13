import Link from "next/link"

import { WinnerBadge } from "@/components/comparisons/winner-badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Logo({ name, url }: { name: string; url?: string | null }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} className="size-10 rounded-lg border object-contain p-1" />
  ) : (
    <div className="flex size-10 items-center justify-center rounded-lg border bg-muted text-sm font-semibold">
      {name.slice(0, 1)}
    </div>
  )
}

export function ComparisonCard({
  title,
  href,
  excerpt,
  itemAName,
  itemBName,
  itemALogoUrl,
  itemBLogoUrl,
  winner,
  featured,
  className,
}: {
  title: string
  href: string
  excerpt?: string | null
  itemAName: string
  itemBName: string
  itemALogoUrl?: string | null
  itemBLogoUrl?: string | null
  winner?: string | null
  featured?: boolean
  className?: string
}) {
  return (
    <article className={cn("rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Logo name={itemAName} url={itemALogoUrl} />
          <span className="text-xs font-medium text-muted-foreground">vs</span>
          <Logo name={itemBName} url={itemBLogoUrl} />
        </div>
        {featured ? <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs text-primary">Empfohlen</span> : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">
        <Link href={href}>{title}</Link>
      </h3>
      {excerpt ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{excerpt}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">{itemAName}</span>
        <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">{itemBName}</span>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <WinnerBadge winner={winner} />
        <Button asChild variant="outline">
          <Link href={href}>Vergleich lesen</Link>
        </Button>
      </div>
    </article>
  )
}
