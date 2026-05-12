import Link from "next/link"
import type { Metadata } from "next"
import { EditIcon, EyeIcon, PlusIcon } from "lucide-react"

import { bulkPostAction } from "@/modules/posts/actions"
import { getPostEditorOptions, getPostList } from "@/modules/posts/queries"
import { requireAdmin } from "@/lib/admin-auth"
import { DeletePostButton } from "@/app/admin/posts/delete-post-button"
import { DataTable } from "@/components/admin/data-table"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "BÃ i viáº¿t",
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}

function formatDate(date: Date | null) {
  if (!date) return "ChÆ°a cÃ³"
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

function pageHref(page: number, params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams()
  for (const [key, raw] of Object.entries(params)) {
    if (key === "page") continue
    const next = Array.isArray(raw) ? raw[0] : raw
    if (next) search.set(key, next)
  }
  search.set("page", String(page))
  return `/admin/posts?${search.toString()}`
}

export default async function PostsPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const page = Number(value(params, "page") ?? 1)
  const filters = {
    q: value(params, "q") ?? "",
    status: value(params, "status") ?? "",
    type: value(params, "type") ?? "",
    categoryId: value(params, "categoryId") ?? "",
    authorId: value(params, "authorId") ?? "",
    page,
  }
  const [{ posts, totalPages }, options] = await Promise.all([
    getPostList(filters),
    getPostEditorOptions(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">BÃ i viáº¿t</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quáº£n lÃ½ ná»™i dung CMS, tráº¡ng thÃ¡i xuáº¥t báº£n vÃ  preview.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <PlusIcon />
            Táº¡o bÃ i viáº¿t
          </Link>
        </Button>
      </div>
      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-5">
        <Input name="q" defaultValue={filters.q} placeholder="TÃ¬m bÃ i viáº¿t" />
        <select name="status" defaultValue={filters.status} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
          <option value="DRAFT">NhÃ¡p</option>
          <option value="PUBLISHED">Xuáº¥t báº£n</option>
          <option value="SCHEDULED">LÃªn lá»‹ch</option>
          <option value="ARCHIVED">LÆ°u trá»¯</option>
        </select>
        <select name="type" defaultValue={filters.type} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Táº¥t cáº£ loáº¡i</option>
          <option value="ARTICLE">Article</option>
          <option value="TOOL">Tool</option>
          <option value="SAAS">Services</option>
          <option value="COMPARISON">Comparison</option>
          <option value="PAGE">Page</option>
        </select>
        <select name="categoryId" defaultValue={filters.categoryId} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Táº¥t cáº£ danh má»¥c</option>
          {options.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <div className="flex gap-2">
          <select name="authorId" defaultValue={filters.authorId} className="h-8 min-w-0 flex-1 rounded-lg border bg-background px-2.5 text-sm">
            <option value="">Táº¥t cáº£ tÃ¡c giáº£</option>
            {options.authors.map((author) => <option key={author.id} value={author.id}>{author.name}</option>)}
          </select>
          <Button type="submit" variant="outline">Lá»c</Button>
        </div>
      </form>
      <form id="bulk-posts-form" action={bulkPostAction} className="flex flex-wrap gap-2">
        <select name="bulkAction" className="h-8 rounded-lg border bg-background px-2.5 text-sm">
            <option value="publish">Xuáº¥t báº£n</option>
            <option value="draft">Chuyá»ƒn nhÃ¡p</option>
            <option value="delete">XÃ³a</option>
        </select>
        <Button type="submit" variant="outline">Ãp dá»¥ng hÃ ng loáº¡t</Button>
      </form>
      <DataTable
        data={posts}
        emptyTitle="ChÆ°a cÃ³ bÃ i viáº¿t"
        columns={[
            {
              key: "select",
              header: "",
              className: "w-10",
              cell: (row) => (
                <input
                  form="bulk-posts-form"
                  type="checkbox"
                  name="ids"
                  value={row.id}
                />
              ),
            },
            {
              key: "title",
              header: "TiÃªu Ä‘á»",
              cell: (row) => (
                <div>
                  <div className="font-medium">{row.title}</div>
                  <div className="text-xs text-muted-foreground">/{row.slug}</div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Tráº¡ng thÃ¡i",
              cell: (row) => <StatusBadge status={row.status} />,
            },
            {
              key: "type",
              header: "Loáº¡i",
              cell: (row) => row.type,
            },
            {
              key: "taxonomy",
              header: "PhÃ¢n loáº¡i",
              cell: (row) => (
                <span className="text-muted-foreground">
                  {row.category?.name ?? "KhÃ´ng danh má»¥c"} Â· {row.author?.name ?? "KhÃ´ng tÃ¡c giáº£"}
                </span>
              ),
            },
            {
              key: "dates",
              header: "NgÃ y",
              cell: (row) => (
                <span className="text-xs text-muted-foreground">
                  Xuáº¥t báº£n: {formatDate(row.publishedAt)}
                  <br />
                  Cáº­p nháº­t: {formatDate(row.updatedAt)}
                </span>
              ),
            },
            {
              key: "actions",
              header: "",
              className: "w-36 text-right",
              cell: (row) => (
                <div className="flex justify-end gap-2">
                  <Button asChild size="icon-sm" variant="ghost">
                    <Link href={`/preview/${row.id}`} target="_blank">
                      <EyeIcon />
                      <span className="sr-only">Preview</span>
                    </Link>
                  </Button>
                  <Button asChild size="icon-sm" variant="ghost">
                    <Link href={`/admin/posts/${row.id}/edit`}>
                      <EditIcon />
                      <span className="sr-only">Sá»­a</span>
                    </Link>
                  </Button>
                  <DeletePostButton id={row.id} />
                </div>
              ),
            },
        ]}
      />
      {totalPages > 1 ? (
        <div className="flex justify-end gap-2">
          {page > 1 ? <Button asChild variant="outline"><Link href={pageHref(page - 1, params)}>Trang trÆ°á»›c</Link></Button> : null}
          {page < totalPages ? <Button asChild variant="outline"><Link href={pageHref(page + 1, params)}>Trang sau</Link></Button> : null}
        </div>
      ) : null}
    </div>
  )
}
