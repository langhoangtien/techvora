import Link from "next/link"
import type { Metadata } from "next"
import { EditIcon, ExternalLinkIcon, PlusIcon } from "lucide-react"

import { DeleteHostingButton } from "@/app/admin/hosting/delete-hosting-button"
import { requireAdmin } from "@/lib/admin-auth"
import { getHostingList } from "@/modules/hosting/queries"
import { priceLabel } from "@/modules/hosting/utils"
import { DataTable } from "@/components/admin/data-table"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Hosting/VPS",
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
  return `/admin/hosting?${search.toString()}`
}

export default async function AdminHostingPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const page = Number(value(params, "page") ?? 1)
  const filters = {
    q: value(params, "q") ?? "",
    status: value(params, "status") ?? "",
    featured: value(params, "featured") ?? "",
    page,
  }
  const { providers, totalPages } = await getHostingList(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Hosting/VPS</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý review nhà cung cấp hosting, VPS và hạ tầng.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/hosting/new">
            <PlusIcon />
            Tạo review
          </Link>
        </Button>
      </div>
      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-4">
        <Input name="q" defaultValue={filters.q} placeholder="Tìm theo tên" />
        <select name="status" defaultValue={filters.status} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Nháp</option>
          <option value="PUBLISHED">Xuất bản</option>
          <option value="SCHEDULED">Lên lịch</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>
        <select name="featured" defaultValue={filters.featured} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Tất cả</option>
          <option value="true">Nổi bật</option>
          <option value="false">Không nổi bật</option>
        </select>
        <Button type="submit" variant="outline">Lọc</Button>
      </form>
      <DataTable
        data={providers}
        emptyTitle="Chưa có hosting review"
        columns={[
          {
            key: "name",
            header: "Nhà cung cấp",
            cell: (row) => (
              <div className="flex items-center gap-3">
                {row.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.logoUrl} alt={row.name} className="size-9 rounded-lg border object-contain p-1" />
                ) : null}
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-xs text-muted-foreground">/hosting/{row.slug}</div>
                </div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Trạng thái",
            cell: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: "rating",
            header: "Rating",
            cell: (row) => row.rating?.toString() ?? "Chưa có",
          },
          {
            key: "price",
            header: "Giá",
            cell: (row) => priceLabel(row.pricingFrom?.toString(), row.currency),
          },
          {
            key: "display",
            header: "Hiển thị",
            cell: (row) => (
              <span className="text-xs text-muted-foreground">
                {row.isFeatured ? "Nổi bật" : "Thường"} · Thứ tự {row.order}
              </span>
            ),
          },
          {
            key: "date",
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
                  <Link href={`/hosting/${row.slug}`} target="_blank">
                    <ExternalLinkIcon />
                    <span className="sr-only">Xem public</span>
                  </Link>
                </Button>
                <Button asChild size="icon-sm" variant="ghost">
                  <Link href={`/admin/hosting/${row.id}/edit`}>
                    <EditIcon />
                    <span className="sr-only">Sửa</span>
                  </Link>
                </Button>
                <DeleteHostingButton id={row.id} />
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
