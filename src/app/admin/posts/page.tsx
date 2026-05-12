import Link from "next/link"
import type { Metadata } from "next"
import {
  IconEdit,
  IconEye,
  IconPlus,
} from "@tabler/icons-react"

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
  title: "Bài viết",
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
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

function pageHref(
  page: number,
  params: Record<string, string | string[] | undefined>,
) {
  const search = new URLSearchParams()

  for (const [key, raw] of Object.entries(params)) {
    if (key === "page") continue

    const next = Array.isArray(raw) ? raw[0] : raw

    if (next) {
      search.set(key, next)
    }
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
          <h1 className="text-2xl font-semibold tracking-tight">
            Bài viết
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý nội dung CMS, trạng thái xuất bản và preview.
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/posts/new">
            <IconPlus />
            Tạo bài viết
          </Link>
        </Button>
      </div>

      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-5">
        <Input
          name="q"
          defaultValue={filters.q}
          placeholder="Tìm bài viết"
        />

        <select
          name="status"
          defaultValue={filters.status}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Nháp</option>
          <option value="PUBLISHED">Xuất bản</option>
          <option value="SCHEDULED">Lên lịch</option>
          <option value="ARCHIVED">Lưu trữ</option>
        </select>

        <select
          name="type"
          defaultValue={filters.type}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm"
        >
          <option value="">Tất cả loại</option>
          <option value="ARTICLE">Article</option>
          <option value="TOOL">Tool</option>
          <option value="SAAS">Services</option>
          <option value="COMPARISON">Comparison</option>
          <option value="PAGE">Page</option>
        </select>

        <select
          name="categoryId"
          defaultValue={filters.categoryId}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm"
        >
          <option value="">Tất cả danh mục</option>

          {options.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <select
            name="authorId"
            defaultValue={filters.authorId}
            className="h-8 min-w-0 flex-1 rounded-lg border bg-background px-2.5 text-sm"
          >
            <option value="">Tất cả tác giả</option>

            {options.authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>

          <Button type="submit" variant="outline">
            Lọc
          </Button>
        </div>
      </form>

      <form
        id="bulk-posts-form"
        action={bulkPostAction}
        className="flex flex-wrap gap-2"
      >
        <select
          name="bulkAction"
          className="h-8 rounded-lg border bg-background px-2.5 text-sm"
        >
          <option value="publish">Xuất bản</option>
          <option value="draft">Chuyển nháp</option>
          <option value="delete">Xóa</option>
        </select>

        <Button type="submit" variant="outline">
          Áp dụng hàng loạt
        </Button>
      </form>

      <DataTable
        data={posts}
        emptyTitle="Chưa có bài viết"
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
            header: "Tiêu đề",
            cell: (row) => (
              <div>
                <div className="font-medium">{row.title}</div>

                <div className="text-xs text-muted-foreground">
                  /{row.slug}
                </div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Trạng thái",
            cell: (row) => (
              <StatusBadge status={row.status} />
            ),
          },
          {
            key: "type",
            header: "Loại",
            cell: (row) => row.type,
          },
          {
            key: "taxonomy",
            header: "Phân loại",
            cell: (row) => (
              <span className="text-muted-foreground">
                {row.category?.name ?? "Không danh mục"} ·{" "}
                {row.author?.name ?? "Không tác giả"}
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
                  <Link
                    href={`/preview/${row.id}`}
                    target="_blank"
                  >
                    <IconEye />
                    <span className="sr-only">Preview</span>
                  </Link>
                </Button>

                <Button asChild size="icon-sm" variant="ghost">
                  <Link href={`/admin/posts/${row.id}/edit`}>
                    <IconEdit />
                    <span className="sr-only">Sửa</span>
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
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page - 1, params)}>
                Trang trước
              </Link>
            </Button>
          ) : null}

          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link href={pageHref(page + 1, params)}>
                Trang sau
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}