"use server"

import type { PostStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

export type SaaSFormState = {
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
  return text(formData, key)
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function optionalNumber(formData: FormData, key: string) {
  const value = text(formData, key)
  if (!value) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : Number.NaN
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

export async function saveSaaSAction(
  _prevState: SaaSFormState,
  formData: FormData
): Promise<SaaSFormState> {
  if (!(await ensureAdmin())) {
    return { ok: false, message: "Báº¡n khÃ´ng cÃ³ quyá»n lÆ°u SaaS product." }
  }

  const id = nullableText(formData, "id")
  const name = text(formData, "name")
  const slug = slugify(text(formData, "slug") || name)
  const status = text(formData, "status") as PostStatus
  const logoUrl = nullableText(formData, "logoUrl")
  const websiteUrl = nullableText(formData, "websiteUrl")
  const affiliateUrl = nullableText(formData, "affiliateUrl")
  const canonicalUrl = nullableText(formData, "canonicalUrl")
  const ogImageUrl = nullableText(formData, "ogImageUrl")
  const pricingFrom = optionalNumber(formData, "pricingFrom")
  const rating = optionalNumber(formData, "rating")
  const errors: SaaSFormState["errors"] = {}

  if (!name) errors.name = "Vui lÃ²ng nháº­p tÃªn sáº£n pháº©m."
  if (!slug) errors.slug = "Vui lÃ²ng nháº­p slug há»£p lá»‡."
  if (!validStatuses.has(status)) errors.status = "Tráº¡ng thÃ¡i khÃ´ng há»£p lá»‡."
  if (!isValidOptionalUrl(logoUrl)) errors.logoUrl = "Logo URL khÃ´ng há»£p lá»‡."
  if (!isValidOptionalUrl(websiteUrl)) errors.websiteUrl = "Website URL khÃ´ng há»£p lá»‡."
  if (!isValidOptionalUrl(affiliateUrl)) errors.affiliateUrl = "Affiliate URL khÃ´ng há»£p lá»‡."
  if (!isValidOptionalUrl(canonicalUrl)) errors.canonicalUrl = "Canonical URL khÃ´ng há»£p lá»‡."
  if (!isValidOptionalUrl(ogImageUrl)) errors.ogImageUrl = "OG image URL khÃ´ng há»£p lá»‡."
  if (Number.isNaN(pricingFrom)) errors.pricingFrom = "GiÃ¡ khá»Ÿi Ä‘iá»ƒm khÃ´ng há»£p lá»‡."
  if (Number.isNaN(rating) || (rating != null && (rating < 0 || rating > 5))) {
    errors.rating = "Rating pháº£i náº±m trong khoáº£ng 0 Ä‘áº¿n 5."
  }

  const existingSlug = slug
    ? await prisma.saaSProduct.findUnique({
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
      message: "Vui lÃ²ng kiá»ƒm tra láº¡i thÃ´ng tin SaaS product.",
      errors,
    }
  }

  const current = id
    ? await prisma.saaSProduct.findUnique({ where: { id }, select: { publishedAt: true } })
    : null
  const publishedAt =
    status === "PUBLISHED" && !current?.publishedAt ? new Date() : current?.publishedAt

  const data = {
    name,
    slug,
    shortDescription: nullableText(formData, "shortDescription"),
    description: nullableText(formData, "description"),
    logoUrl,
    websiteUrl,
    affiliateUrl,
    category: nullableText(formData, "category"),
    pricingModel: nullableText(formData, "pricingModel"),
    pricingFrom: pricingFrom == null || Number.isNaN(pricingFrom) ? null : pricingFrom,
    currency: text(formData, "currency") || "USD",
    rating: rating == null || Number.isNaN(rating) ? null : rating,
    features: list(formData, "features"),
    pros: list(formData, "pros"),
    cons: list(formData, "cons"),
    bestFor: list(formData, "bestFor"),
    alternatives: list(formData, "alternatives"),
    status,
    isFeatured: formData.get("isFeatured") === "on",
    order: optionalInt(formData, "order"),
    seoTitle: nullableText(formData, "seoTitle"),
    seoDescription: nullableText(formData, "seoDescription"),
    canonicalUrl,
    ogImageUrl,
    noindex: formData.get("noindex") === "on",
    publishedAt,
  }

  const product = id
    ? await prisma.saaSProduct.update({ where: { id }, data })
    : await prisma.saaSProduct.create({ data })

  revalidatePath("/admin/saas")
  revalidatePath("/saas")
  revalidatePath(`/saas/${product.slug}`)
  redirect(
    `/admin/saas/${product.id}/edit?success=${encodeURIComponent(
      id ? "ÄÃ£ cáº­p nháº­t SaaS product." : "ÄÃ£ táº¡o SaaS product."
    )}`
  )
}

export async function deleteSaaSAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/saas", { error: "Ban khong co quyen xoa SaaS product." }))
  }

  const id = text(formData, "id")
  try {
    await prisma.saaSProduct.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/saas", { error: deleteErrorMessage("SaaS product") }))
  }
  revalidatePath("/admin/saas")
  revalidatePath("/saas")
  redirect(adminRedirect("/admin/saas", { success: "Da xoa SaaS product." }))
}