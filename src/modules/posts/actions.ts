"use server"

import type { ContentFormat, PostStatus, PostType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/slugify"

export type PostFormState = {
  ok: boolean
  message?: string
  postId?: string
  errors?: Partial<Record<string, string>>
}

const locale = "en"
const validStatuses = new Set(["DRAFT", "PUBLISHED", "SCHEDULED", "ARCHIVED"])
const validTypes = new Set(["ARTICLE", "TOOL", "SAAS", "COMPARISON", "PAGE"])
const validFormats = new Set(["HTML", "MARKDOWN", "MDX"])

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key)
  return value ? value : null
}

function tags(formData: FormData) {
  return formData.getAll("tagIds").map(String).filter(Boolean)
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

export async function createInlineTagAction(name: string) {
  if (!(await ensureAdmin())) {
    return { ok: false, message: "Bạn không có quyền tạo thẻ." }
  }

  const cleanName = name.trim()
  const slug = slugify(cleanName)

  if (!cleanName || !slug) {
    return { ok: false, message: "Tên thẻ không hợp lệ." }
  }

  const existing = await prisma.tag.findUnique({
    where: { slug_locale: { slug, locale } },
  })

  if (existing) {
    return { ok: true, tag: existing, message: "Thẻ đã tồn tại." }
  }

  const tag = await prisma.tag.create({
    data: {
      name: cleanName,
      slug,
      locale,
    },
  })

  revalidatePath("/admin/posts")
  return { ok: true, tag, message: "Đã tạo thẻ." }
}

export async function savePostAction(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  if (!(await ensureAdmin())) {
    return { ok: false, message: "Bạn không có quyền lưu bài viết." }
  }

  const id = nullableText(formData, "id")
  const title = text(formData, "title")
  const slug = slugify(text(formData, "slug") || title)
  const content = text(formData, "content")
  const status = text(formData, "status") as PostStatus
  const type = text(formData, "type") as PostType
  const format = text(formData, "format") as ContentFormat
  const selectedTags = tags(formData)
  const canonical = nullableText(formData, "canonicalUrl")
  const ogImageUrl = nullableText(formData, "ogImageUrl")
  const coverImageUrl = nullableText(formData, "coverImageUrl")
  const errors: PostFormState["errors"] = {}

  if (!title) errors.title = "Vui lòng nhập tiêu đề."
  if (!slug) errors.slug = "Vui lòng nhập slug hợp lệ."
  if (!content || content === "<p></p>") errors.content = "Vui lòng nhập nội dung."
  if (!validStatuses.has(status)) errors.status = "Trạng thái không hợp lệ."
  if (!validTypes.has(type)) errors.type = "Loại nội dung không hợp lệ."
  if (!validFormats.has(format)) errors.format = "Định dạng nội dung không hợp lệ."
  if (!isValidOptionalUrl(canonical)) errors.canonicalUrl = "Canonical URL không hợp lệ."
  if (!isValidOptionalUrl(ogImageUrl)) errors.ogImageUrl = "OG image URL không hợp lệ."
  if (!isValidOptionalUrl(coverImageUrl)) errors.coverImageUrl = "Cover image URL không hợp lệ."

  const existingSlug = slug
    ? await prisma.post.findUnique({
        where: { slug_locale: { slug, locale } },
        select: { id: true },
      })
    : null

  if (existingSlug && existingSlug.id !== id) {
    errors.slug = "Slug này đã được sử dụng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin bài viết.",
      errors,
    }
  }

  const current = id
    ? await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } })
    : null
  const publishedAt =
    status === "PUBLISHED" && !current?.publishedAt ? new Date() : current?.publishedAt

  const data = {
    title,
    slug,
    locale,
    excerpt: nullableText(formData, "excerpt"),
    content,
    format,
    status,
    type,
    categoryId: nullableText(formData, "categoryId"),
    authorId: nullableText(formData, "authorId"),
    coverImageUrl,
    seoTitle: nullableText(formData, "seoTitle"),
    seoDesc: nullableText(formData, "seoDescription"),
    canonical,
    ogImageUrl,
    noIndex: formData.get("noindex") === "on",
    publishedAt,
  }

  const post = id
    ? await prisma.post.update({ where: { id }, data })
    : await prisma.post.create({ data })

  await prisma.postTag.deleteMany({ where: { postId: post.id } })

  if (selectedTags.length > 0) {
    await prisma.postTag.createMany({
      data: selectedTags.map((tagId) => ({ postId: post.id, tagId })),
      skipDuplicates: true,
    })
  }

  revalidatePath("/admin/posts")
  revalidatePath(`/admin/posts/${post.id}/edit`)
  redirect(
    `/admin/posts/${post.id}/edit?success=${encodeURIComponent(
      id ? "Đã cập nhật bài viết." : "Đã tạo bài viết."
    )}`
  )
}

export async function deletePostAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/posts", { error: "Bạn không có quyền xóa bài viết." }))
  }

  const id = text(formData, "id")
  try {
    await prisma.post.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/posts", { error: deleteErrorMessage("bài viết") }))
  }
  revalidatePath("/admin/posts")
  revalidatePath("/articles")
  redirect(adminRedirect("/admin/posts", { success: "Đã xóa bài viết." }))
}
export async function bulkPostAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect("/admin/posts?error=Bạn không có quyền cập nhật bài viết.")
  }

  const action = text(formData, "bulkAction")
  const ids = formData.getAll("ids").map(String).filter(Boolean)

  if (ids.length === 0) {
    redirect("/admin/posts?error=Vui lòng chọn ít nhất một bài viết.")
  }

  if (action === "delete") {
    await prisma.post.deleteMany({ where: { id: { in: ids } } })
  }

  if (action === "publish") {
    await prisma.post.updateMany({
      where: { id: { in: ids } },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    })
  }

  if (action === "draft") {
    await prisma.post.updateMany({
      where: { id: { in: ids } },
      data: { status: "DRAFT" },
    })
  }

  revalidatePath("/admin/posts")
  redirect("/admin/posts?success=Đã cập nhật hàng loạt.")
}
