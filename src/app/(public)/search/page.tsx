import Link from "next/link"
import type { Metadata } from "next"
import { IconSearch as SearchIcon } from "@tabler/icons-react"

import { ArticleCard } from "@/components/article/article-card"
import { ComparisonCard } from "@/components/comparisons/comparison-card"
import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/layout/empty-state"
import { SectionHeader } from "@/components/layout/section-header"
import { ServiceCard } from "@/components/services/service-card"
import { SeoJsonLd } from "@/components/seo/seo-json-ld"
import { ToolCard } from "@/components/tools/tool-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { getSiteConfig } from "@/lib/settings"
import {
  hasSearchResults,
  minSearchQueryLength,
  normalizeSearchQuery,
  searchPublicContent,
  type SearchResult,
} from "@/modules/search/public"

export const metadata: Metadata = {
  title: "Suche",
  robots: {
    index: false,
    follow: true,
  },
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}

function formatDate(date: Date | null) {
  if (!date) return null

  return new Intl.DateTimeFormat("de-DE", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function GroupHeader({
  title,
  href,
}: {
  title: string
  href: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <Button asChild variant="outline" size="sm">
        <Link href={href}>Alle anzeigen</Link>
      </Button>
    </div>
  )
}

function ArticleResultGroup({ results }: { results: SearchResult[] }) {
  if (results.length === 0) return null

  return (
    <section className="space-y-4">
      <GroupHeader title="Artikel" href="/articles" />
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result) => (
          <ArticleCard
            key={result.url}
            title={result.title}
            href={result.url}
            excerpt={result.description ?? undefined}
            publishedAt={formatDate(result.date) ?? undefined}
            imageUrl={result.imageUrl}
          />
        ))}
      </div>
    </section>
  )
}

function ToolResultGroup({ results }: { results: SearchResult[] }) {
  if (results.length === 0) return null

  return (
    <section className="space-y-4">
      <GroupHeader title="Tools" href="/tools" />
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result) => (
          <ToolCard
            key={result.url}
            name={result.title}
            href={result.url}
            description={result.description}
          />
        ))}
      </div>
    </section>
  )
}

function ServicesResultGroup({ results }: { results: SearchResult[] }) {
  if (results.length === 0) return null

  return (
    <section className="space-y-4">
      <GroupHeader title="Services" href="/services" />
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result) => (
          <ServiceCard
            key={result.url}
            name={result.title}
            href={result.url}
            logoUrl={result.imageUrl}
            shortDescription={result.description}
          />
        ))}
      </div>
    </section>
  )
}

function ComparisonResultGroup({ results }: { results: SearchResult[] }) {
  if (results.length === 0) return null

  return (
    <section className="space-y-4">
      <GroupHeader title="Vergleiche" href="/compare" />
      <div className="grid gap-4 md:grid-cols-2">
        {results.map((result) => (
          <ComparisonCard
            key={result.url}
            title={result.title}
            href={result.url}
            excerpt={result.description}
            itemAName={result.itemAName ?? "Option A"}
            itemBName={result.itemBName ?? "Option B"}
            itemALogoUrl={result.itemALogoUrl}
            itemBLogoUrl={result.itemBLogoUrl}
            winner={result.winner}
          />
        ))}
      </div>
    </section>
  )
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {}
  const query = normalizeSearchQuery(value(params, "q"))
  const [site, results] = await Promise.all([
    getSiteConfig(),
    searchPublicContent(query),
  ])
  const queryIsTooShort = query.length > 0 && query.length < minSearchQueryLength
  const shouldShowEmpty =
    query.length >= minSearchQueryLength && !hasSearchResults(results)

  return (
    <>
      <SeoJsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "SearchResultsPage",
          name: "Suche",
          url: new URL(query ? `/search?q=${encodeURIComponent(query)}` : "/search", site.url).toString(),
          isPartOf: {
            "@type": "WebSite",
            name: site.name,
            url: site.url,
          },
        }}
      />
      <Container className="py-12">
        <div className="mx-auto max-w-4xl">
          <SectionHeader
            eyebrow="Suche"
            title="Öffentliche Bibliothek durchsuchen"
            description="Finden Sie veröffentlichte Artikel, Tools, Services und Vergleiche."
          />
          <form action="/search" className="mt-8">
            <div className="flex items-center gap-2 rounded-lg border bg-background p-2 shadow-sm">
              <SearchIcon className="ml-2 size-5 shrink-0 text-muted-foreground" />
              <Input
                name="q"
                defaultValue={query}
                placeholder="Tools, Ratgeber, Services suchen..."
                className="h-11 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                autoFocus
              />
              <Button type="submit" className="hidden sm:inline-flex">
                Suchen
              </Button>
            </div>
          </form>

          {query.length === 0 ? (
            <div className="mt-8">
              <EmptyState
                title="Starten Sie mit einer Suche"
                description="Geben Sie mindestens zwei Zeichen ein, um öffentliche Inhalte zu durchsuchen."
              />
            </div>
          ) : null}

          {queryIsTooShort ? (
            <div className="mt-8">
              <EmptyState
                title="Suchanfrage ist zu kurz"
                description={`Geben Sie mindestens ${minSearchQueryLength} Zeichen ein, um die öffentliche Bibliothek zu durchsuchen.`}
              />
            </div>
          ) : null}

          {shouldShowEmpty ? (
            <div className="mt-8">
              <EmptyState
                title="Keine Ergebnisse gefunden"
                description={`Für "${query}" wurden keine veröffentlichten Ergebnisse gefunden. Versuchen Sie einen allgemeineren Begriff.`}
              />
            </div>
          ) : null}

          {hasSearchResults(results) ? (
            <div className="mt-10 space-y-12">
              <ArticleResultGroup results={results.articles} />
              <ToolResultGroup results={results.tools} />
              <ServicesResultGroup results={results.services} />
              <ComparisonResultGroup results={results.comparisons} />
            </div>
          ) : null}
        </div>
      </Container>
    </>
  )
}
