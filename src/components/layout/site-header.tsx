import Link from "next/link"
import { MenuIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { siteConfig as fallbackSiteConfig } from "@/config/site"
import type { SiteConfigFromSettings } from "@/lib/settings"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Tools", href: "/tools" },
  { title: "Articles", href: "/articles" },
  { title: "Hosting", href: "/hosting" },
  { title: "SaaS", href: "/saas" },
  { title: "Compare", href: "/compare" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Privacy", href: "/privacy-policy" },
  { title: "Terms", href: "/terms" },
]

export function SiteHeader({
  className,
  config,
}: {
  className?: string
  config?: SiteConfigFromSettings
}) {
  const siteName = config?.name ?? fallbackSiteConfig.name
  const logoUrl = config?.logoUrl

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl",
        className
      )}
    >
      <Container className="relative flex h-14 items-center justify-between gap-6">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoUrl}
              alt={siteName}
              className="h-6 max-w-28 rounded-md object-contain"
            />
          ) : (
            <>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground text-xs text-background">
                {siteName.slice(0, 1)}
              </span>
              <span className="truncate">{siteName}</span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-muted-foreground lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-foreground"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <details className="group lg:hidden">
          <summary className="flex size-9 cursor-pointer list-none items-center justify-center rounded-lg border bg-background text-foreground [&::-webkit-details-marker]:hidden">
            <MenuIcon className="size-4" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <div className="absolute inset-x-4 top-14 rounded-lg border bg-background p-2 shadow-lg">
            <nav className="grid text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </div>
        </details>
      </Container>
    </header>
  )
}
