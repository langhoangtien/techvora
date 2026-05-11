import Link from "next/link"
import type { Metadata } from "next"
import { EditIcon, ExternalLinkIcon, PlusIcon } from "lucide-react"

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
        <div><h1 className="text-2xl font-semibold tracking-tight">Comparisons</h1><p className="mt-1 text-sm text-muted-foreground">Quản lý trang so sánh sản phẩm, SaaS, hosting và công cụ.</p></div>
        <Button asChild><Link href="/admin/comparisons/new"><PlusIcon />Tạo comparison</Link></Button>
      </div>
      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-4">
        <Input name="q" defaultValue={filters.q} placeholder="Tìm title hoặc item" />
        <select name="status" defaultValue={filters.status} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Tất cả trạng thái</option><option value="DRAFT">Nháp</option><option value="PUBLISHED">Xuất bản</option><option value="SCHEDULED">Lên lịch</option><option value="ARCHIVED">Lưu trữ</option>
        </select>
        <select name="featured" defaultValue={filters.featured} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Tất cả</option><option value="true">Nổi bật</option><option value="false">Không nổi bật</option>
        </select>
        <Button type="submit" variant="outline">Lọc</Button>
      </form>
      <DataTable
        data={comparisons}
        emptyTitle="Chưa có comparison"
        columns={[
          { key: "title", header: "Tiêu đề", cell: (row) => <div><div className="font-medium">{row.title}</div><div className="text-xs text-muted-foreground">/compare/{row.slug}</div></div> },
          { key: "items", header: "Items", cell: (row) => <span className="text-muted-foreground">{row.itemAName} vs {row.itemBName}</span> },
          { key: "status", header: "Trạng thái", cell: (row) => <StatusBadge status={row.status} /> },
          { key: "winner", header: "Winner", cell: (row) => row.winner ?? "Chưa có" },
          { key: "display", header: "Hiển thị", cell: (row) => <span className="text-xs text-muted-foreground">{row.isFeatured ? "Nổi bật" : "Thường"} · Thứ tự {row.order}</span> },
          { key: "actions", header: "", className: "w-36 text-right", cell: (row) => <div className="flex justify-end gap-2"><Button asChild size="icon-sm" variant="ghost"><Link href={`/compare/${row.slug}`} target="_blank"><ExternalLinkIcon /><span className="sr-only">Xem public</span></Link></Button><Button asChild size="icon-sm" variant="ghost"><Link href={`/admin/comparisons/${row.id}/edit`}><EditIcon /><span className="sr-only">Sửa</span></Link></Button><DeleteComparisonButton id={row.id} /></div> },
        ]}
      />
      {totalPages > 1 ? <div className="flex justify-end gap-2">{page > 1 ? <Button asChild variant="outline"><Link href={pageHref(page - 1, params)}>Trang trước</Link></Button> : null}{page < totalPages ? <Button asChild variant="outline"><Link href={pageHref(page + 1, params)}>Trang sau</Link></Button> : null}</div> : null}
    </div>
  )
}
