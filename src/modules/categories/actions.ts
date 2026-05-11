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
      message: "Báº¡n khÃ´ng cÃ³ quyá»n lÆ°u danh má»¥c.",
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
    errors.name = "Vui lÃ²ng nháº­p tÃªn danh má»¥c."
  }

  if (!slug) {
    errors.slug = "Vui lÃ²ng nháº­p slug há»£p lá»‡."
  }

  if (!Number.isInteger(order)) {
    errors.order = "Thá»© tá»± pháº£i lÃ  sá»‘ nguyÃªn."
  }

  if (id && parentId === id) {
    errors.parentId = "Danh má»¥c khÃ´ng thá»ƒ chá»n chÃ­nh nÃ³ lÃ m danh má»¥c cha."
  }

  if (id && parentId) {
    const descendants = await getDescendantIds(id)

    if (descendants.has(parentId)) {
      errors.parentId = "KhÃ´ng thá»ƒ chá»n danh má»¥c con lÃ m danh má»¥c cha."
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
    errors.slug = "Slug nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin danh má»¥c.",
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

  return {
    ok: true,
    message: id ? "ÄÃ£ cáº­p nháº­t danh má»¥c." : "ÄÃ£ táº¡o danh má»¥c.",
  }
}

export async function deleteCategoryAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/categories", { error: "Ban khong co quyen xoa danh muc." }))
  }

  const id = text(formData, "id")
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
          tools: true,
        },
      },
    },
  })

  if (!category) {
    redirect(adminRedirect("/admin/categories", { error: "Khong tim thay danh muc." }))
  }

  if (category._count.posts > 0 || category._count.tools > 0) {
    redirect(adminRedirect("/admin/categories", { error: "Khong the xoa danh muc dang co bai viet hoac cong cu." }))
  }

  try {
    await prisma.category.delete({
      where: { id },
    })
  } catch {
    redirect(adminRedirect("/admin/categories", { error: deleteErrorMessage("danh muc") }))
  }

  revalidatePath("/admin/categories")
  redirect(adminRedirect("/admin/categories", { success: "Da xoa danh muc." }))
}