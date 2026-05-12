import Link from "next/link"
import { ArrowUpRightIcon, SearchIcon } from "lucide-react"

import { Container } from "@/components/layout/container"
import { publicNavItems, siteConfig as fallbackSiteConfig } from "@/config/site"
import type { SiteConfigFromSettings, SocialSettings } from "@/lib/settings"

const resourceLinks = [
  {
    title: "Search library",
    href: "/search",
    icon: <SearchIcon className="size-4" />,
  },
  { title: "Latest articles", href: "/articles" },
  { title: "Product comparisons", href: "/compare" },
]

const companyLinks = [
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
]

const legalLinks = [
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms", href: "/terms" },
]

const socialItems: Array<{
  key: keyof SocialSettings
  label: string
  icon: "x" | "facebook" | "linkedin" | "github" | "youtube"
}> = [
  { key: "twitterUrl", label: "X / Twitter", icon: "x" },
  { key: "facebookUrl", label: "Facebook", icon: "facebook" },
  { key: "linkedinUrl", label: "LinkedIn", icon: "linkedin" },
  { key: "githubUrl", label: "GitHub", icon: "github" },
  { key: "youtubeUrl", label: "YouTube", icon: "youtube" },
]

function FooterGroup({
  title,
  links,
}: {
  title: string
  links: Array<{ title: string; href: string; icon?: React.ReactNode }>
}) {
  return (
    <div>
      <h2 className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {title}
      </h2>
      <ul className="mt-4 grid gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/85 transition-colors hover:text-primary"
            >
              {link.icon}
              {link.title}
              <ArrowUpRightIcon className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SocialIcon({
  name,
}: {
  name: "x" | "facebook" | "linkedin" | "github" | "youtube"
}) {
  const paths = {
    x: "M13.9 10.5 20.8 2h-1.6l-6 7.4L8.4 2H3l7.2 11.1L3 22h1.6l6.3-7.8L16 22h5.4l-7.5-11.5Zm-2.2 2.7-.7-1.1L5.2 3.3h2.4l4.7 7.1.7 1.1 6.1 9.2h-2.4l-5-7.5Z",
    facebook:
      "M14 8.5V6.8c0-.8.6-1.1 1.2-1.1h1.7V2.2S15.4 2 13.9 2c-3.1 0-5.1 1.9-5.1 5.2v1.3H5.5v3.9h3.3V22H14v-9.6h3.5l.6-3.9H14Z",
    linkedin:
      "M6.9 8.7H2.8V22h4.1V8.7ZM4.8 2C3.5 2 2.5 3 2.5 4.2s1 2.2 2.3 2.2 2.3-1 2.3-2.2S6.1 2 4.8 2Zm16.7 12.5c0-4-2.1-5.9-5-5.9-2.3 0-3.3 1.3-3.9 2.2V8.7H8.7V22h4.1v-6.6c0-1.7.3-3.4 2.5-3.4s2.2 2 2.2 3.5V22h4.1v-7.5Z",
    github:
      "M12 2C6.5 2 2 6.6 2 12.2c0 4.5 2.9 8.3 6.8 9.6.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 2.9.9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.7 0 0 .9-.3 2.8 1.1.8-.2 1.6-.3 2.5-.3s1.7.1 2.5.3c1.9-1.4 2.8-1.1 2.8-1.1.5 1.4.2 2.4.1 2.7.6.8 1 1.7 1 2.8 0 3.9-2.4 4.8-4.6 5 .4.3.7 1 .7 2.1v3c0 .3.2.6.7.5 4-1.3 6.8-5.1 6.8-9.6C22 6.6 17.5 2 12 2Z",
    youtube:
      "M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4s-3.8 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM10.1 14.8V8.6l5.8 3.1-5.8 3.1Z",
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4 fill-current">
      <path d={paths[name]} />
    </svg>
  )
}

export function SiteFooter({ config }: { config?: SiteConfigFromSettings }) {
  const siteName = config?.name ?? fallbackSiteConfig.name
  const logoUrl = config?.logoUrl
  const footerDescription =
    config?.footer.footerDescription || fallbackSiteConfig.description
  const copyrightText =
    config?.footer.copyrightText ||
    `Copyright ${new Date().getFullYear()} ${siteName}. All rights reserved.`
  const socialLinks = config?.social
    ? socialItems
        .map((item) => ({
          ...item,
          href: config.social[item.key],
        }))
        .filter((item) => item.href)
    : []

  return (
    <footer className="border-t bg-muted/30">
      <Container className="py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={siteName}
                  className="h-9 max-w-36 rounded-md object-contain"
                />
              ) : (
                <>
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background">
                    {siteName.slice(0, 1)}
                  </span>
                  <span className="text-lg font-semibold tracking-tight">
                    {siteName}
                  </span>
                </>
              )}
            </Link>

            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {footerDescription}
            </p>

            {socialLinks.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map((item) => (
                  <a
                    key={item.key}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="inline-flex size-9 items-center justify-center rounded-lg border bg-background text-muted-foreground transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
                  >
                    <SocialIcon name={item.icon} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <FooterGroup title="Content" links={publicNavItems} />
            <FooterGroup title="Resources" links={resourceLinks} />
            <FooterGroup title="Company" links={companyLinks} />
            <FooterGroup title="Legal" links={legalLinks} />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>{copyrightText}</p>
          <p>
            Independent research for software, SaaS, hosting, and
            infrastructure.
          </p>
        </div>
      </Container>
    </footer>
  )
}
