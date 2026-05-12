import Link from "next/link"
import { IconChevronRight as ChevronRightIcon } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

type BreadcrumbItem = {
  label: string
  href?: string
}

export function Breadcrumb({
  items,
  className,
}: {
  items: BreadcrumbItem[]
  className?: string
}) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-2 text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className={cn(isLast && "text-foreground")}>
                  {item.label}
                </span>
              )}
              {!isLast ? <ChevronRightIcon className="size-3.5" /> : null}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

