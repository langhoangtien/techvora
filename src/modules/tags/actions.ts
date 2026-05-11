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

export async function saveTagAction(
  _prevState: TagFormState,
  formData: FormData
): Promise<TagFormState> {
  if (!(await ensureAdmin())) {
    return {
      ok: false,
      message: "Báº¡n khÃ´ng cÃ³ quyá»n lÆ°u tháº».",
    }
  }

  const id = nullableText(formData, "id")
  const name = text(formData, "name")
  const slug = slugify(text(formData, "slug") || name)
  const description = nullableText(formData, "description")
  const errors: TagFormState["errors"] = {}

  if (!name) {
    errors.name = "Vui lÃ²ng nháº­p tÃªn tháº»."
  }

  if (!slug) {
    errors.slug = "Vui lÃ²ng nháº­p slug há»£p lá»‡."
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
    errors.slug = "Slug nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin tháº».",
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

  return {
    ok: true,
    message: id ? "ÄÃ£ cáº­p nháº­t tháº»." : "ÄÃ£ táº¡o tháº».",
  }
}

export async function deleteTagAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/tags", { error: "Ban khong co quyen xoa the." }))
  }

  const id = text(formData, "id")
  const tag = await prisma.tag.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })

  if (!tag) {
    redirect(adminRedirect("/admin/tags", { error: "Khong tim thay the." }))
  }

  if (tag._count.posts > 0) {
    redirect(adminRedirect("/admin/tags", { error: "Khong the xoa the dang duoc gan vao bai viet." }))
  }

  try {
    await prisma.tag.delete({
      where: { id },
    })
  } catch {
    redirect(adminRedirect("/admin/tags", { error: deleteErrorMessage("the") }))
  }

  revalidatePath("/admin/tags")
  redirect(adminRedirect("/admin/tags", { success: "Da xoa the." }))
}