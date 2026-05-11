import Link from "next/link"
import type { Metadata } from "next"
import { EditIcon, Trash2Icon } from "lucide-react"

import { deleteTagAction } from "@/modules/tags/actions"
import { getTagForEdit, getTagsForAdmin } from "@/modules/tags/queries"
import { requireAdmin } from "@/lib/admin-auth"
import { AdminBadge } from "@/components/admin/badge"
import { DataTable } from "@/components/admin/data-table"
import { SearchFilter } from "@/components/admin/search-filter"
import { TagForm } from "@/app/admin/tags/tag-form"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Thẻ",
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}

export default async function TagsPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const query = value(params, "q") ?? ""
  const editId = value(params, "edit")
  const success = value(params, "success")
  const error = value(params, "error")
  const [tags, tag] = await Promise.all([
    getTagsForAdmin(query),
    getTagForEdit(editId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Thẻ</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý thẻ để phân nhóm bài viết theo chủ đề.
          </p>
        </div>
        <SearchFilter defaultValue={query} placeholder="Tìm thẻ" />
      </div>
      {success ? <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      {error ? <div className="rounded-lg border bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
      <TagForm tag={tag} />
      <DataTable
        data={tags}
        emptyTitle="Chưa có thẻ"
        columns={[
          {
            key: "name",
            header: "Tên",
            cell: (row) => (
              <div>
                <div className="font-medium">{row.name}</div>
                <div className="text-xs text-muted-foreground">/{row.slug}</div>
              </div>
            ),
          },
          {
            key: "description",
            header: "Mô tả",
            cell: (row) => row.description ?? <span className="text-muted-foreground">Không có</span>,
          },
          {
            key: "usage",
            header: "Sử dụng",
            cell: (row) => <AdminBadge variant={row._count.posts > 0 ? "blue" : "neutral"}>{row._count.posts} bài viết</AdminBadge>,
          },
          {
            key: "actions",
            header: "",
            className: "w-32 text-right",
            cell: (row) => (
              <div className="flex justify-end gap-2">
                <Button asChild size="icon-sm" variant="ghost">
                  <Link href={`/admin/tags?edit=${row.id}`}>
                    <EditIcon />
                    <span className="sr-only">Sửa</span>
                  </Link>
                </Button>
                <form action={deleteTagAction}>
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
    </div>
  )
}
