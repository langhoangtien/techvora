"use server"

import type { PostStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import { parseComparisonTable } from "@/modules/comparisons/utils"

export type ComparisonFormState = {
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

function list(formData: FormData, key: string) {
  return text(formData, key).split(/\r?\n/).map((item) => item.trim()).filter(Boolean)
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

export async function saveComparisonAction(
  _prevState: ComparisonFormState,
  formData: FormData
): Promise<ComparisonFormState> {
  if (!(await ensureAdmin())) {
    return { ok: false, message: "Báº¡n khÃ´ng cÃ³ quyá»n lÆ°u comparison." }
  }

  const id = nullableText(formData, "id")
  const title = text(formData, "title")
  const slug = slugify(text(formData, "slug") || title)
  const status = text(formData, "status") as PostStatus
  const urlKeys = [
    "itemALogoUrl",
    "itemBLogoUrl",
    "itemAUrl",
    "itemBUrl",
    "itemAAffiliateUrl",
    "itemBAffiliateUrl",
    "canonicalUrl",
    "ogImageUrl",
  ]
  const errors: ComparisonFormState["errors"] = {}

  if (!title) errors.title = "Vui lÃ²ng nháº­p tiÃªu Ä‘á»."
  if (!slug) errors.slug = "Vui lÃ²ng nháº­p slug há»£p lá»‡."
  if (!text(formData, "itemAName")) errors.itemAName = "Vui lÃ²ng nháº­p tÃªn item A."
  if (!text(formData, "itemBName")) errors.itemBName = "Vui lÃ²ng nháº­p tÃªn item B."
  if (!validStatuses.has(status)) errors.status = "Tráº¡ng thÃ¡i khÃ´ng há»£p lá»‡."
  for (const key of urlKeys) {
    if (!isValidOptionalUrl(nullableText(formData, key))) {
      errors[key] = `${key} khÃ´ng há»£p lá»‡.`
    }
  }

  let comparisonTable: ReturnType<typeof parseComparisonTable> = []
  try {
    comparisonTable = parseComparisonTable(text(formData, "comparisonTable"))
  } catch {
    errors.comparisonTable = "Comparison table pháº£i lÃ  JSON array há»£p lá»‡."
  }

  const existingSlug = slug
    ? await prisma.comparison.findUnique({ where: { slug }, select: { id: true } })
    : null
  if (existingSlug && existingSlug.id !== id) {
    errors.slug = "Slug nÃ y Ä‘Ã£ Ä‘Æ°á»£c sá»­ dá»¥ng."
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin comparison.", errors }
  }

  const current = id
    ? await prisma.comparison.findUnique({ where: { id }, select: { publishedAt: true } })
    : null
  const publishedAt =
    status === "PUBLISHED" && !current?.publishedAt ? new Date() : current?.publishedAt

  const data = {
    title,
    slug,
    excerpt: nullableText(formData, "excerpt"),
    itemAName: text(formData, "itemAName"),
    itemBName: text(formData, "itemBName"),
    itemALogoUrl: nullableText(formData, "itemALogoUrl"),
    itemBLogoUrl: nullableText(formData, "itemBLogoUrl"),
    itemAUrl: nullableText(formData, "itemAUrl"),
    itemBUrl: nullableText(formData, "itemBUrl"),
    itemAAffiliateUrl: nullableText(formData, "itemAAffiliateUrl"),
    itemBAffiliateUrl: nullableText(formData, "itemBAffiliateUrl"),
    summary: nullableText(formData, "summary"),
    verdict: nullableText(formData, "verdict"),
    winner: nullableText(formData, "winner"),
    comparisonTable,
    prosA: list(formData, "prosA"),
    consA: list(formData, "consA"),
    prosB: list(formData, "prosB"),
    consB: list(formData, "consB"),
    bestForA: list(formData, "bestForA"),
    bestForB: list(formData, "bestForB"),
    content: nullableText(formData, "content"),
    status,
    isFeatured: formData.get("isFeatured") === "on",
    order: optionalInt(formData, "order"),
    seoTitle: nullableText(formData, "seoTitle"),
    seoDescription: nullableText(formData, "seoDescription"),
    canonicalUrl: nullableText(formData, "canonicalUrl"),
    ogImageUrl: nullableText(formData, "ogImageUrl"),
    noindex: formData.get("noindex") === "on",
    publishedAt,
  }

  const comparison = id
    ? await prisma.comparison.update({ where: { id }, data })
    : await prisma.comparison.create({ data })

  revalidatePath("/admin/comparisons")
  revalidatePath("/compare")
  revalidatePath(`/compare/${comparison.slug}`)
  redirect(
    `/admin/comparisons/${comparison.id}/edit?success=${encodeURIComponent(
      id ? "ÄÃ£ cáº­p nháº­t comparison." : "ÄÃ£ táº¡o comparison."
    )}`
  )
}

export async function deleteComparisonAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/comparisons", { error: "Ban khong co quyen xoa comparison." }))
  }

  const id = text(formData, "id")
  try {
    await prisma.comparison.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/comparisons", { error: deleteErrorMessage("comparison") }))
  }
  revalidatePath("/admin/comparisons")
  revalidatePath("/compare")
  redirect(adminRedirect("/admin/comparisons", { success: "Da xoa comparison." }))
}