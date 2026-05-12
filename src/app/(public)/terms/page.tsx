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
    title: "Terms",
    description: `Read the ${site.name} terms covering website usage, content ownership, disclosures, disclaimers, and limitations of liability.`,
  })
}

export default async function TermsPage() {
  const site = await getSiteConfig()

  return (
    <StaticPageShell
      site={site}
      path={path}
      label="Terms"
      eyebrow="Legal"
      title="Terms"
      description={`These terms describe the conditions for using ${site.name} and the content published on this website.`}
    >
      <div className="mt-10 max-w-3xl space-y-8">
        <p className="text-sm text-muted-foreground">
          Last updated: {legalPageUpdatedAt}
        </p>

        <PolicySection title="Website usage">
          <p>
            You may use this website for lawful personal, editorial, research,
            and business evaluation purposes. You agree not to misuse the
            website, interfere with its operation, or attempt unauthorized
            access to private areas.
          </p>
        </PolicySection>

        <PolicySection title="Content ownership">
          <p>
            Unless otherwise stated, text, design, branding, and original
            materials published on this website are owned by {site.name} or its
            contributors. Product names, logos, and trademarks belong to their
            respective owners.
          </p>
        </PolicySection>

        <PolicySection title="Editorial content and disclaimers">
          <p>
            Content is provided for informational purposes only. We aim for
            accuracy, but software products, service plans, prices, features,
            and policies can change. You should verify important details with
            the relevant provider before making a decision.
          </p>
        </PolicySection>

        <PolicySection title="Affiliate disclosure">
          <p>
            This website may include affiliate links. We may receive a
            commission when you click an affiliate link and make a purchase, at
            no additional cost to you. Affiliate relationships do not remove the
            need for independent evaluation.
          </p>
        </PolicySection>

        <PolicySection title="External links">
          <p>
            The website may link to third-party websites and services. We are
            not responsible for their content, availability, terms, privacy
            practices, or business practices.
          </p>
        </PolicySection>

        <PolicySection title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, {site.name} is not liable
            for losses or damages resulting from use of the website, reliance on
            published content, third-party services, or changes made by product
            providers.
          </p>
        </PolicySection>

        <PolicySection title="Changes to these terms">
          <p>
            We may update these terms as the website changes. Continued use of
            the website after updates means you accept the current version.
          </p>
        </PolicySection>
      </div>
    </StaticPageShell>
  )
}
