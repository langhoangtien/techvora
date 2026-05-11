import { cn } from "@/lib/utils"

export function ContentRenderer({
  html,
  className,
}: {
  html: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "tiptap-content max-w-none",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
