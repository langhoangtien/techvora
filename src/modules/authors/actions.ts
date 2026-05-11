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
      message: "Báº¡n khÃ´ng cÃ³ quyá»n lÆ°u tÃ¡c giáº£.",
    }
  }

  const id = nullableText(formData, "id")
  const name = text(formData, "name")
  const slug = slugify(text(formData, "slug") || name)
  const errors: AuthorFormState["errors"] = {}

  if (!name) {
    errors.name = "Vui lÃ²ng nháº­p tÃªn tÃ¡c giáº£."
  }

  if (!slug) {
    errors.slug = "Vui lÃ²ng nháº­p slug há»£p lá»‡."
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
    errors.slug = "Slug nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin tÃ¡c giáº£.",
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
    message: id ? "ÄÃ£ cáº­p nháº­t tÃ¡c giáº£." : "ÄÃ£ táº¡o tÃ¡c giáº£.",
  }
}

export async function deleteAuthorAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/authors", { error: "Ban khong co quyen xoa tac gia." }))
  }

  const id = text(formData, "id")
  const author = await prisma.author.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  })

  if (!author) {
    redirect(adminRedirect("/admin/authors", { error: "Khong tim thay tac gia." }))
  }

  if (author._count.posts > 0) {
    redirect(adminRedirect("/admin/authors", { error: "Khong the xoa tac gia dang co bai viet." }))
  }

  try {
    await prisma.author.delete({
      where: { id },
    })
  } catch {
    redirect(adminRedirect("/admin/authors", { error: deleteErrorMessage("tac gia") }))
  }

  revalidatePath("/admin/authors")
  redirect(adminRedirect("/admin/authors", { success: "Da xoa tac gia." }))
}