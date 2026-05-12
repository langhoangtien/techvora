import Link from "next/link"
import type { Metadata } from "next"
import {
  IconEdit as EditIcon,
  IconExternalLink as ExternalLinkIcon,
  IconPlus as PlusIcon,
} from "@tabler/icons-react"

import { DeleteRedirectButton } from "@/app/admin/redirects/delete-redirect-button"
import { requireAdmin } from "@/lib/admin-auth"
import { getRedirectList } from "@/modules/redirects/queries"
import { AdminBadge } from "@/components/admin/badge"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Redirects" }

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

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
  return `/admin/redirects?${search.toString()}`
}

function RedirectStatusBadge({ statusCode }: { statusCode: number }) {
  return (
    <AdminBadge variant={statusCode === 301 ? "green" : "blue"}>
      {statusCode}
    </AdminBadge>
  )
}

export default async function AdminRedirectsPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const page = Number(value(params, "page") ?? 1)
  const filters = {
    q: value(params, "q") ?? "",
    status: value(params, "status") ?? "",
    page,
  }
  const { redirects, totalPages } = await getRedirectList(filters)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Redirects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý chuyển hướng public 301 và 302.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/redirects/new">
            <PlusIcon />
            Tạo redirect
          </Link>
        </Button>
      </div>
      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-[1fr_180px_auto]">
        <Input
          name="q"
          defaultValue={filters.q}
          placeholder="Tìm theo đường dẫn nguồn hoặc đích"
        />
        <select
          name="status"
          defaultValue={filters.status}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="301">301</option>
          <option value="302">302</option>
        </select>
        <Button type="submit" variant="outline">
          Lọc
        </Button>
      </form>
      <DataTable
        data={redirects}
        emptyTitle="Chưa có redirect"
        columns={[
          {
            key: "source",
            header: "Nguồn",
            cell: (row) => <span className="font-medium">{row.source}</span>,
          },
          {
            key: "destination",
            header: "Đích",
            cell: (row) => (
              <span className="text-muted-foreground">{row.destination}</span>
            ),
          },
          {
            key: "status",
            header: "Mã",
            cell: (row) => <RedirectStatusBadge statusCode={row.statusCode} />,
          },
          {
            key: "updatedAt",
            header: "Cập nhật",
            cell: (row) => (
              <span className="text-xs text-muted-foreground">
                {row.updatedAt.toLocaleDateString("vi-VN")}
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
                  <Link href={row.source} target="_blank">
                    <ExternalLinkIcon />
                    <span className="sr-only">Xem public</span>
                  </Link>
                </Button>
                <Button asChild size="icon-sm" variant="ghost">
                  <Link href={`/admin/redirects/${row.id}/edit`}>
                    <EditIcon />
                    <span className="sr-only">Sửa</span>
                  </Link>
                </Button>
                <DeleteRedirectButton id={row.id} />
              </div>
            ),
          },
        ]}
      />
      {totalPages > 1 ? (
        <div className="flex justify-end gap-2">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page - 1, params)}>Trang trước</Link>
            </Button>
          ) : null}
          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page + 1, params)}>Trang sau</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
