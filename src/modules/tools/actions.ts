"use server"

import type { PostStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import {
  toolComponentKeys,
  type ToolComponentKey,
} from "@/modules/tools/definitions"

export type ToolFormState = {
  ok: boolean
  message?: string
  errors?: Partial<Record<string, string>>
}

const validStatuses = new Set(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"])

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key)
  return value ? value : null
}

function optionalInt(formData: FormData, key: string) {
  const value = Number(text(formData, key) || 0)
  return Number.isFinite(value) ? value : 0
}

function isValidOptionalUrl(value: string | null) {
  if (!value) return true
  if (value.startsWith("/")) return true
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

async function ensureAdmin() {
  return isAdminSession()
}

export async function saveToolAction(
  _prevState: ToolFormState,
  formData: FormData
): Promise<ToolFormState> {
  if (!(await ensureAdmin())) {
    return { ok: false, message: "Báº¡n khÃ´ng cÃ³ quyá»n lÆ°u cÃ´ng cá»¥." }
  }

  const id = nullableText(formData, "id")
  const name = text(formData, "name")
  const slug = slugify(text(formData, "slug") || name)
  const status = text(formData, "status") as PostStatus
  const componentKey = nullableText(formData, "componentKey")
  const canonical = nullableText(formData, "canonicalUrl")
  const ogImageUrl = nullableText(formData, "ogImageUrl")
  const errors: ToolFormState["errors"] = {}

  if (!name) errors.name = "Vui lÃ²ng nháº­p tÃªn cÃ´ng cá»¥."
  if (!slug) errors.slug = "Vui lÃ²ng nháº­p slug há»£p lá»‡."
  if (!validStatuses.has(status)) errors.status = "Tráº¡ng thÃ¡i khÃ´ng há»£p lá»‡."
  if (componentKey && !toolComponentKeys.includes(componentKey as ToolComponentKey)) {
    errors.componentKey = "Component key khÃ´ng há»£p lá»‡."
  }
  if (!isValidOptionalUrl(canonical)) errors.canonicalUrl = "Canonical URL khÃ´ng há»£p lá»‡."
  if (!isValidOptionalUrl(ogImageUrl)) errors.ogImageUrl = "OG image URL khÃ´ng há»£p lá»‡."

  const existingSlug = slug
    ? await prisma.tool.findFirst({
        where: { slug },
        select: { id: true },
      })
    : null

  if (existingSlug && existingSlug.id !== id) {
    errors.slug = "Slug nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin cÃ´ng cá»¥.",
      errors,
    }
  }

  const current = id
    ? await prisma.tool.findUnique({ where: { id }, select: { publishedAt: true } })
    : null
  const publishedAt =
    status === "PUBLISHED" && !current?.publishedAt ? new Date() : current?.publishedAt

  const data = {
    name,
    slug,
    shortDescription: nullableText(formData, "shortDescription"),
    tagline: nullableText(formData, "shortDescription"),
    description: nullableText(formData, "description"),
    content: nullableText(formData, "content"),
    status,
    categoryId: nullableText(formData, "categoryId"),
    componentKey,
    seoTitle: nullableText(formData, "seoTitle"),
    seoDesc: nullableText(formData, "seoDescription"),
    canonical,
    ogImageUrl,
    noIndex: formData.get("noindex") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    order: optionalInt(formData, "order"),
    publishedAt,
  }

  const tool = id
    ? await prisma.tool.update({ where: { id }, data })
    : await prisma.tool.create({ data })

  revalidatePath("/admin/tools")
  revalidatePath("/tools")
  revalidatePath(`/tools/${tool.slug}`)
  redirect(
    `/admin/tools/${tool.id}/edit?success=${encodeURIComponent(
      id ? "ÄÃ£ cáº­p nháº­t cÃ´ng cá»¥." : "ÄÃ£ táº¡o cÃ´ng cá»¥."
    )}`
  )
}

export async function deleteToolAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/tools", { error: "Ban khong co quyen xoa cong cu." }))
  }

  const id = text(formData, "id")
  try {
    await prisma.tool.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/tools", { error: deleteErrorMessage("cong cu") }))
  }
  revalidatePath("/admin/tools")
  revalidatePath("/tools")
  redirect(adminRedirect("/admin/tools", { success: "Da xoa cong cu." }))
}export async function bulkToolAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect("/admin/tools?error=Báº¡n khÃ´ng cÃ³ quyá»n cáº­p nháº­t cÃ´ng cá»¥.")
  }

  const action = text(formData, "bulkAction")
  const ids = formData.getAll("ids").map(String).filter(Boolean)

  if (ids.length === 0) {
    redirect("/admin/tools?error=Vui lÃ²ng chá»n Ã­t nháº¥t má»™t cÃ´ng cá»¥.")
  }

  if (action === "delete") {
    await prisma.tool.deleteMany({ where: { id: { in: ids } } })
  }

  if (action === "publish") {
    await prisma.tool.updateMany({
      where: { id: { in: ids } },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })
  }

  if (action === "draft") {
    await prisma.tool.updateMany({
      where: { id: { in: ids } },
      data: { status: "DRAFT" },
    })
  }

  revalidatePath("/admin/tools")
  revalidatePath("/tools")
  redirect("/admin/tools?success=ÄÃ£ cáº­p nháº­t hÃ ng loáº¡t.")
}
