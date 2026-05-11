import Link from "next/link"
import type { Metadata } from "next"
import { EditIcon, Trash2Icon } from "lucide-react"

import { deleteCategoryAction } from "@/modules/categories/actions"
import {
  getCategoriesForAdmin,
  getCategoryForEdit,
  getCategoryOptions,
} from "@/modules/categories/queries"
import { requireAdmin } from "@/lib/admin-auth"
import { AdminBadge } from "@/components/admin/badge"
import { CategoryForm } from "@/app/admin/categories/category-form"
import { DataTable } from "@/components/admin/data-table"
import { SearchFilter } from "@/components/admin/search-filter"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Danh mục",
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}

export default async function CategoriesPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const query = value(params, "q") ?? ""
  const editId = value(params, "edit")
  const success = value(params, "success")
  const error = value(params, "error")
  const [categories, categoryOptions, category] = await Promise.all([
    getCategoriesForAdmin(query),
    getCategoryOptions(),
    getCategoryForEdit(editId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Danh mục</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo và quản lý phân cấp danh mục cho nội dung public.
          </p>
        </div>
        <SearchFilter defaultValue={query} placeholder="Tìm danh mục" />
      </div>
      {success ? <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      {error ? <div className="rounded-lg border bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div> : null}
      <CategoryForm category={category} categories={categoryOptions} />
      <DataTable
        data={categories}
        emptyTitle="Chưa có danh mục"
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
            key: "parent",
            header: "Danh mục cha",
            cell: (row) => row.parent?.name ?? <span className="text-muted-foreground">Không có</span>,
          },
          {
            key: "featured",
            header: "Trạng thái",
            cell: (row) => (
              <div className="flex flex-wrap gap-2">
                {row.isFeatured ? <AdminBadge variant="amber">Nổi bật</AdminBadge> : <AdminBadge>Thường</AdminBadge>}
                {row._count.children > 0 ? <AdminBadge variant="blue">{row._count.children} mục con</AdminBadge> : null}
              </div>
            ),
          },
          {
            key: "usage",
            header: "Sử dụng",
            cell: (row) => (
              <span className="text-muted-foreground">
                {row._count.posts} bài viết · {row._count.tools} công cụ
              </span>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "w-32 text-right",
            cell: (row) => (
              <div className="flex justify-end gap-2">
                <Button asChild size="icon-sm" variant="ghost">
                  <Link href={`/admin/categories?edit=${row.id}`}>
                    <EditIcon />
                    <span className="sr-only">Sửa</span>
                  </Link>
                </Button>
                <form action={deleteCategoryAction}>
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
