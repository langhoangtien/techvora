import type { Metadata } from "next"
import { MailIcon } from "lucide-react"

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
    title: "Contact",
    description: `Contact ${site.name} for editorial questions, partnerships, corrections, or product review requests.`,
  })
}

export default async function ContactPage() {
  const site = await getSiteConfig()

  return (
    <StaticPageShell
      site={site}
      path={path}
      label="Contact"
      eyebrow="Contact"
      title="Get in touch"
      description={`Contact ${site.name} about corrections, editorial questions, partnerships, or product review suggestions.`}
    >
      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold tracking-tight">Contact form</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            This form is prepared for a future backend. Submissions are not sent yet.
          </p>
          <form className="mt-6 space-y-5">
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name" required>
                    Name
                  </FieldLabel>
                  <Input id="name" name="name" required placeholder="Your name" />
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
                  Subject
                </FieldLabel>
                <Input id="subject" name="subject" required placeholder="How can we help?" />
              </Field>
              <Field>
                <FieldLabel htmlFor="message" required>
                  Message
                </FieldLabel>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={7}
                  placeholder="Write your message..."
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </Field>
              <Button type="button" disabled>
                Send message
              </Button>
            </FieldGroup>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border bg-muted/30 p-6">
            <MailIcon className="size-5 text-primary" />
            <h2 className="mt-4 font-semibold">Email</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              A public contact email has not been configured yet. Use the social
              links below when available.
            </p>
          </section>
          <section className="rounded-lg border bg-muted/30 p-6">
            <h2 className="font-semibold">Social links</h2>
            <div className="mt-4">
              <SocialLinks site={site} />
            </div>
          </section>
        </aside>
      </div>
    </StaticPageShell>
  )
}
