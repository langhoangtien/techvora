import { cn } from "@/lib/utils"

const badgeVariants = {
  neutral: "bg-muted text-muted-foreground",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
}

export function AdminBadge({
  children,
  variant = "neutral",
}: {
  children: React.ReactNode
  variant?: keyof typeof badgeVariants
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-medium",
        badgeVariants[variant]
      )}
    >
      {children}
    </span>
  )
}

