"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

export type AuthorFormState = {
  ok: boolean
  message?: string
  errors?: Partial<Record<"name" | "slug", string>>
}

const locale = "en"

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key)
  return value ? value : null
}

async function ensureAdmin() {
  return isAdminSession()
}

export async function saveAuthorAction(
  _prevState: AuthorFormState,
  formData: FormData
): Promise<AuthorFormState> {
  if (!(await ensureAdmin())) {
    return {
      ok: false,
      message: "Bạn không có quyền lưu tác giả.",
    }
  }

  const id = nullableText(formData, "id")
  const name = text(formData, "name")
  const slug = slugify(text(formData, "slug") || name)
  const errors: AuthorFormState["errors"] = {}

  if (!name) {
    errors.name = "Vui lòng nhập tên tác giả."
  }

  if (!slug) {
    errors.slug = "Vui lòng nhập slug hợp lệ."
  }

  const existingSlug = slug
    ? await prisma.author.findUnique({
        where: {
          slug_locale: {
            slug,
            locale,
          },
        },
        select: {
          id: true,
        },
      })
    : null

  if (existingSlug && existingSlug.id !== id) {
    errors.slug = "Slug này đã được sử dụng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin tác giả.",
      errors,
    }
  }

  const data = {
    name,
    slug,
    bio: nullableText(formData, "bio"),
    avatarUrl: nullableText(formData, "avatarUrl"),
    websiteUrl: nullableText(formData, "websiteUrl"),
    twitterUrl: nullableText(formData, "twitterUrl"),
    linkedinUrl: nullableText(formData, "linkedinUrl"),
  }

  if (id) {
    await prisma.author.update({
      where: { id },
      data,
    })
  } else {
    await prisma.author.create({
      data: {
        ...data,
        locale,
      },
    })
  }

  revalidatePath("/admin/authors")

  return {
    ok: true,
    message: id ? "Đã cập nhật tác giả." : "Đã tạo tác giả.",
  }
}

export async function deleteAuthorAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/authors", { error: "Bạn không có quyền xóa tác giả." }))
  }

  const id = text(formData, "id")
  const author = await prisma.author.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } })
  if (!author) redirect(adminRedirect("/admin/authors", { error: "Không tìm thấy tác giả." }))
  if (author._count.posts > 0) redirect(adminRedirect("/admin/authors", { error: "Không thể xóa tác giả đang có bài viết." }))
  try { await prisma.author.delete({ where: { id } }) } catch { redirect(adminRedirect("/admin/authors", { error: deleteErrorMessage("tác giả") })) }
  revalidatePath("/admin/authors")
  redirect(adminRedirect("/admin/authors", { success: "Đã xóa tác giả." }))
}
