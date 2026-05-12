import Link from "next/link"
import type { Metadata } from "next"
import {
  BookOpenIcon,
  GitCompareIcon,
  Layers3Icon,
  WrenchIcon,
} from "lucide-react"

import {
  SocialLinks,
  StaticPageShell,
  staticPageMetadata,
} from "@/app/(public)/_components/static-page-helpers"
import { SectionHeader } from "@/components/layout/section-header"
import { getSiteConfig } from "@/lib/settings"

export const revalidate = 86400

const path = "/about"

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()

  return staticPageMetadata({
    site,
    path,
    title: "About",
    description: `Learn about ${site.name}, an independent platform for practical software, Services, and tooling research.`,
  })
}

const offerings = [
  {
    title: "Tools",
    description: "Practical utilities and references for everyday technical workflows.",
    href: "/tools",
    icon: WrenchIcon,
  },
  {
    title: "Tutorials",
    description: "Clear guides for choosing, configuring, and using modern software products.",
    href: "/articles",
    icon: BookOpenIcon,
  },
  {
    title: "Services reviews",
    description: "Concise evaluations of online services, pricing models, and use cases.",
    href: "/services",
    icon: Layers3Icon,
  },
  {
    title: "Comparisons",
    description: "Side-by-side analysis to help readers understand practical differences.",
    href: "/compare",
    icon: GitCompareIcon,
  },
]

export default async function AboutPage() {
  const site = await getSiteConfig()

  return (
    <StaticPageShell
      site={site}
      path={path}
      label="About"
      eyebrow="About"
      title={site.name}
      description={site.tagline || site.seoDescription}
    >
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section className="rounded-lg border bg-card p-6">
            <SectionHeader
              title="Independent research for technical decisions"
              description={
                site.footer.footerDescription ||
                "We publish practical resources for people comparing software, infrastructure, and technical tools."
              }
            />
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {site.name} focuses on useful, readable guidance for builders,
              operators, and technical buyers. The goal is to reduce research
              friction by organizing tools, tutorials, Services, and
              comparisons in one consistent public library.
            </p>
          </section>

          <section className="space-y-5">
            <SectionHeader
              eyebrow="Mission"
              title="Make software and infrastructure choices easier"
              description="Our mission is to turn scattered product research into practical guidance that readers can evaluate quickly and revisit when their needs change."
            />
          </section>

          <section className="space-y-5">
            <SectionHeader
              eyebrow="What we offer"
              title="A focused directory for modern technical work"
              description="Each section is designed to be useful without unnecessary clutter."
            />
            <div className="grid gap-4 md:grid-cols-2">
              {offerings.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-lg border bg-card p-5 transition-colors hover:border-primary/40"
                  >
                    <Icon className="size-5 text-primary" />
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border bg-muted/30 p-6">
          <h2 className="font-semibold">Team</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {site.name} is maintained as an editorial and product research
            platform. A detailed founder and team profile can be added here as
            the publication grows.
          </p>
          <div className="mt-6">
            <h3 className="text-sm font-medium">Follow</h3>
            <div className="mt-3">
              <SocialLinks site={site} />
            </div>
          </div>
        </aside>
      </div>
    </StaticPageShell>
  )
}
