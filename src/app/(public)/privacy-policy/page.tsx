import type { Metadata } from "next"

import {
  PolicySection,
  StaticPageShell,
  legalPageUpdatedAt,
  staticPageMetadata,
} from "@/app/(public)/_components/static-page-helpers"
import { getSiteConfig } from "@/lib/settings"

export const revalidate = 86400

const path = "/privacy-policy"

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()

  return staticPageMetadata({
    site,
    path,
    title: "Datenschutzerklärung",
    description: `Lesen Sie die Datenschutzerklärung von ${site.name} mit Informationen zu Analytics, Cookies, Werbung, Affiliate-Links und Drittanbietern.`,
  })
}

export default async function PrivacyPolicyPage() {
  const site = await getSiteConfig()

  return (
    <StaticPageShell
      site={site}
      path={path}
      label="Datenschutzerklärung"
      eyebrow="Rechtliches"
      title="Datenschutzerklärung"
      description={`Diese Erklärung beschreibt, wie ${site.name} Informationen erheben, verwenden und schützen kann, wenn Sie diese Website nutzen.`}
    >
      <div className="mt-10 max-w-3xl space-y-8">
        <p className="text-sm text-muted-foreground">
          Zuletzt aktualisiert: {legalPageUpdatedAt}
        </p>

        <PolicySection title="Welche Informationen wir erfassen">
          <p>
            Wir können grundlegende Informationen erfassen, die Sie freiwillig
            bereitstellen, etwa Name, E-Mail-Adresse, Betreff und Nachricht,
            wenn ein Kontaktformular oder eine ähnliche Funktion aktiviert ist.
          </p>
          <p>
            Außerdem kann die Website technische Informationen wie Browsertyp,
            Gerätedaten, verweisende Seiten, ungefähren Standort und
            Nutzungsaktivitäten über Analytics oder Server-Logs erfassen.
          </p>
        </PolicySection>

        <PolicySection title="Analytics">
          <p>
            Wir können Analytics-Dienste einsetzen, um Traffic-Muster,
            Seitenleistung und die Nutzung von Inhalten zu verstehen. Diese
            Daten helfen, die Website zu verbessern und nützliche Inhalte zu
            priorisieren.
          </p>
        </PolicySection>

        <PolicySection title="Cookies">
          <p>
            Diese Website kann Cookies oder ähnliche Technologien für
            Analytics, Präferenzen, Sicherheit, Werbung und Affiliate-Zuordnung
            verwenden. In den meisten Browsern können Sie Cookies blockieren
            oder löschen.
          </p>
        </PolicySection>

        <PolicySection title="Werbung und Vorbereitung auf Google AdSense">
          <p>
            Die Website kann künftig Werbung anzeigen, einschließlich Google
            AdSense oder ähnlicher Werbenetzwerke. Werbepartner können Cookies
            oder andere Kennungen verwenden, um Anzeigenleistung zu messen und
            relevante Anzeigen nach ihren eigenen Richtlinien auszuliefern.
          </p>
        </PolicySection>

        <PolicySection title="Affiliate-Hinweis">
          <p>
            Einige Links können Affiliate-Links sein. Wenn Sie auf einen solchen
            Link klicken und etwas kaufen, können wir eine Provision erhalten,
            ohne dass Ihnen zusätzliche Kosten entstehen. Affiliate-Beziehungen
            garantieren keine positive Berichterstattung.
          </p>
        </PolicySection>

        <PolicySection title="Medien-Uploads">
          <p>
            Wenn Upload-Funktionen für autorisierte Nutzer verfügbar sind,
            können hochgeladene Dateien verarbeitet, skaliert, optimiert und
            für die Nutzung auf der Website gespeichert werden. Laden Sie keine
            Dateien hoch, für die Ihnen die Nutzungsrechte fehlen.
          </p>
        </PolicySection>

        <PolicySection title="Dienste Dritter">
          <p>
            Die Website kann auf Dienste Dritter verlinken oder diese
            integrieren, etwa Analytics-Anbieter, Werbenetzwerke,
            Affiliate-Plattformen, soziale Netzwerke, Serviceanbieter oder
            eingebettete Inhalte. Für deren Datenschutzpraktiken gelten die
            jeweiligen eigenen Richtlinien.
          </p>
        </PolicySection>

        <PolicySection title="Änderungen dieser Erklärung">
          <p>
            Wir können diese Erklärung aktualisieren, wenn sich die Website
            weiterentwickelt. Die aktuelle Version wird mit aktualisiertem Datum
            auf dieser Seite veröffentlicht.
          </p>
        </PolicySection>
      </div>
    </StaticPageShell>
  )
}
