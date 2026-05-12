"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

export type CategoryFormState = {
  ok: boolean
  message?: string
  errors?: Partial<Record<"name" | "slug" | "parentId" | "order", string>>
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
  if (!(await isAdminSession())) {
    return false
  }

  return true
}

async function getDescendantIds(categoryId: string) {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      parentId: true,
    },
  })
  const descendants = new Set<string>()
  const queue = [categoryId]

  while (queue.length > 0) {
    const currentId = queue.shift()
    const children = categories.filter((category) => category.parentId === currentId)

    for (const child of children) {
      if (!descendants.has(child.id)) {
        descendants.add(child.id)
        queue.push(child.id)
      }
    }
  }

  return descendants
}

export async function saveCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  if (!(await ensureAdmin())) {
    return {
      ok: false,
      message: "Bạn không có quyền lưu danh mục.",
    }
  }

  const id = nullableText(formData, "id")
  const name = text(formData, "name")
  const slug = slugify(text(formData, "slug") || name)
  const description = nullableText(formData, "description")
  const parentId = nullableText(formData, "parentId")
  const orderValue = text(formData, "order")
  const order = orderValue ? Number(orderValue) : 0
  const isFeatured = formData.get("isFeatured") === "on"
  const errors: CategoryFormState["errors"] = {}

  if (!name) {
    errors.name = "Vui lòng nhập tên danh mục."
  }

  if (!slug) {
    errors.slug = "Vui lòng nhập slug hợp lệ."
  }

  if (!Number.isInteger(order)) {
    errors.order = "Thứ tự phải là số nguyên."
  }

  if (id && parentId === id) {
    errors.parentId = "Danh mục không thể chọn chính nó làm danh mục cha."
  }

  if (id && parentId) {
    const descendants = await getDescendantIds(id)

    if (descendants.has(parentId)) {
      errors.parentId = "Không thể chọn danh mục con làm danh mục cha."
    }
  }

  const existingSlug = slug
    ? await prisma.category.findUnique({
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
      message: "Vui lòng kiểm tra lại thông tin danh mục.",
      errors,
    }
  }

  if (id) {
    await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        parentId,
        order,
        isFeatured,
      },
    })
  } else {
    await prisma.category.create({
      data: {
        name,
        slug,
        locale,
        description,
        parentId,
        order,
        isFeatured,
      },
    })
  }

  revalidatePath("/admin/categories")
  redirect(adminRedirect("/admin/categories", { success: id ? "Đã cập nhật danh mục." : "Đã tạo danh mục." }))
}

export async function deleteCategoryAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/categories", { error: "Bạn không có quyền xóa danh mục." }))
  }

  const id = text(formData, "id")
  const category = await prisma.category.findUnique({ where: { id }, include: { _count: { select: { posts: true, tools: true } } } })
  if (!category) redirect(adminRedirect("/admin/categories", { error: "Không tìm thấy danh mục." }))
  if (category._count.posts > 0 || category._count.tools > 0) redirect(adminRedirect("/admin/categories", { error: "Không thể xóa danh mục đang có bài viết hoặc công cụ." }))
  try { await prisma.category.delete({ where: { id } }) } catch { redirect(adminRedirect("/admin/categories", { error: deleteErrorMessage("danh mục") })) }
  revalidatePath("/admin/categories")
  redirect(adminRedirect("/admin/categories", { success: "Đã xóa danh mục." }))
}
