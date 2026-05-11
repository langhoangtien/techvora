import { StarIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function RatingBadge({
  rating,
  className,
}: {
  rating?: number | string | null
  className?: string
}) {
  const value = rating == null ? null : Number(rating)

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border bg-card px-2 text-sm font-medium",
        className
      )}
    >
      <StarIcon className="size-4 fill-current text-amber-500" />
      {value == null || Number.isNaN(value) ? "Not rated" : value.toFixed(1)}
    </span>
  )
}
