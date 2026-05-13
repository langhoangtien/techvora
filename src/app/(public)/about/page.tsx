import Link from "next/link"
import type { Metadata } from "next"
import {
  IconBook2 as BookOpenIcon,
  IconGitCompare as GitCompareIcon,
  IconLayersIntersect as Layers3Icon,
  IconTool as WrenchIcon,
} from "@tabler/icons-react"

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
    title: "Über Tekvora",
    description: `Erfahren Sie mehr über ${site.name}, eine unabhängige Plattform für praxisnahe Software-, Service- und Tool-Recherche.`,
  })
}

const offerings = [
  {
    title: "Tools",
    description: "Praktische Werkzeuge und Referenzen für technische Arbeitsabläufe.",
    href: "/tools",
    icon: WrenchIcon,
  },
  {
    title: "Ratgeber",
    description: "Klare Leitfäden zur Auswahl, Konfiguration und Nutzung moderner Softwareprodukte.",
    href: "/articles",
    icon: BookOpenIcon,
  },
  {
    title: "Service-Tests",
    description: "Kompakte Bewertungen von Online-Services, Preismodellen und Einsatzfällen.",
    href: "/services",
    icon: Layers3Icon,
  },
  {
    title: "Vergleiche",
    description: "Direkte Analysen, die praktische Unterschiede verständlich machen.",
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
      label="Über Tekvora"
      eyebrow="Über Tekvora"
      title={site.name}
      description={site.tagline || site.seoDescription}
    >
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section className="rounded-lg border bg-card p-6">
            <SectionHeader
              title="Unabhängige Recherche für technische Entscheidungen"
              description={
                site.footer.footerDescription ||
                "Wir veröffentlichen praxisnahe Ressourcen für Menschen, die Software, Infrastruktur und technische Tools vergleichen."
              }
            />
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {site.name} bietet verständliche Orientierung für Entwickler,
              Betreiber und technische Entscheider. Ziel ist es, Recherche zu
              vereinfachen, indem Tools, Ratgeber, Services und Vergleiche in
              einer konsistenten öffentlichen Bibliothek gebündelt werden.
            </p>
          </section>

          <section className="space-y-5">
            <SectionHeader
              eyebrow="Mission"
              title="Software- und Infrastrukturentscheidungen erleichtern"
              description="Unsere Mission ist es, verstreute Produktrecherche in praktische Orientierung zu übersetzen, die Leser schnell bewerten und bei neuen Anforderungen erneut nutzen können."
            />
          </section>

          <section className="space-y-5">
            <SectionHeader
              eyebrow="Angebot"
              title="Ein fokussiertes Verzeichnis für moderne technische Arbeit"
              description="Jeder Bereich ist auf Nutzwert ausgelegt, ohne unnötige Ablenkung."
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
            {site.name} wird als redaktionelle Plattform für Produktrecherche
            gepflegt. Ein ausführliches Gründer- und Teamprofil kann ergänzt
            werden, sobald die Publikation weiter wächst.
          </p>
          <div className="mt-6">
            <h3 className="text-sm font-medium">Folgen</h3>
            <div className="mt-3">
              <SocialLinks site={site} />
            </div>
          </div>
        </aside>
      </div>
    </StaticPageShell>
  )
}
