import Link from "next/link"
import {
  ArrowRightIcon,
  ChevronDownIcon,
  MenuIcon,
  SearchIcon,
} from "lucide-react"

import { Container } from "@/components/layout/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { siteConfig as fallbackSiteConfig } from "@/config/site"
import type { SiteConfigFromSettings } from "@/lib/settings"
import { cn } from "@/lib/utils"

export type HeaderCategoryNavItem = {
  id: string
  name: string
  slug: string
  children: Array<{
    id: string
    name: string
    slug: string
  }>
}

const staticNavItems = [
  { title: "Tools", href: "/tools" },
  { title: "Compare", href: "/compare" },
]

function categoryHref(slug: string) {
  return `/categories/${slug}`
}

function DesktopCategoryNavItem({
  category,
}: {
  category: HeaderCategoryNavItem
}) {
  const href = categoryHref(category.slug)

  if (category.children.length === 0) {
    return (
      <Link
        href={href}
        className="rounded-md px-3 py-2 font-medium transition-colors hover:bg-muted hover:text-foreground"
      >
        {category.name}
      </Link>
    )
  }

  return (
    <div className="group relative">
      <Link
        href={href}
        className="flex items-center gap-1 rounded-md px-3 py-2 font-medium transition-colors hover:bg-muted hover:text-foreground"
      >
        {category.name}
        <ChevronDownIcon className="size-3.5 transition-transform group-hover:rotate-180" />
      </Link>
      <div className="invisible absolute left-0 top-full z-50 w-64 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="rounded-lg border bg-popover p-2 text-popover-foreground shadow-lg">
          <Link
            href={href}
            className="block rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            View all {category.name}
          </Link>
          <div className="my-1 h-px bg-border" />
          {category.children.map((child) => (
            <Link
              key={child.id}
              href={categoryHref(child.slug)}
              className="block rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-foreground"
            >
              {child.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SiteHeader({
  className,
  config,
  categoryNavItems = [],
}: {
  className?: string
  config?: SiteConfigFromSettings
  categoryNavItems?: HeaderCategoryNavItem[]
}) {
  const siteName = config?.name ?? fallbackSiteConfig.name
  const logoUrl = config?.logoUrl

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/90 backdrop-blur-xl",
        className
      )}
    >
      <Container className="relative flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 font-semibold tracking-tight"
        >
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName}
              className="h-8 max-w-36 rounded-md object-contain"
            />
          ) : (
            <>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-sm text-background">
                {siteName.slice(0, 1)}
              </span>
              <span className="truncate text-lg">{siteName}</span>
            </>
          )}
        </Link>

        <div className="hidden flex-1 items-center justify-between gap-6 lg:flex">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link
              href={staticNavItems[0].href}
              className="rounded-md px-3 py-2 font-medium transition-colors hover:bg-muted hover:text-foreground"
            >
              {staticNavItems[0].title}
            </Link>
            {categoryNavItems.map((category) => (
              <DesktopCategoryNavItem key={category.id} category={category} />
            ))}
            <Link
              href={staticNavItems[1].href}
              className="rounded-md px-3 py-2 font-medium transition-colors hover:bg-muted hover:text-foreground"
            >
              {staticNavItems[1].title}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <form action="/search" className="w-72">
              <div className="flex h-10 items-center gap-2 rounded-full border bg-muted/40 px-3 transition-colors focus-within:border-primary/40 focus-within:bg-background">
                <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search tools and Services..."
                  className="h-9 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                />
              </div>
            </form>

            <Button asChild className="rounded-full">
              <Link href="/compare">
                Compare
                <ArrowRightIcon className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <details className="group lg:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border bg-background text-foreground transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
            <MenuIcon className="size-4" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <div className="fixed inset-x-0 top-16 border-b bg-background shadow-lg">
            <Container className="py-4">
              <form action="/search" className="mb-3">
                <div className="flex h-11 items-center gap-2 rounded-full border bg-muted/40 px-3">
                  <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
                  <Input
                    name="q"
                    placeholder="Search tools and Services..."
                    className="h-10 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
              </form>

              <nav className="grid gap-1 text-sm">
                <Link
                  href={staticNavItems[0].href}
                  className="rounded-md px-3 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {staticNavItems[0].title}
                </Link>
                {categoryNavItems.map((category) => (
                  <div key={category.id}>
                    <Link
                      href={categoryHref(category.slug)}
                      className="flex items-center justify-between rounded-md px-3 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {category.name}
                      {category.children.length > 0 ? (
                        <ChevronDownIcon className="size-4 text-muted-foreground" />
                      ) : null}
                    </Link>
                    {category.children.length > 0 ? (
                      <div className="ml-3 grid gap-1 border-l pl-3">
                        {category.children.map((child) => (
                          <Link
                            key={child.id}
                            href={categoryHref(child.slug)}
                            className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
                <Link
                  href={staticNavItems[1].href}
                  className="rounded-md px-3 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {staticNavItems[1].title}
                </Link>
              </nav>

              <Button asChild className="mt-4 w-full rounded-full">
                <Link href="/compare">
                  Compare tools
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
            </Container>
          </div>
        </details>
      </Container>
    </header>
  )
}
