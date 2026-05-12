import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, SearchIcon } from "lucide-react"

import { ArticleCard } from "@/components/article/article-card"
import { ComparisonCard } from "@/components/comparisons/comparison-card"
import { HostingCard } from "@/components/hosting/hosting-card"
import { CategoryCard } from "@/components/layout/category-card"
import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/layout/empty-state"
import { SectionHeader } from "@/components/layout/section-header"
import { SaaSCard } from "@/components/saas/saas-card"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { ToolCard } from "@/components/tools/tool-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSiteConfig, type SiteConfigFromSettings } from "@/lib/settings"
import { getHomepageContent } from "@/modules/home/public"
import { formatPublicDate } from "@/modules/posts/public"

export const revalidate = 1800

function absoluteUrl(site: SiteConfigFromSettings, path = "/") {
  return new URL(path, site.url).toString()
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteConfig()
  const title = site.seoTitle || site.name
  const description = site.seoDescription || site.tagline
  const url = absoluteUrl(site)
  const image = site.ogImage ? new URL(site.ogImage, site.url).toString() : undefined

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: {
      index: site.robots.index,
      follow: site.robots.follow,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: site.name,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

function homepageJsonLd(site: SiteConfigFromSettings) {
  const sameAs = Object.values(site.social).filter(Boolean)
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: absoluteUrl(site),
    description: site.seoDescription || site.tagline,
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(site, "/search")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  }
  const organization =
    site.name && site.url
      ? {
          "@context": "https://schema.org",
          "@type": "Organization",
          name: site.name,
          url: absoluteUrl(site),
          logo: site.logoUrl ? new URL(site.logoUrl, site.url).toString() : undefined,
          sameAs: sameAs.length > 0 ? sameAs : undefined,
        }
      : null

  return organization ? [website, organization] : website
}

function SectionLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Button asChild variant="outline">
      <Link href={href}>
        {children}
        <ArrowRightIcon className="size-4" />
      </Link>
    </Button>
  )
}

export default async function HomePage() {
  const [site, content] = await Promise.all([
    getSiteConfig(),
    getHomepageContent(),
  ])

  return (
    <>
      <SeoJsonLd data={homepageJsonLd(site)} />
      <section className="border-b bg-muted/30">
        <Container className="grid min-h-[560px] items-center gap-10 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-primary">{site.tagline}</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
              {site.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {site.seoDescription}
            </p>
            <form action="/search" className="mt-8 max-w-2xl">
              <div className="flex items-center gap-2 rounded-lg border bg-background p-2 shadow-sm">
                <SearchIcon className="ml-2 size-4 shrink-0 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search tools, tutorials, SaaS, hosting..."
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
                <Button type="submit" variant="outline" className="hidden sm:inline-flex">
                  Search
                </Button>
              </div>
            </form>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/tools">
                  Explore Tools
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/articles">Read Guides</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border bg-background p-4 shadow-sm">
            <CategoryCard
              name="Tools"
              href="/tools"
              description="Technical utilities, reviews, and product research."
            />
            <CategoryCard
              name="Hosting"
              href="/hosting"
              description="Hosting and VPS guides for practical infrastructure choices."
            />
            <CategoryCard
              name="SaaS"
              href="/saas"
              description="Software profiles focused on pricing, fit, and tradeoffs."
            />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Tools"
              title="Featured tools"
              description="Published tools and technical products, with featured items shown first."
            />
            <SectionLink href="/tools">View all tools</SectionLink>
          </div>
          {content.tools.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  name={tool.name}
                  href={`/tools/${tool.slug}`}
                  tagline={tool.tagline ?? undefined}
                  description={tool.shortDescription}
                  category={tool.category?.name}
                  pricingSummary={tool.pricingSummary ?? undefined}
                  featured={tool.isFeatured}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="No published tools found" />
            </div>
          )}
        </Container>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Articles"
              title="Latest articles"
              description="Recent published guides and tutorials sorted by publication date."
            />
            <SectionLink href="/articles">Read all articles</SectionLink>
          </div>
          {content.articles.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  href={`/articles/${article.slug}`}
                  excerpt={article.excerpt ?? undefined}
                  category={article.category?.name}
                  author={article.author?.name}
                  publishedAt={formatPublicDate(article.publishedAt)}
                  imageUrl={article.coverImageUrl}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="No published articles found" />
            </div>
          )}
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Hosting"
              title="Hosting and VPS guides"
              description="Published hosting providers with featured reviews shown first."
            />
            <SectionLink href="/hosting">View hosting guides</SectionLink>
          </div>
          {content.hostingProviders.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {content.hostingProviders.map((provider) => (
                <HostingCard
                  key={provider.id}
                  name={provider.name}
                  href={`/hosting/${provider.slug}`}
                  logoUrl={provider.logoUrl}
                  shortDescription={provider.shortDescription}
                  rating={provider.rating?.toString()}
                  pricingFrom={provider.pricingFrom?.toString()}
                  currency={provider.currency}
                  bestFor={provider.bestFor}
                  affiliateUrl={provider.affiliateUrl ?? provider.websiteUrl}
                  featured={provider.isFeatured}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="No published hosting guides found" />
            </div>
          )}
        </Container>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="SaaS"
              title="SaaS directory"
              description="Published SaaS products with featured profiles shown first."
            />
            <SectionLink href="/saas">Browse SaaS</SectionLink>
          </div>
          {content.saasProducts.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {content.saasProducts.map((product) => (
                <SaaSCard
                  key={product.id}
                  name={product.name}
                  href={`/saas/${product.slug}`}
                  logoUrl={product.logoUrl}
                  shortDescription={product.shortDescription}
                  category={product.category}
                  rating={product.rating?.toString()}
                  pricingFrom={product.pricingFrom?.toString()}
                  pricingModel={product.pricingModel}
                  currency={product.currency}
                  affiliateUrl={product.affiliateUrl ?? product.websiteUrl}
                  featured={product.isFeatured}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="No published SaaS products found" />
            </div>
          )}
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <SectionHeader
              eyebrow="Compare"
              title="Comparisons"
              description="Published side-by-side comparisons with featured decisions shown first."
            />
            <SectionLink href="/compare">View comparisons</SectionLink>
          </div>
          {content.comparisons.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {content.comparisons.map((comparison) => (
                <ComparisonCard
                  key={comparison.id}
                  title={comparison.title}
                  href={`/compare/${comparison.slug}`}
                  excerpt={comparison.excerpt}
                  itemAName={comparison.itemAName}
                  itemBName={comparison.itemBName}
                  itemALogoUrl={comparison.itemALogoUrl}
                  itemBLogoUrl={comparison.itemBLogoUrl}
                  winner={comparison.winner}
                  featured={comparison.isFeatured}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="No published comparisons found" />
            </div>
          )}
        </Container>
      </section>

      <section className="border-t bg-muted/30 py-16">
        <Container>
          <SectionHeader
            eyebrow="Categories"
            title="Featured categories"
            description="Browse selected topic areas across the public library."
          />
          {content.categories.length > 0 ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  name={category.name}
                  href={`/categories/${category.slug}`}
                  description={category.description ?? undefined}
                />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState title="No featured categories found" />
            </div>
          )}
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="rounded-lg border bg-card p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_380px] md:items-center">
              <SectionHeader
                eyebrow="Newsletter"
                title="Get practical software research in your inbox"
                description="A clean newsletter signup surface is ready for a future email backend."
              />
              <form className="flex gap-2">
                <Input type="email" placeholder="you@example.com" disabled />
                <Button type="button" disabled>
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </>
  )
}
