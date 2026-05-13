import Link from "next/link"

import { cn } from "@/lib/utils"

type TocItem = {
  id: string
  title: string
  depth?: number
}

export function TableOfContents({
  items,
  className,
}: {
  items: TocItem[]
  className?: string
}) {
  if (items.length === 0) {
    return null
  }

  return (
    <aside className={cn("rounded-lg border bg-card p-4", className)}>
      <p className="text-sm font-medium">Auf dieser Seite</p>
      <nav className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`#${item.id}`}
            className={cn(
              "block hover:text-foreground",
              item.depth && item.depth > 2 && "pl-3"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  )
}

