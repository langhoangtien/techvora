import Link from "next/link"
import {
  IconChevronLeft as ChevronLeftIcon,
  IconChevronRight as ChevronRightIcon,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Pagination({
  page,
  totalPages,
  getPageHref,
  className,
}: {
  page: number
  totalPages: number
  getPageHref: (page: number) => string
  className?: string
}) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <nav
      aria-label="Seitennavigation"
      className={cn("flex items-center justify-between gap-3", className)}
    >
      <Button asChild variant="outline" size="sm" disabled={page <= 1}>
        <Link href={getPageHref(Math.max(1, page - 1))}>
          <ChevronLeftIcon />
          Zurück
        </Link>
      </Button>
      <span className="text-sm text-muted-foreground">
        Seite {page} von {totalPages}
      </span>
      <Button asChild variant="outline" size="sm" disabled={page >= totalPages}>
        <Link href={getPageHref(Math.min(totalPages, page + 1))}>
          Weiter
          <ChevronRightIcon />
        </Link>
      </Button>
    </nav>
  )
}

