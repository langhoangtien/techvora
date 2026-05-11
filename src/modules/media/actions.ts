"use server"

import { unlink } from "fs/promises"
import path from "path"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"

async function ensureAdmin() {
  return isAdminSession()
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function publicPathToAbsolute(publicUrl: string | null | undefined) {
  if (!publicUrl || !publicUrl.startsWith("/uploads/")) {
    return null
  }

  const normalized = path.normalize(publicUrl).replace(/^([/\\])+/, "")
  const absolute = path.resolve(process.cwd(), "public", normalized)
  const uploadsRoot = path.resolve(process.cwd(), "public", "uploads")

  if (!absolute.startsWith(uploadsRoot)) {
    return null
  }

  return absolute
}

async function deletePublicFile(publicUrl: string | null | undefined) {
  const absolute = publicPathToAbsolute(publicUrl)
  if (!absolute) return

  try {
    await unlink(absolute)
  } catch {
    // File may already be gone. Keep DB delete flow usable.
  }
}

export async function updateMediaAltTextAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/media", { error: "Bạn không có quyền cập nhật media." }))
  }

  const id = text(formData, "id")
  const altText = text(formData, "altText")

  await prisma.media.update({
    where: { id },
    data: {
      alt: altText || null,
      altText: altText || null,
    },
  })

  revalidatePath("/admin/media")
  redirect(adminRedirect("/admin/media", { success: "Đã cập nhật alt text." }))
}
export async function getMediaReferenceWarnings(mediaId: string) {
  const media = await prisma.media.findUnique({
    where: { id: mediaId },
    include: {
      _count: {
        select: {
          authorAvatars: true,
          postFeatured: true,
          postOgImages: true,
          toolLogos: true,
          toolOgImages: true,
        },
      },
    },
  })

  if (!media) {
    return []
  }

  const [postContent, postCover, authors, settings] = await Promise.all([
    prisma.post.count({
      where: { content: { contains: media.url, mode: "insensitive" } },
    }),
    prisma.post.count({
      where: { coverImageUrl: media.url },
    }),
    prisma.author.count({
      where: { avatarUrl: media.url },
    }),
    prisma.siteSetting.count({
      where: {
        value: {
          string_contains: media.url,
        },
      },
    }),
  ])

  const warnings: string[] = []
  const relationCount =
    media._count.authorAvatars +
    media._count.postFeatured +
    media._count.postOgImages +
    media._count.toolLogos +
    media._count.toolOgImages

  if (relationCount > 0) warnings.push("Media đang được tham chiếu bằng quan hệ trong database.")
  if (postContent > 0) warnings.push(`URL xuất hiện trong nội dung ${postContent} bài viết.`)
  if (postCover > 0) warnings.push(`URL đang là cover image của ${postCover} bài viết.`)
  if (authors > 0) warnings.push(`URL đang là avatar của ${authors} tác giả.`)
  if (settings > 0) warnings.push("URL xuất hiện trong Site Settings.")

  return warnings
}

export async function deleteMediaAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/media", { error: "Bạn không có quyền xóa media." }))
  }

  const id = text(formData, "id")
  const force = formData.get("force") === "on"
  const media = await prisma.media.findUnique({ where: { id } })

  if (!media) {
    redirect(adminRedirect("/admin/media", { error: "Không tìm thấy media." }))
  }

  const warnings = await getMediaReferenceWarnings(id)

  if (warnings.length > 0 && !force) {
    redirect(
      adminRedirect("/admin/media", {
        error: "Media đang được sử dụng. Bật force delete nếu vẫn muốn xóa.",
      })
    )
  }

  try {
    if (force) {
      await prisma.$transaction([
        prisma.author.updateMany({
          where: { OR: [{ avatarId: id }, { avatarUrl: media.url }] },
          data: { avatarId: null, avatarUrl: null },
        }),
        prisma.post.updateMany({
          where: {
            OR: [
              { featuredImageId: id },
              { ogImageId: id },
              { coverImageUrl: media.url },
              { ogImageUrl: media.url },
            ],
          },
          data: {
            featuredImageId: null,
            ogImageId: null,
            coverImageUrl: null,
            ogImageUrl: null,
          },
        }),
        prisma.tool.updateMany({
          where: { OR: [{ logoId: id }, { ogImageId: id }, { ogImageUrl: media.url }] },
          data: { logoId: null, ogImageId: null, ogImageUrl: null },
        }),
        prisma.media.delete({ where: { id } }),
      ])
    } else {
      await prisma.media.delete({ where: { id } })
    }
  } catch {
    redirect(adminRedirect("/admin/media", { error: deleteErrorMessage("media") }))
  }

  await Promise.all([deletePublicFile(media.url), deletePublicFile(media.thumbnailUrl)])

  revalidatePath("/admin/media")
  redirect(adminRedirect("/admin/media", { success: "Đã xóa media." }))
}