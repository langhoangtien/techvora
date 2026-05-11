"use server"

import type { PostStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

export type HostingFormState = {
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

export async function saveHostingAction(
  _prevState: HostingFormState,
  formData: FormData
): Promise<HostingFormState> {
  if (!(await ensureAdmin())) {
    return { ok: false, message: "Bạn không có quyền lưu hosting review." }
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
  const errors: HostingFormState["errors"] = {}

  if (!name) errors.name = "Vui lòng nhập tên nhà cung cấp."
  if (!slug) errors.slug = "Vui lòng nhập slug hợp lệ."
  if (!validStatuses.has(status)) errors.status = "Trạng thái không hợp lệ."
  if (!isValidOptionalUrl(logoUrl)) errors.logoUrl = "Logo URL không hợp lệ."
  if (!isValidOptionalUrl(websiteUrl)) errors.websiteUrl = "Website URL không hợp lệ."
  if (!isValidOptionalUrl(affiliateUrl)) errors.affiliateUrl = "Affiliate URL không hợp lệ."
  if (!isValidOptionalUrl(canonicalUrl)) errors.canonicalUrl = "Canonical URL không hợp lệ."
  if (!isValidOptionalUrl(ogImageUrl)) errors.ogImageUrl = "OG image URL không hợp lệ."
  if (Number.isNaN(pricingFrom)) errors.pricingFrom = "Giá khởi điểm không hợp lệ."
  if (Number.isNaN(rating) || (rating != null && (rating < 0 || rating > 5))) {
    errors.rating = "Rating phải nằm trong khoảng 0 đến 5."
  }

  const existingSlug = slug
    ? await prisma.hostingProvider.findUnique({
        where: { slug },
        select: { id: true },
      })
    : null

  if (existingSlug && existingSlug.id !== id) {
    errors.slug = "Slug này đã được sử dụng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin hosting review.",
      errors,
    }
  }

  const current = id
    ? await prisma.hostingProvider.findUnique({ where: { id }, select: { publishedAt: true } })
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
    pricingFrom: pricingFrom == null || Number.isNaN(pricingFrom) ? null : pricingFrom,
    currency: text(formData, "currency") || "USD",
    rating: rating == null || Number.isNaN(rating) ? null : rating,
    pros: list(formData, "pros"),
    cons: list(formData, "cons"),
    features: list(formData, "features"),
    bestFor: list(formData, "bestFor"),
    performanceNotes: nullableText(formData, "performanceNotes"),
    supportNotes: nullableText(formData, "supportNotes"),
    dataCenterLocations: list(formData, "dataCenterLocations"),
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

  const provider = id
    ? await prisma.hostingProvider.update({ where: { id }, data })
    : await prisma.hostingProvider.create({ data })

  revalidatePath("/admin/hosting")
  revalidatePath("/hosting")
  revalidatePath(`/hosting/${provider.slug}`)
  redirect(
    `/admin/hosting/${provider.id}/edit?success=${encodeURIComponent(
      id ? "Đã cập nhật hosting review." : "Đã tạo hosting review."
    )}`
  )
}

export async function deleteHostingAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/hosting", { error: "Bạn không có quyền xóa hosting review." }))
  }

  const id = text(formData, "id")
  try {
    await prisma.hostingProvider.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/hosting", { error: deleteErrorMessage("hosting review") }))
  }
  revalidatePath("/admin/hosting")
  revalidatePath("/hosting")
  redirect(adminRedirect("/admin/hosting", { success: "Đã xóa hosting review." }))
}
