import Link from "next/link"
import type { Metadata } from "next"
import { EditIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { deleteAuthorAction } from "@/modules/authors/actions"
import { getAuthorForEdit, getAuthorsForAdmin } from "@/modules/authors/queries"
import { requireAdmin } from "@/lib/admin-auth"
import { AdminBadge } from "@/components/admin/badge"
import { AuthorForm } from "@/app/admin/authors/author-form"
import { DataTable } from "@/components/admin/data-table"
import { SearchFilter } from "@/components/admin/search-filter"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tác giả",
}

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
    if (key === "page" || key === "edit") continue
    const next = Array.isArray(raw) ? raw[0] : raw
    if (next) search.set(key, next)
  }
  search.set("page", String(page))
  return `/admin/authors?${search.toString()}`
}

export default async function AuthorsPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const query = value(params, "q") ?? ""
  const page = Number(value(params, "page") ?? 1)
  const editId = value(params, "edit")
  const [{ authors, totalPages }, author] = await Promise.all([
    getAuthorsForAdmin(query, page),
    getAuthorForEdit(editId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tác giả</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý hồ sơ tác giả cho hệ thống nội dung.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <SearchFilter defaultValue={query} placeholder="Tìm tác giả" />
          <AuthorForm
            trigger={
              <Button>
                <PlusIcon />
                Tạo tác giả
              </Button>
            }
          />
        </div>
      </div>
      {author ? <AuthorForm key={author.id} author={author} /> : null}
      <DataTable
        data={authors}
        emptyTitle="Chưa có tác giả"
        columns={[
          {
            key: "name",
            header: "Tác giả",
            cell: (row) => (
              <div className="flex items-center gap-3">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={row.avatarUrl ?? ""} alt={row.name} />
                  <AvatarFallback className="rounded-lg">
                    {row.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-xs text-muted-foreground">/{row.slug}</div>
                </div>
              </div>
            ),
          },
          {
            key: "bio",
            header: "Tiểu sử",
            cell: (row) => (
              <span className="line-clamp-2 text-muted-foreground">
                {row.bio ?? "Không có"}
              </span>
            ),
          },
          {
            key: "usage",
            header: "Sử dụng",
            cell: (row) => (
              <div className="flex gap-2">
                <AdminBadge variant={row._count.posts > 0 ? "blue" : "neutral"}>
                  {row._count.posts} bài viết
                </AdminBadge>
                <AdminBadge variant={row._count.tools > 0 ? "green" : "neutral"}>
                  {row._count.tools} công cụ
                </AdminBadge>
              </div>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-32 text-right",
            cell: (row) => (
              <div className="flex justify-end gap-2">
                <Button asChild size="icon-sm" variant="ghost">
                  <Link href={`/admin/authors?edit=${row.id}`}>
                    <EditIcon />
                    <span className="sr-only">Sửa</span>
                  </Link>
                </Button>
                <form action={deleteAuthorAction}>
                  <input type="hidden" name="id" value={row.id} />
                  <Button size="icon-sm" variant="destructive" type="submit">
                    <Trash2Icon />
                    <span className="sr-only">Xóa</span>
                  </Button>
                </form>
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
