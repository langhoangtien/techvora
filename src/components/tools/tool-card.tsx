import Link from "next/link"
import { ExternalLinkIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ToolCardProps = React.ComponentProps<"article"> & {
  name: string
  href: string
  tagline?: string
  description?: string | null
  category?: string
  pricingSummary?: string
  featured?: boolean
}

export function ToolCard({
  name,
  href,
  tagline,
  description,
  category,
  pricingSummary,
  featured,
  className,
  ...props
}: ToolCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20",
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {category ? <span>{category}</span> : null}
            {featured ? (
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-primary">
                Featured
              </span>
            ) : null}
          </div>
          <h3 className="mt-1 truncate text-base font-semibold">
            <Link href={href}>{name}</Link>
          </h3>
        </div>
        <ExternalLinkIcon className="mt-1 size-4 shrink-0 text-muted-foreground" />
      </div>
      {tagline || description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {tagline ?? description}
        </p>
      ) : null}
      {pricingSummary ? (
        <p className="mt-4 text-sm font-medium">{pricingSummary}</p>
      ) : null}
    </article>
  )
}
