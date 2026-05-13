import type { Metadata } from "next"

import {
  PolicySection,
  StaticPageShell,
  legalPageUpdatedAt,
  staticPageMetadata,
} from "@/app/(public)/_components/static-page-helpers"
import { getSiteConfig } from "@/lib/settings"

export const revalidate = 86400

const path = "/terms"

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()

  return staticPageMetadata({
    site,
    path,
    title: "Nutzungsbedingungen",
    description: `Lesen Sie die Nutzungsbedingungen von ${site.name} zu Website-Nutzung, Inhalten, Hinweisen, Haftungsausschlüssen und Haftungsbegrenzung.`,
  })
}

export default async function TermsPage() {
  const site = await getSiteConfig()

  return (
    <StaticPageShell
      site={site}
      path={path}
      label="Nutzungsbedingungen"
      eyebrow="Rechtliches"
      title="Nutzungsbedingungen"
      description={`Diese Bedingungen beschreiben die Nutzung von ${site.name} und der auf dieser Website veröffentlichten Inhalte.`}
    >
      <div className="mt-10 max-w-3xl space-y-8">
        <p className="text-sm text-muted-foreground">
          Zuletzt aktualisiert: {legalPageUpdatedAt}
        </p>

        <PolicySection title="Nutzung der Website">
          <p>
            Sie dürfen diese Website für rechtmäßige persönliche,
            redaktionelle, recherchierende und geschäftliche Bewertungszwecke
            nutzen. Sie verpflichten sich, die Website nicht zu missbrauchen,
            ihren Betrieb nicht zu stören und keinen unbefugten Zugriff auf
            private Bereiche zu versuchen.
          </p>
        </PolicySection>

        <PolicySection title="Rechte an Inhalten">
          <p>
            Sofern nicht anders angegeben, gehören Texte, Design, Branding und
            originale Materialien auf dieser Website {site.name} oder den
            jeweiligen Beitragenden. Produktnamen, Logos und Marken gehören
            ihren jeweiligen Eigentümern.
          </p>
        </PolicySection>

        <PolicySection title="Redaktionelle Inhalte und Hinweise">
          <p>
            Inhalte dienen ausschließlich Informationszwecken. Wir bemühen uns
            um Genauigkeit, doch Softwareprodukte, Servicepläne, Preise,
            Funktionen und Richtlinien können sich ändern. Prüfen Sie wichtige
            Details vor einer Entscheidung direkt beim jeweiligen Anbieter.
          </p>
        </PolicySection>

        <PolicySection title="Affiliate-Hinweis">
          <p>
            Diese Website kann Affiliate-Links enthalten. Wenn Sie auf einen
            Affiliate-Link klicken und etwas kaufen, können wir eine Provision
            erhalten, ohne dass Ihnen zusätzliche Kosten entstehen. Eine
            Affiliate-Beziehung ersetzt keine unabhängige Bewertung.
          </p>
        </PolicySection>

        <PolicySection title="Externe Links">
          <p>
            Die Website kann auf Websites und Dienste Dritter verlinken. Für
            deren Inhalte, Verfügbarkeit, Bedingungen, Datenschutzpraktiken oder
            Geschäftspraktiken übernehmen wir keine Verantwortung.
          </p>
        </PolicySection>

        <PolicySection title="Haftungsbegrenzung">
          <p>
            Soweit gesetzlich zulässig, haftet {site.name} nicht für Verluste
            oder Schäden, die aus der Nutzung der Website, dem Vertrauen auf
            veröffentlichte Inhalte, Diensten Dritter oder Änderungen durch
            Produktanbieter entstehen.
          </p>
        </PolicySection>

        <PolicySection title="Änderungen dieser Bedingungen">
          <p>
            Wir können diese Bedingungen aktualisieren, wenn sich die Website
            verändert. Die weitere Nutzung nach einer Aktualisierung bedeutet,
            dass Sie die jeweils aktuelle Version akzeptieren.
          </p>
        </PolicySection>
      </div>
    </StaticPageShell>
  )
}
