import type { Metadata } from "next"

import { siteConfig } from "@/config/site"

type SeoInput = {
  title?: string | null
  description?: string | null
  path?: string
  image?: string | null
  noIndex?: boolean | null
  canonical?: string | null
  type?: "website" | "article"
}

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) {
    return path
  }

  return new URL(path, siteConfig.url).toString()
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex,
  canonical,
  type = "website",
}: SeoInput = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const pageDescription = description ?? siteConfig.description
  const url = canonical ?? absoluteUrl(path)
  const images = image ? [{ url: absoluteUrl(image) }] : undefined

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: url,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url,
      siteName: siteConfig.name,
      locale: "en_US",
      type,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: pageTitle,
      description: pageDescription,
      images: image ? [absoluteUrl(image)] : undefined,
    },
  }
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  }
}
