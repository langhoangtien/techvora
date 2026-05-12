import type { MetadataRoute } from "next"

import { getSiteConfig } from "@/lib/settings"
import { getSitemapComparisons } from "@/modules/comparisons/public"
import { getSitemapArticles } from "@/modules/posts/public"
import { getSitemapServices } from "@/modules/services/public"
import { getSitemapTools } from "@/modules/tools/public"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, articles, tools, services, comparisons] = await Promise.all([
    getSiteConfig(),
    getSitemapArticles(),
    getSitemapTools(),
    getSitemapServices(),
    getSitemapComparisons(),
  ])

  const staticPages = [
    { path: "/about", priority: 0.6 },
    { path: "/contact", priority: 0.6 },
    { path: "/privacy-policy", priority: 0.4 },
    { path: "/terms", priority: 0.4 },
  ]

  return [
    {
      url: site.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: new URL("/articles", site.url).toString(),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: new URL("/tools", site.url).toString(),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: new URL("/services", site.url).toString(),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: new URL("/compare", site.url).toString(),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    ...staticPages.map((page) => ({
      url: new URL(page.path, site.url).toString(),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: page.priority,
    })),
    ...articles.map((article) => ({
      url: new URL(`/articles/${article.slug}`, site.url).toString(),
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...tools.map((tool) => ({
      url: new URL(`/tools/${tool.slug}`, site.url).toString(),
      lastModified: tool.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...services.map((product) => ({
      url: new URL(`/services/${product.slug}`, site.url).toString(),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...comparisons.map((comparison) => ({
      url: new URL(`/compare/${comparison.slug}`, site.url).toString(),
      lastModified: comparison.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}
