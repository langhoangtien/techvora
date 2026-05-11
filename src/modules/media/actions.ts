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
    redirect(adminRedirect("/admin/media", { error: "Ban khong co quyen cap nhat media." }))
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
  redirect(adminRedirect("/admin/media", { success: "Da cap nhat alt text." }))
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

  if (relationCount > 0) warnings.push("Media Ä‘ang Ä‘Æ°á»£c tham chiáº¿u báº±ng quan há»‡ trong database.")
  if (postContent > 0) warnings.push(`URL xuáº¥t hiá»‡n trong ná»™i dung ${postContent} bÃ i viáº¿t.`)
  if (postCover > 0) warnings.push(`URL Ä‘ang lÃ  cover image cá»§a ${postCover} bÃ i viáº¿t.`)
  if (authors > 0) warnings.push(`URL Ä‘ang lÃ  avatar cá»§a ${authors} tÃ¡c giáº£.`)
  if (settings > 0) warnings.push("URL xuáº¥t hiá»‡n trong Site Settings.")

  return warnings
}

export async function deleteMediaAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(adminRedirect("/admin/media", { error: "Ban khong co quyen xoa media." }))
  }

  const id = text(formData, "id")
  const force = formData.get("force") === "on"
  const media = await prisma.media.findUnique({ where: { id } })

  if (!media) {
    redirect(adminRedirect("/admin/media", { error: "Khong tim thay media." }))
  }

  const warnings = await getMediaReferenceWarnings(id)

  if (warnings.length > 0 && !force) {
    redirect(
      adminRedirect("/admin/media", {
        error: "Media dang duoc su dung. Bat force delete neu van muon xoa.",
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
  redirect(adminRedirect("/admin/media", { success: "Da xoa media." }))
}