import { cn } from "@/lib/utils"

const statusLabels: Record<string, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  SCHEDULED: "Đã lên lịch",
  ARCHIVED: "Lưu trữ",
}

const statusClasses: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  SCHEDULED: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  ARCHIVED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-xs font-medium",
        statusClasses[status] ?? "bg-muted text-muted-foreground",
        className
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  )
}

