import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRightIcon,
  FileTextIcon,
  ServerIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  TrendingUpIcon,
  UsersIcon,
  WrenchIcon,
} from "lucide-react"

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
import { cn } from "@/lib/utils"
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
  const image = site.ogImage
    ? new URL(site.ogImage, site.url).toString()
    : undefined

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
          logo: site.logoUrl
            ? new URL(site.logoUrl, site.url).toString()
            : undefined,
          sameAs: sameAs.length > 0 ? sameAs : undefined,
        }
      : null

  return organization ? [website, organization] : website
}

function SectionLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Button asChild variant="outline">
      <Link href={href}>
        {children}
        <ArrowRightIcon className="size-4" />
      </Link>
    </Button>
  )
}

function HomeSection({
  children,
  className,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("border-b bg-background py-16", className)}
      {...props}
    >
      {children}
    </section>
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
      <section className="border-b bg-linear-to-b from-primary/8 via-background to-background">
        <Container className="grid min-h-155 items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <span className="size-2 rounded-full bg-primary" />
              {site.tagline}
            </div>

            <h1 className="mt-8 text-5xl font-semibold tracking-[-0.04em] text-foreground md:text-7xl">
              Build a sharper software and{" "}
              <span className="text-primary">infrastructure</span> stack.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              {site.seoDescription}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                <Link href="/tools">
                  Explore tools
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/compare">View comparisons</Link>
              </Button>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="size-4 text-primary" />
                Unbiased reviews
              </div>
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-primary" />
                Actionable guides
              </div>
              <div className="flex items-center gap-2">
                <UsersIcon className="size-4 text-primary" />
                Built for developers & teams
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <HomeHeroCard
              icon={<WrenchIcon className="size-6" />}
              title="Tech tools"
              description="Reviews, use cases, pricing notes, and practical alternatives."
              href="/tools"
            />
            <HomeHeroCard
              icon={<ServerIcon className="size-6" />}
              title="Hosting and VPS"
              description="Infrastructure guides for developers, teams, and small businesses."
              href="/hosting"
            />
            <HomeHeroCard
              icon={<TrendingUpIcon className="size-6" />}
              title="SaaS stack"
              description="Software buying guides focused on operations, growth, and delivery."
              href="/saas"
            />
          </div>
        </Container>
      </section>

      <HomeSection>
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:items-center">
            <div>
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-primary uppercase">
                <ServerIcon className="size-4" />
                Platform
              </div>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Designed for scalable content from day one
              </h2>
              <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
                The first release defines the information architecture for
                articles, tools, SaaS, hosting, comparisons, taxonomies, media,
                redirects, and SEO.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <HomeMiniCard
                icon={<FileTextIcon className="size-5" />}
                title="Articles"
                description="In-depth guides and practical tutorials."
                href="/articles"
              />
              <HomeMiniCard
                icon={<WrenchIcon className="size-5" />}
                title="Tools"
                description="Curated tools and honest reviews."
                href="/tools"
              />
              <HomeMiniCard
                icon={<StarIcon className="size-5" />}
                title="Comparisons"
                description="Side-by-side comparisons you can trust."
                href="/compare"
              />
            </div>
          </div>
        </Container>
      </HomeSection>

      <HomeSection>
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
      </HomeSection>

      <HomeSection className="bg-muted/30">
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
      </HomeSection>

      <HomeSection>
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
      </HomeSection>

      <HomeSection className="bg-muted/30">
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
      </HomeSection>

      <HomeSection>
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
      </HomeSection>

      <HomeSection className="bg-muted/30">
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
      </HomeSection>

      <HomeSection className="border-b-0">
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
      </HomeSection>
    </>
  )
}

function HomeHeroCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-6 rounded-2xl border border-primary/15 bg-background/90 p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 leading-7 text-muted-foreground">{description}</p>
      </div>
      <ArrowRightIcon className="size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  )
}

function HomeMiniCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-sm"
    >
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <ArrowRightIcon className="mt-5 size-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
    </Link>
  )
}
