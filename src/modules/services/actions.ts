"use server"

import type { PostStatus } from "@/generated/prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import { createAutoRedirectIfSlugChanged } from "@/modules/redirects/actions"
import { pathForContentSlug } from "@/modules/redirects/paths"

export type ServiceFormState = {
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

export async function saveServiceAction(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  if (!(await ensureAdmin())) {
    return { ok: false, message: "B?n không có quy?n luu service." }
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
  const errors: ServiceFormState["errors"] = {}

  if (!name) errors.name = "Vui lòng nh?p tên s?n ph?m."
  if (!slug) errors.slug = "Vui lòng nh?p slug h?p l?."
  if (!validStatuses.has(status)) errors.status = "Tr?ng thái không h?p l?."
  if (!isValidOptionalUrl(logoUrl)) errors.logoUrl = "Logo URL không h?p l?."
  if (!isValidOptionalUrl(websiteUrl)) errors.websiteUrl = "Website URL không h?p l?."
  if (!isValidOptionalUrl(affiliateUrl)) errors.affiliateUrl = "Affiliate URL không h?p l?."
  if (!isValidOptionalUrl(canonicalUrl)) errors.canonicalUrl = "Canonical URL không h?p l?."
  if (!isValidOptionalUrl(ogImageUrl)) errors.ogImageUrl = "OG image URL không h?p l?."
  if (Number.isNaN(pricingFrom)) errors.pricingFrom = "Giá kh?i di?m không h?p l?."
  if (Number.isNaN(rating) || (rating != null && (rating < 0 || rating > 5))) {
    errors.rating = "Rating ph?i n?m trong kho?ng 0 d?n 5."
  }

  const existingSlug = slug
    ? await prisma.serviceProduct.findUnique({
        where: { slug },
        select: { id: true },
      })
    : null

  if (existingSlug && existingSlug.id !== id) {
    errors.slug = "Slug này dã du?c s? d?ng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lòng ki?m tra l?i thông tin service.",
      errors,
    }
  }

  const current = id
    ? await prisma.serviceProduct.findUnique({
        where: { id },
        select: { publishedAt: true, slug: true },
      })
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
    ? await prisma.serviceProduct.update({ where: { id }, data })
    : await prisma.serviceProduct.create({ data })

  if (current && current.slug !== product.slug) {
    await createAutoRedirectIfSlugChanged({
      oldPath: pathForContentSlug("service", current.slug),
      newPath: pathForContentSlug("service", product.slug),
    })
    revalidatePath(pathForContentSlug("service", current.slug))
  }

  revalidatePath("/admin/services")
  revalidatePath("/services")
  revalidatePath(`/services/${product.slug}`)
  redirect(
    `/admin/services/${product.id}/edit?success=${encodeURIComponent(
      id ? "Ðã c?p nh?t service." : "Ðã t?o service."
    )}`
  )
}

export async function deleteServiceAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/services", { error: "B?n không có quy?n xóa service." }))
  }

  const id = text(formData, "id")
  try {
    await prisma.serviceProduct.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/services", { error: deleteErrorMessage("service") }))
  }
  revalidatePath("/admin/services")
  revalidatePath("/services")
  redirect(adminRedirect("/admin/services", { success: "Ðã xóa service." }))
}
