import { cn } from "@/lib/utils"

type SectionHeaderProps = React.ComponentProps<"div"> & {
  eyebrow?: string
  title: string
  description?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn("max-w-2xl space-y-3", className)} {...props}>
      {eyebrow ? (
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="text-base leading-7 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}

