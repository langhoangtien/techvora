"use server"

import type { PostStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"
import { createAutoRedirectIfSlugChanged } from "@/modules/redirects/actions"
import { pathForContentSlug } from "@/modules/redirects/paths"
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
    return { ok: false, message: "Bạn không có quyền lưu công cụ." }
  }

  const id = nullableText(formData, "id")
  const name = text(formData, "name")
  const slug = slugify(text(formData, "slug") || name)
  const status = text(formData, "status") as PostStatus
  const componentKey = nullableText(formData, "componentKey")
  const canonical = nullableText(formData, "canonicalUrl")
  const ogImageUrl = nullableText(formData, "ogImageUrl")
  const errors: ToolFormState["errors"] = {}

  if (!name) errors.name = "Vui lòng nhập tên công cụ."
  if (!slug) errors.slug = "Vui lòng nhập slug hợp lệ."
  if (!validStatuses.has(status)) errors.status = "Trạng thái không hợp lệ."
  if (componentKey && !toolComponentKeys.includes(componentKey as ToolComponentKey)) {
    errors.componentKey = "Component key không hợp lệ."
  }
  if (!isValidOptionalUrl(canonical)) errors.canonicalUrl = "Canonical URL không hợp lệ."
  if (!isValidOptionalUrl(ogImageUrl)) errors.ogImageUrl = "OG image URL không hợp lệ."

  const existingSlug = slug
    ? await prisma.tool.findFirst({
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
      message: "Vui lòng kiểm tra lại thông tin công cụ.",
      errors,
    }
  }

  const current = id
    ? await prisma.tool.findUnique({
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

  if (current && current.slug !== tool.slug) {
    await createAutoRedirectIfSlugChanged({
      oldPath: pathForContentSlug("tool", current.slug),
      newPath: pathForContentSlug("tool", tool.slug),
    })
    revalidatePath(pathForContentSlug("tool", current.slug))
  }

  revalidatePath("/admin/tools")
  revalidatePath("/tools")
  revalidatePath(`/tools/${tool.slug}`)
  redirect(
    `/admin/tools/${tool.id}/edit?success=${encodeURIComponent(
      id ? "Đã cập nhật công cụ." : "Đã tạo công cụ."
    )}`
  )
}

export async function deleteToolAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/tools", { error: "Bạn không có quyền xóa công cụ." }))
  }

  const id = text(formData, "id")
  try {
    await prisma.tool.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/tools", { error: deleteErrorMessage("công cụ") }))
  }
  revalidatePath("/admin/tools")
  revalidatePath("/tools")
  redirect(adminRedirect("/admin/tools", { success: "Đã xóa công cụ." }))
}

export async function bulkToolAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/tools", { error: "Bạn không có quyền cập nhật công cụ." }))
  }

  const action = text(formData, "bulkAction")
  const ids = formData.getAll("ids").map(String).filter(Boolean)

  if (ids.length === 0) {
    redirect(adminRedirect("/admin/tools", { error: "Vui lòng chọn ít nhất một công cụ." }))
  }

  if (action === "delete") {
    try {
      await prisma.tool.deleteMany({ where: { id: { in: ids } } })
    } catch {
      redirect(adminRedirect("/admin/tools", { error: deleteErrorMessage("công cụ") }))
    }
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
  redirect(adminRedirect("/admin/tools", { success: "Đã cập nhật hàng loạt." }))
}
