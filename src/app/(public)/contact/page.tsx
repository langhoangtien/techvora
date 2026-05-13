import type { Metadata } from "next"
import { IconMail  } from "@tabler/icons-react"

import {
  SocialLinks,
  StaticPageShell,
  staticPageMetadata,
} from "@/app/(public)/_components/static-page-helpers"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getSiteConfig } from "@/lib/settings"

export const revalidate = 86400

const path = "/contact"

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()

  return staticPageMetadata({
    site,
    path,
    title: "Kontakt",
    description: `Kontaktieren Sie ${site.name} für redaktionelle Fragen, Partnerschaften, Korrekturen oder Produktvorschläge.`,
  })
}

export default async function ContactPage() {
  const site = await getSiteConfig()

  return (
    <StaticPageShell
      site={site}
      path={path}
      label="Kontakt"
      eyebrow="Kontakt"
      title="Nehmen Sie Kontakt auf"
      description={`Kontaktieren Sie ${site.name} zu Korrekturen, redaktionellen Fragen, Partnerschaften oder Vorschlägen für Produktbewertungen.`}
    >
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">Kontaktformular</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Dieses Formular ist für ein späteres Backend vorbereitet. Nachrichten werden derzeit noch nicht versendet.
          </p>
          <form className="mt-6 space-y-5">
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name" required>
                    Name
                  </FieldLabel>
                  <Input id="name" name="name" required placeholder="Ihr Name" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="email" required>
                    Email
                  </FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="subject" required>
                  Betreff
                </FieldLabel>
                <Input id="subject" name="subject" required placeholder="Wobei können wir helfen?" />
              </Field>
              <Field>
                <FieldLabel htmlFor="message" required>
                  Nachricht
                </FieldLabel>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={7}
                  placeholder="Schreiben Sie Ihre Nachricht..."
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-0 focus-visible:ring-ring/50"
                />
              </Field>
              <Button type="button" disabled>
                Nachricht senden
              </Button>
            </FieldGroup>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border bg-muted/30 p-6">
            <IconMail className="size-5 text-primary" />
            <h2 className="mt-4 font-semibold">Email</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Eine öffentliche Kontaktadresse ist noch nicht eingerichtet.
              Nutzen Sie bei Bedarf die verfügbaren Social-Links unten.
            </p>
          </section>
          <section className="rounded-lg border bg-muted/30 p-6">
            <h2 className="font-semibold">Social Links</h2>
            <div className="mt-4">
              <SocialLinks site={site} />
            </div>
          </section>
        </aside>
      </div>
    </StaticPageShell>
  )
}
