import { TrophyIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function WinnerBadge({
  winner,
  className,
}: {
  winner?: string | null
  className?: string
}) {
  if (!winner) return null

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md bg-primary/10 px-2 text-sm font-medium text-primary",
        className
      )}
    >
      <TrophyIcon className="size-4" />
      Winner: {winner}
    </span>
  )
}
