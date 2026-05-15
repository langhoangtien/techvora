import Link from "next/link"
import {
  IconChevronLeft as ChevronLeftIcon,
  IconChevronRight as ChevronRightIcon,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function getPaginationItems(page: number, totalPages: number) {
  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const pages = new Set<number>([1, 2, totalPages - 1, totalPages])

  for (let nextPage = currentPage - 1; nextPage <= currentPage + 1; nextPage++) {
    if (nextPage >= 1 && nextPage <= totalPages) {
      pages.add(nextPage)
    }
  }

  const sortedPages = Array.from(pages)
    .filter((nextPage) => nextPage >= 1 && nextPage <= totalPages)
    .sort((a, b) => a - b)

  return sortedPages.reduce<Array<number | "ellipsis">>((items, nextPage) => {
    const previousPage = items[items.length - 1]

    if (typeof previousPage === "number" && nextPage - previousPage > 1) {
      items.push("ellipsis")
    }

    items.push(nextPage)
    return items
  }, [])
}

export function AdminPagination({
  page,
  total,
  totalPages,
  getPageHref,
  itemLabel,
  pageSize = 10,
  className,
}: {
  page: number
  total: number
  totalPages: number
  getPageHref: (page: number) => string
  itemLabel: string
  pageSize?: number
  className?: string
}) {
  if (total <= 0) {
    return null
  }

  const currentPage = Math.min(Math.max(page, 1), Math.max(totalPages, 1))
  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, total)
  const items = getPaginationItems(currentPage, Math.max(totalPages, 1))

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-card p-4 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="text-sm text-muted-foreground">
        Hiển thị {start} đến {end} trên {total} {itemLabel}. Tổng {totalPages} trang.
      </div>

      {totalPages > 1 ? (
        <nav aria-label="Phân trang" className="flex flex-wrap items-center gap-2">
          {currentPage > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={getPageHref(currentPage - 1)}>
                <ChevronLeftIcon />
                Trang trước
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <ChevronLeftIcon />
              Trang trước
            </Button>
          )}

          <div className="flex flex-wrap items-center gap-1">
            {items.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-7 min-w-7 items-center justify-center px-1 text-sm text-muted-foreground"
                >
                  ...
                </span>
            ) : item === currentPage ? (
                <span
                  key={item}
                  aria-current="page"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  {item}
                </span>
              ) : (
                <Button key={item} asChild variant="outline" size="sm">
                  <Link href={getPageHref(item)}>{item}</Link>
                </Button>
              ),
            )}
          </div>

          {currentPage < totalPages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={getPageHref(currentPage + 1)}>
                Trang sau
                <ChevronRightIcon />
              </Link>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Trang sau
              <ChevronRightIcon />
            </Button>
          )}
        </nav>
      ) : null}
    </div>
  )
}
