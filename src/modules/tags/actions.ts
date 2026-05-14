"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

export type TagFormState = {
  ok: boolean
  message?: string
  errors?: Partial<Record<"name" | "slug", string>>
}

const locale = "de-DE"

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

export async function saveTagAction(
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  if (!(await ensureAdmin())) {
    return {
      ok: false,
      message: "Bạn không có quyền lưu thẻ.",
    }
  }

  const id = nullableText(formData, "id")
  const name = text(formData, "name")
  const slug = slugify(text(formData, "slug") || name)
  const description = nullableText(formData, "description")
  const errors: TagFormState["errors"] = {}

  if (!name) {
    errors.name = "Vui lòng nhập tên thẻ."
  }

  if (!slug) {
    errors.slug = "Vui lòng nhập slug hợp lệ."
  }

  const existingSlug = slug
    ? await prisma.tag.findUnique({
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
      message: "Vui lòng kiểm tra lại thông tin thẻ.",
      errors,
    }
  }

  if (id) {
    await prisma.tag.update({
      where: { id },
      data: {
        name,
        slug,
        description,
      },
    })
  } else {
    await prisma.tag.create({
      data: {
        name,
        slug,
        locale,
        description,
      },
    })
  }

  revalidatePath("/admin/tags")
  redirect(adminRedirect("/admin/tags", { success: id ? "Đã cập nhật thẻ." : "Đã tạo thẻ." }))
}

export async function deleteTagAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/tags", { error: "Bạn không có quyền xóa thẻ." }))
  }

  const id = text(formData, "id")
  const tag = await prisma.tag.findUnique({ where: { id }, include: { _count: { select: { posts: true } } } })
  if (!tag) redirect(adminRedirect("/admin/tags", { error: "Không tìm thấy thẻ." }))
  if (tag._count.posts > 0) redirect(adminRedirect("/admin/tags", { error: "Không thể xóa thẻ đang được gắn vào bài viết." }))
  try { await prisma.tag.delete({ where: { id } }) } catch { redirect(adminRedirect("/admin/tags", { error: deleteErrorMessage("thẻ") })) }
  revalidatePath("/admin/tags")
  redirect(adminRedirect("/admin/tags", { success: "Đã xóa thẻ." }))
}
