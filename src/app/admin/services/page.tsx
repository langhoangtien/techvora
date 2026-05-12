import Link from "next/link"
import type { Metadata } from "next"
import {
  IconEdit as EditIcon,
  IconExternalLink as ExternalLinkIcon,
  IconPlus as PlusIcon,
} from "@tabler/icons-react"

import { DeleteServiceButton } from "@/app/admin/services/delete-service-button"
import { requireAdmin } from "@/lib/admin-auth"
import { getServiceList } from "@/modules/services/queries"
import { priceLabel } from "@/modules/services/utils"
import { DataTable } from "@/components/admin/data-table"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Services",
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
  return `/admin/services?${search.toString()}`
}

export default async function AdminServicesPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const page = Number(value(params, "page") ?? 1)
  const filters = {
    q: value(params, "q") ?? "",
    status: value(params, "status") ?? "",
    category: value(params, "category") ?? "",
    featured: value(params, "featured") ?? "",
    page,
  }
  const { products, categories, totalPages } = await getServiceList(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Services</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quáº£n lÃ½ thÆ° má»¥c Services, thÃ´ng tin giÃ¡, review vÃ  CTA affiliate.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/services/new">
            <PlusIcon />
            Táº¡o Services
          </Link>
        </Button>
      </div>
      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-5">
        <Input name="q" defaultValue={filters.q} placeholder="TÃ¬m theo tÃªn" />
        <select name="status" defaultValue={filters.status} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Táº¥t cáº£ tráº¡ng thÃ¡i</option>
          <option value="DRAFT">NhÃ¡p</option>
          <option value="PUBLISHED">Xuáº¥t báº£n</option>
          <option value="SCHEDULED">LÃªn lá»‹ch</option>
          <option value="ARCHIVED">LÆ°u trá»¯</option>
        </select>
        <select name="category" defaultValue={filters.category} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Táº¥t cáº£ danh má»¥c</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select name="featured" defaultValue={filters.featured} className="h-8 rounded-lg border bg-background px-2.5 text-sm">
          <option value="">Táº¥t cáº£</option>
          <option value="true">Ná»•i báº­t</option>
          <option value="false">KhÃ´ng ná»•i báº­t</option>
        </select>
        <Button type="submit" variant="outline">Lá»c</Button>
      </form>
      <DataTable
        data={products}
        emptyTitle="ChÆ°a cÃ³ service"
        columns={[
          {
            key: "name",
            header: "Sáº£n pháº©m",
            cell: (row) => (
              <div className="flex items-center gap-3">
                {row.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.logoUrl} alt={row.name} className="size-9 rounded-lg border object-contain p-1" />
                ) : null}
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-xs text-muted-foreground">/services/{row.slug}</div>
                </div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Tráº¡ng thÃ¡i",
            cell: (row) => <StatusBadge status={row.status} />,
          },
          {
            key: "category",
            header: "Danh má»¥c",
            cell: (row) => row.category ?? "ChÆ°a cÃ³",
          },
          {
            key: "rating",
            header: "Rating",
            cell: (row) => row.rating?.toString() ?? "ChÆ°a cÃ³",
          },
          {
            key: "price",
            header: "GiÃ¡",
            cell: (row) => priceLabel(row.pricingFrom?.toString(), row.currency),
          },
          {
            key: "date",
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
                  <Link href={`/services/${row.slug}`} target="_blank">
                    <ExternalLinkIcon />
                    <span className="sr-only">Xem public</span>
                  </Link>
                </Button>
                <Button asChild size="icon-sm" variant="ghost">
                  <Link href={`/admin/services/${row.id}/edit`}>
                    <EditIcon />
                    <span className="sr-only">Sá»­a</span>
                  </Link>
                </Button>
                <DeleteServiceButton id={row.id} />
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
