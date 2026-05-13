import { cn } from "@/lib/utils"

export function AdSlot({
  label = "Anzeige",
  className,
  ...props
}: React.ComponentProps<"aside"> & { label?: string }) {
  return (
    <aside
      className={cn(
        "flex min-h-28 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-xs uppercase tracking-[0.16em] text-muted-foreground",
        className
      )}
      {...props}
    >
      {label}
    </aside>
  )
}

