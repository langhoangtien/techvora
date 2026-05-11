import type { Metadata } from "next"

import { Breadcrumb } from "@/components/layout/breadcrumb"
import { Container } from "@/components/layout/container"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import type { SiteConfigFromSettings } from "@/lib/settings"
import { cn } from "@/lib/utils"

export const legalPageUpdatedAt = "May 11, 2026"

export function staticPageMetadata({
  site,
  path,
  title,
  description,
}: {
  site: SiteConfigFromSettings
  path: string
  title: string
  description: string
}): Metadata {
  const url = new URL(path, site.url).toString()
  const image = site.ogImage ? new URL(site.ogImage, site.url).toString() : undefined

  return {
    title: `${title} | ${site.name}`,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: site.robots.index,
      follow: site.robots.follow,
    },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: `${title} | ${site.name}`,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export function breadcrumbJsonLd({
  site,
  path,
  label,
}: {
  site: SiteConfigFromSettings
  path: string
  label: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: label,
        item: new URL(path, site.url).toString(),
      },
    ],
  }
}

export function StaticPageShell({
  site,
  path,
  label,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  site: SiteConfigFromSettings
  path: string
  label: string
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <>
      <SeoJsonLd data={breadcrumbJsonLd({ site, path, label })} />
      <Container className={cn("py-10 md:py-14", className)}>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label }]} />
        <header className="mt-10 max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            {description}
          </p>
        </header>
        {children}
      </Container>
    </>
  )
}

export function PolicySection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-7 text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

export function SocialLinks({ site }: { site: SiteConfigFromSettings }) {
  const links = [
    { label: "X", href: site.social.twitterUrl },
    { label: "Facebook", href: site.social.facebookUrl },
    { label: "LinkedIn", href: site.social.linkedinUrl },
    { label: "GitHub", href: site.social.githubUrl },
    { label: "YouTube", href: site.social.youtubeUrl },
  ].filter((item) => item.href)

  if (links.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {item.label}
        </a>
      ))}
    </div>
  )
}
