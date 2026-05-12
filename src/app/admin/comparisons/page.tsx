import Link from "next/link"
import type { Metadata } from "next"
import {
  IconEdit as EditIcon,
  IconExternalLink as ExternalLinkIcon,
  IconPlus as PlusIcon,
} from "@tabler/icons-react"

import { DeleteComparisonButton } from "@/app/admin/comparisons/delete-comparison-button"
import { requireAdmin } from "@/lib/admin-auth"
import { getComparisonList } from "@/modules/comparisons/queries"
import { DataTable } from "@/components/admin/data-table"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Comparisons" }

type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> }
function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}
function pageHref(page: number, params: Record<string, string | string[] | undefined>) {
  const search = new URLSearchParams()
  for (const [key, raw] of Object.entries(params)) {
    if (key === "page") continue
    const next = Array.isArray(raw) ? raw[0] : raw
    if (next) search.set(key, next)
  }
  search.set("page", String(page))
  return `/admin/comparisons?${search.toString()}`
}

export default async function AdminComparisonsPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const page = Number(value(params, "page") ?? 1)
  const filters = {
    q: value(params, "q") ?? "",
    status: value(params, "status") ?? "",
    featured: value(params, "featured") ?? "",
    page,
  }
  const { comparisons, totalPages } = await getComparisonList(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-semibold tracking-tight">Comparisons</h1><p className="mt-1 text-sm text-muted-foreground">Quáº£n lÃ½ trang so sÃ¡nh sáº£n pháº©m, Services vÃ  cÃ´ng cá»¥.</p></div>
        <Button asChild><Link href="/admin/comparisons/new"><PlusIcon />Táº¡o comparison</Link></Button>
      </div>
      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-4">
        <Input name="q" defaultValue={filters.q} placeholder="TÃ¬m title hoáº·c item" />
        <select name="status" defaultValue={filters.status} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Táº¥t cáº£ tráº¡ng thÃ¡i</option><option value="DRAFT">NhÃ¡p</option><option value="PUBLISHED">Xuáº¥t báº£n</option><option value="SCHEDULED">LÃªn lá»‹ch</option><option value="ARCHIVED">LÆ°u trá»¯</option>
        </select>
        <select name="featured" defaultValue={filters.featured} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Táº¥t cáº£</option><option value="true">Ná»•i báº­t</option><option value="false">KhÃ´ng ná»•i báº­t</option>
        </select>
        <Button type="submit" variant="outline">Lá»c</Button>
      </form>
      <DataTable
        data={comparisons}
        emptyTitle="ChÆ°a cÃ³ comparison"
        columns={[
          { key: "title", header: "TiÃªu Ä‘á»", cell: (row) => <div><div className="font-medium">{row.title}</div><div className="text-xs text-muted-foreground">/compare/{row.slug}</div></div> },
          { key: "items", header: "Items", cell: (row) => <span className="text-muted-foreground">{row.itemAName} vs {row.itemBName}</span> },
          { key: "status", header: "Tráº¡ng thÃ¡i", cell: (row) => <StatusBadge status={row.status} /> },
          { key: "winner", header: "Winner", cell: (row) => row.winner ?? "ChÆ°a cÃ³" },
          { key: "display", header: "Hiá»ƒn thá»‹", cell: (row) => <span className="text-xs text-muted-foreground">{row.isFeatured ? "Ná»•i báº­t" : "ThÆ°á»ng"} Â· Thá»© tá»± {row.order}</span> },
          { key: "actions", header: "", className: "w-36 text-right", cell: (row) => <div className="flex justify-end gap-2"><Button asChild size="icon-sm" variant="ghost"><Link href={`/compare/${row.slug}`} target="_blank"><ExternalLinkIcon /><span className="sr-only">Xem public</span></Link></Button><Button asChild size="icon-sm" variant="ghost"><Link href={`/admin/comparisons/${row.id}/edit`}><EditIcon /><span className="sr-only">Sá»­a</span></Link></Button><DeleteComparisonButton id={row.id} /></div> },
        ]}
      />
      {totalPages > 1 ? <div className="flex justify-end gap-2">{page > 1 ? <Button asChild variant="outline"><Link href={pageHref(page - 1, params)}>Trang trÆ°á»›c</Link></Button> : null}{page < totalPages ? <Button asChild variant="outline"><Link href={pageHref(page + 1, params)}>Trang sau</Link></Button> : null}</div> : null}
    </div>
  )
}
