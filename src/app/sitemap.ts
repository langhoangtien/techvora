import type { MetadataRoute } from "next"

import { getSiteConfig } from "@/lib/settings"
import { getSitemapComparisons } from "@/modules/comparisons/public"
import { getSitemapHostingProviders } from "@/modules/hosting/public"
import { getSitemapArticles } from "@/modules/posts/public"
import { getSitemapSaaSProducts } from "@/modules/saas/public"
import { getSitemapTools } from "@/modules/tools/public"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, articles, tools, hosting, saas, comparisons] = await Promise.all([
    getSiteConfig(),
    getSitemapArticles(),
    getSitemapTools(),
    getSitemapHostingProviders(),
    getSitemapSaaSProducts(),
    getSitemapComparisons(),
  ])

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
      url: new URL("/hosting", site.url).toString(),
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: new URL("/saas", site.url).toString(),
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
    ...hosting.map((provider) => ({
      url: new URL(`/hosting/${provider.slug}`, site.url).toString(),
      lastModified: provider.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...saas.map((product) => ({
      url: new URL(`/saas/${product.slug}`, site.url).toString(),
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
