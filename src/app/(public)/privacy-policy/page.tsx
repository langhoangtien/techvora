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
    title: "Privacy Policy",
    description: `Read the ${site.name} privacy policy, including information about analytics, cookies, advertising, affiliates, and third-party services.`,
  })
}

export default async function PrivacyPolicyPage() {
  const site = await getSiteConfig()

  return (
    <StaticPageShell
      site={site}
      path={path}
      label="Privacy Policy"
      eyebrow="Legal"
      title="Privacy Policy"
      description={`This policy explains how ${site.name} may collect, use, and protect information when you use this website.`}
    >
      <div className="mt-10 max-w-3xl space-y-8">
        <p className="text-sm text-muted-foreground">
          Last updated: {legalPageUpdatedAt}
        </p>

        <PolicySection title="Information we collect">
          <p>
            We may collect basic information that you choose to provide, such as
            your name, email address, subject, and message when a contact form or
            similar feature is enabled.
          </p>
          <p>
            The website may also collect technical information such as browser
            type, device information, referring pages, approximate location, and
            usage activity through analytics or server logs.
          </p>
        </PolicySection>

        <PolicySection title="Analytics">
          <p>
            We may use analytics services to understand traffic patterns, page
            performance, and content engagement. Analytics data is used to
            improve the website and prioritize useful content.
          </p>
        </PolicySection>

        <PolicySection title="Cookies">
          <p>
            This website may use cookies or similar technologies for analytics,
            preferences, security, advertising, and affiliate attribution.
            Browser settings usually allow you to block or delete cookies.
          </p>
        </PolicySection>

        <PolicySection title="Advertising and Google AdSense preparation">
          <p>
            The website may display advertising in the future, including Google
            AdSense or similar advertising networks. Advertising partners may use
            cookies or other identifiers to measure ad performance and deliver
            relevant ads according to their own policies.
          </p>
        </PolicySection>

        <PolicySection title="Affiliate disclosure">
          <p>
            Some links may be affiliate links. If you click an affiliate link and
            make a purchase, we may earn a commission at no additional cost to
            you. Affiliate relationships do not guarantee positive coverage.
          </p>
        </PolicySection>

        <PolicySection title="Media uploads">
          <p>
            If media upload features are available to authorized users, uploaded
            files may be processed, resized, optimized, and stored for use on the
            website. Do not upload files that you do not have permission to use.
          </p>
        </PolicySection>

        <PolicySection title="Third-party services">
          <p>
            The website may link to or integrate with third-party services such
            as analytics providers, advertising networks, affiliate platforms,
            social networks, service providers, and embedded content providers.
            Their privacy practices are governed by their own policies.
          </p>
        </PolicySection>

        <PolicySection title="Changes to this policy">
          <p>
            We may update this policy as the website evolves. The latest version
            will be published on this page with an updated date.
          </p>
        </PolicySection>
      </div>
    </StaticPageShell>
  )
}
