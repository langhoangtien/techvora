import Link from "next/link"

import { cn } from "@/lib/utils"

type ArticleCardProps = React.ComponentProps<"article"> & {
  title: string
  href: string
  excerpt?: string
  category?: string
  author?: string
  publishedAt?: string
  imageUrl?: string | null
}

export function ArticleCard({
  title,
  href,
  excerpt,
  category,
  author,
  publishedAt,
  imageUrl,
  className,
  ...props
}: ArticleCardProps) {
  return (
    <article
      className={cn(
        "rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20",
        className
      )}
      {...props}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="-mx-5 -mt-5 mb-5 aspect-video w-[calc(100%+2.5rem)] object-cover"
        />
      ) : null}
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {category ? <span>{category}</span> : null}
        {category && author ? <span aria-hidden="true">/</span> : null}
        {author ? <span>{author}</span> : null}
        {(category || author) && publishedAt ? <span aria-hidden="true">/</span> : null}
        {publishedAt ? <time dateTime={publishedAt}>{publishedAt}</time> : null}
      </div>
      <h3 className="text-base font-semibold leading-snug">
        <Link href={href}>{title}</Link>
      </h3>
      {excerpt ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
          {excerpt}
        </p>
      ) : null}
    </article>
  )
}
