"use client"

import { useMemo, useState } from "react"

import { EmptyState } from "@/components/layout/empty-state"
import { ToolCard } from "@/components/tools/tool-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type DirectoryTool = {
  id: string
  name: string
  slug: string
  shortDescription: string | null
  tagline: string | null
  isFeatured: boolean
  category: { id: string; name: string } | null
}

type DirectoryCategory = {
  id: string
  name: string
}

const pageSize = 12

export function ToolDirectory({
  tools,
  categories,
}: {
  tools: DirectoryTool[]
  categories: DirectoryCategory[]
}) {
  const [query, setQuery] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [page, setPage] = useState(1)

  const filteredTools = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return tools.filter((tool) => {
      const matchesQuery = normalizedQuery
        ? [tool.name, tool.shortDescription, tool.tagline, tool.category?.name]
            .filter(Boolean)
            .some((value) => value?.toLowerCase().includes(normalizedQuery))
        : true
      const matchesCategory = categoryId ? tool.category?.id === categoryId : true

      return matchesQuery && matchesCategory
    })
  }, [categoryId, query, tools])

  const totalPages = Math.max(Math.ceil(filteredTools.length / pageSize), 1)
  const currentPage = Math.min(page, totalPages)
  const visibleTools = filteredTools.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <div className="mt-8">
      <div className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-[1fr_220px_auto]">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setPage(1)
          }}
          placeholder="Search tools"
        />
        <select
          value={categoryId}
          onChange={(event) => {
            setCategoryId(event.target.value)
            setPage(1)
          }}
          className="h-9 rounded-lg border bg-background px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setQuery("")
            setCategoryId("")
            setPage(1)
          }}
        >
          Clear
        </Button>
      </div>
      {categories.length > 0 ? (
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-md border px-3 py-1.5 text-sm hover:text-primary"
            onClick={() => {
              setCategoryId("")
              setPage(1)
            }}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-primary"
              onClick={() => {
                setCategoryId(category.id)
                setPage(1)
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      ) : null}
      {visibleTools.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => (
            <ToolCard
              key={tool.id}
              name={tool.name}
              href={`/tools/${tool.slug}`}
              tagline={tool.shortDescription ?? tool.tagline ?? undefined}
              category={tool.category?.name}
              featured={tool.isFeatured}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="No tools found" description="Try clearing filters or search terms." />
        </div>
      )}
      {totalPages > 1 ? (
        <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </Button>
        </nav>
      ) : null}
    </div>
  )
}
