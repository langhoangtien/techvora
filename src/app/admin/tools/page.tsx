import Link from "next/link"
import type { Metadata } from "next"
import { EditIcon, ExternalLinkIcon, PlusIcon } from "lucide-react"

import { DeleteToolButton } from "@/app/admin/tools/delete-tool-button"
import { bulkToolAction } from "@/modules/tools/actions"
import { toolComponentOptions } from "@/modules/tools/definitions"
import { getToolEditorOptions, getToolList } from "@/modules/tools/queries"
import { requireAdmin } from "@/lib/admin-auth"
import { DataTable } from "@/components/admin/data-table"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Công cụ",
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}

function formatDate(date: Date | null) {
  if (!date) return "Chưa có"
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
  return `/admin/tools?${search.toString()}`
}

export default async function AdminToolsPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const page = Number(value(params, "page") ?? 1)
  const filters = {
    q: value(params, "q") ?? "",
    status: value(params, "status") ?? "",
    categoryId: value(params, "categoryId") ?? "",
    componentKey: value(params, "componentKey") ?? "",
    page,
  }
  const success = value(params, "success")
  const error = value(params, "error")
  const [{ tools, totalPages }, options] = await Promise.all([
    getToolList(filters),
    getToolEditorOptions(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Công cụ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tool page, widget tương tác và trạng thái xuất bản.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tools/new">
            <PlusIcon />
            Tạo công cụ
          </Link>
        </Button>
      </div>
      {success ? <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      {error ? <div className="rounded-lg border bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-5">
        <Input name="q" defaultValue={filters.q} placeholder="Tìm công cụ" />
        <select name="status" defaultValue={filters.status} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Nháp</option>
          <option value="PUBLISHED">Xuất bản</option>
          <option value="SCHEDULED">Lên lịch</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
        <select name="categoryId" defaultValue={filters.categoryId} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Tất cả danh mục</option>
          {options.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        <select name="componentKey" defaultValue={filters.componentKey} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Tất cả widget</option>
          {toolComponentOptions.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
        </select>
        <Button type="submit" variant="outline">Lọc</Button>
      </form>
      <form id="bulk-tools-form" action={bulkToolAction} className="flex flex-wrap gap-2">
        <select name="bulkAction" className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="publish">Xuất bản</option>
          <option value="draft">Chuyển nháp</option>
          <option value="delete">Xóa</option>
        </select>
        <Button type="submit" variant="outline">Áp dụng hàng loạt</Button>
      </form>
      <DataTable
        data={tools}
        emptyTitle="Chưa có công cụ"
        columns={[
          {
            key: "select",
            header: "",
            className: "w-10",
            cell: (row) => (
              <input form="bulk-tools-form" type="checkbox" name="ids" value={row.id} />
            ),
          },
          {
            key: "name",
            header: "Tên",
            cell: (row) => (
              <div>
                <div className="font-medium">{row.name}</div>
                <div className="text-xs text-muted-foreground">/tools/{row.slug}</div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Trạng thái",
            cell: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: "component",
            header: "Widget",
            cell: (row) => row.componentKey ?? "Không có",
          },
          {
            key: "category",
            header: "Danh mục",
            cell: (row) => row.category?.name ?? "Không danh mục",
          },
          {
            key: "flags",
            header: "Hiển thị",
            cell: (row) => (
              <span className="text-xs text-muted-foreground">
                {row.isFeatured ? "Nổi bật" : "Thường"} · Thứ tự {row.order}
              </span>
            ),
          },
          {
            key: "dates",
            header: "Ngày",
            cell: (row) => (
              <span className="text-xs text-muted-foreground">
                Xuất bản: {formatDate(row.publishedAt)}
                <br />
                Cập nhật: {formatDate(row.updatedAt)}
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
                  <Link href={`/tools/${row.slug}`} target="_blank">
                    <ExternalLinkIcon />
                    <span className="sr-only">Xem public</span>
                  </Link>
                </Button>
                <Button asChild size="icon-sm" variant="ghost">
                  <Link href={`/admin/tools/${row.id}/edit`}>
                    <EditIcon />
                    <span className="sr-only">Sửa</span>
                  </Link>
                </Button>
                <DeleteToolButton id={row.id} />
              </div>
            ),
          },
        ]}
      />
      {totalPages > 1 ? (
        <div className="flex justify-end gap-2">
          {page > 1 ? <Button asChild variant="outline"><Link href={pageHref(page - 1, params)}>Trang trước</Link></Button> : null}
          {page < totalPages ? <Button asChild variant="outline"><Link href={pageHref(page + 1, params)}>Trang sau</Link></Button> : null}
        </div>
      ) : null}
    </div>
  )
}
