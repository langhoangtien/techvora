import Link from "next/link"
import { IconArrowRight as ArrowRightIcon } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

type CategoryCardProps = React.ComponentProps<"article"> & {
  name: string
  href: string
  description?: string
}

export function CategoryCard({
  name,
  href,
  description,
  className,
  ...props
}: CategoryCardProps) {
  return (
    <article className={cn("rounded-lg border bg-card p-5", className)} {...props}>
      <Link href={href} className="flex items-center justify-between gap-4">
        <span className="font-medium">{name}</span>
        <ArrowRightIcon className="size-4 text-muted-foreground" />
      </Link>
      {description ? (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </article>
  )
}
