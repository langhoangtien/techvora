import Link from "next/link"

import { Container } from "@/components/layout/container"
import { siteConfig as fallbackSiteConfig } from "@/config/site"
import type { SiteConfigFromSettings } from "@/lib/settings"

const footerLinks = [
  { title: "Tools", href: "/tools" },
  { title: "Articles", href: "/articles" },
  { title: "Hosting", href: "/hosting" },
  { title: "SaaS", href: "/saas" },
  { title: "Compare", href: "/compare" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
  { title: "Privacy Policy", href: "/privacy-policy" },
  { title: "Terms", href: "/terms" },
]

const socialLabels = {
  twitterUrl: "X",
  facebookUrl: "Facebook",
  linkedinUrl: "LinkedIn",
  githubUrl: "GitHub",
  youtubeUrl: "YouTube",
} as const

export function SiteFooter({ config }: { config?: SiteConfigFromSettings }) {
  const siteName = config?.name ?? fallbackSiteConfig.name
  const footerDescription =
    config?.footer.footerDescription ?? fallbackSiteConfig.description
  const copyrightText =
    config?.footer.copyrightText ??
    `Copyright ${new Date().getFullYear()} ${siteName}. All rights reserved.`
  const socialLinks = config?.social
    ? Object.entries(socialLabels)
        .map(([key, label]) => ({
          label,
          href: config.social[key as keyof typeof socialLabels],
        }))
        .filter((item) => item.href)
    : []

  return (
    <footer className="border-t bg-muted/30">
      <Container className="grid gap-8 py-10 md:grid-cols-[1fr_auto]">
        <div className="max-w-md">
          <p className="font-semibold">{siteName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {footerDescription}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">{copyrightText}</p>
        </div>
        <div className="space-y-5 md:text-right">
          <nav className="flex max-w-xl flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground md:justify-end">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </nav>
          {socialLinks.length > 0 ? (
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground md:justify-end">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          ) : null}
        </div>
      </Container>
    </footer>
  )
}
