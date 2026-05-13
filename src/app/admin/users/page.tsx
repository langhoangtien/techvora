import type { Metadata } from "next"
import { IconEdit, IconPlus } from "@tabler/icons-react"

import { getUsersForAdmin, getUserForEdit } from "@/modules/users/queries"
import { requireAdmin } from "@/lib/admin-auth"
import { UserForm } from "@/app/admin/users/user-form"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Quản lý người dùng",
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

function roleLabel(role: string) {
  return {
    ADMIN: "Quản trị viên",
    EDITOR: "Biên tập viên",
  }[role] ?? role
}

function pageHref(
  page: number,
  params: Record<string, string | string[] | undefined>,
) {
  const search = new URLSearchParams()

  for (const [key, raw] of Object.entries(params)) {
    if (key === "page" || key === "edit") continue

    const next = Array.isArray(raw) ? raw[0] : raw

    if (next) {
      search.set(key, next)
    }
  }

  search.set("page", String(page))

  return `/admin/users?${search.toString()}`
}

export default async function UsersPage({ searchParams }: PageProps) {
  await requireAdmin()

  const params = (await searchParams) ?? {}

  const page = Number(value(params, "page") ?? 1)
  const q = value(params, "q") ?? ""
  const editId = value(params, "edit")

  const [{ users, total, totalPages }, editUser] = await Promise.all([
    getUsersForAdmin(q, page),
    getUserForEdit(editId),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Quản lý người dùng
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý tài khoản người dùng, vai trò và quyền hạn.
          </p>
        </div>

        <UserForm
          trigger={
            <Button>
              <IconPlus />
              Tạo người dùng
            </Button>
          }
        />
      </div>

      {editUser ? <UserForm key={editUser.id} user={editUser} /> : null}

      <form className="flex gap-2 rounded-lg border bg-card p-4">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Tìm kiếm theo email hoặc tên..."
          className="flex-1"
        />

        <Button type="submit" variant="outline">
          Tìm kiếm
        </Button>
      </form>

      <DataTable
        data={users}
        emptyTitle="Chưa có người dùng"
        columns={[
          {
            key: "email",
            header: "Email",
            cell: (row) => (
              <div>
                <div className="font-medium">{row.email}</div>
                {row.name && (
                  <div className="text-xs text-muted-foreground">{row.name}</div>
                )}
              </div>
            ),
          },
          {
            key: "role",
            header: "Vai trò",
            cell: (row) => (
              <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium">
                {roleLabel(row.role)}
              </span>
            ),
          },
          {
            key: "author",
            header: "Tác giả",
            cell: (row) => row.author?.slug ?? "Chưa có",
          },
          {
            key: "posts",
            header: "Bài viết",
            cell: (row) => row.author?._count.posts ?? 0,
          },
          {
            key: "createdAt",
            header: "Ngày tạo",
            cell: (row) => formatDate(row.createdAt),
          },
          {
            key: "actions",
            header: "Hành động",
            className: "text-right",
            cell: (row) => (
              <Button asChild size="sm" variant="ghost">
                <a href={`?edit=${row.id}`}>
                  <IconEdit className="h-4 w-4" />
                </a>
              </Button>
            ),
          },
        ]}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {(page - 1) * 10 + 1} đến {Math.min(page * 10, total)} trên {total} người dùng
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={page === 1}
            >
              <a href={pageHref(page - 1, params)}>
                Trang trước
              </a>
            </Button>

            <Button variant="outline" size="sm" disabled>
              Trang {page} / {totalPages}
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              disabled={page === totalPages}
            >
              <a href={pageHref(page + 1, params)}>
                Trang sau
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
