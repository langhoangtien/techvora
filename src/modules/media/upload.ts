import { randomUUID } from "crypto"
import { mkdir, writeFile } from "fs/promises"
import path from "path"
import sharp from "sharp"

import { prisma } from "@/lib/prisma"
import { getMediaSettings, type MediaSettings } from "@/lib/settings"

export type MediaUploadPurpose = "content" | "logo"

function bytesFromMb(value: number) {
  return value * 1024 * 1024
}

function baseName(name: string) {
  return path
    .parse(name)
    .name.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function outputExtension(fileType: string, convertToWebp: boolean) {
  if (fileType === "image/gif") return "gif"
  if (convertToWebp && (fileType === "image/jpeg" || fileType === "image/png")) return "webp"
  if (fileType === "image/png") return "png"
  if (fileType === "image/jpeg") return "jpg"
  return "webp"
}

function outputMime(fileType: string, convertToWebp: boolean) {
  const ext = outputExtension(fileType, convertToWebp)
  if (ext === "gif") return "image/gif"
  if (ext === "png") return "image/png"
  if (ext === "jpg") return "image/jpeg"
  return "image/webp"
}

function validateFile(file: File, allowedImageTypes: string[], maxSizeMB: number) {
  if (!allowedImageTypes.includes(file.type)) {
    throw new Error("Định dạng ảnh không được phép.")
  }

  if (file.size > bytesFromMb(maxSizeMB)) {
    throw new Error(`Dung lượng ảnh tối đa là ${maxSizeMB}MB.`)
  }
}

function uploadPreset(settings: MediaSettings, purpose: MediaUploadPurpose) {
  if (purpose === "logo") {
    return {
      kind: "logo",
      directory: "branding",
      publicPath: "/uploads/branding",
      maxSizeMB: 1,
      maxWidth: 512,
      maxHeight: 512,
      quality: 85,
      convertToWebp: true,
      generateThumbnail: false,
      thumbnailWidth: settings.thumbnailWidth,
      thumbnailHeight: settings.thumbnailHeight,
      allowedImageTypes: ["image/jpeg", "image/png", "image/webp"],
    }
  }

  return {
    kind: "content",
    directory: "",
    publicPath: "/uploads",
    maxSizeMB: settings.maxUploadSizeMB,
    maxWidth: settings.maxImageWidth,
    maxHeight: settings.maxImageHeight,
    quality: settings.imageQuality,
    convertToWebp: settings.convertToWebp,
    generateThumbnail: settings.generateThumbnail,
    thumbnailWidth: settings.thumbnailWidth,
    thumbnailHeight: settings.thumbnailHeight,
    allowedImageTypes: settings.allowedImageTypes,
  }
}

async function writeSharpOutput({
  image,
  outputPath,
  mimeType,
  quality,
}: {
  image: sharp.Sharp
  outputPath: string
  mimeType: string
  quality: number
}) {
  if (mimeType === "image/png") {
    await image.png({ quality }).toFile(outputPath)
    return
  }

  if (mimeType === "image/jpeg") {
    await image.jpeg({ quality }).toFile(outputPath)
    return
  }

  await image.webp({ quality }).toFile(outputPath)
}

export async function processAndStoreImage(
  file: File,
  altText?: string,
  purpose: MediaUploadPurpose = "content"
) {
  const settings = await getMediaSettings()
  const preset = uploadPreset(settings, purpose)
  validateFile(file, preset.allowedImageTypes, preset.maxSizeMB)

  const input = Buffer.from(await file.arrayBuffer())
  const uploadsDir = path.join(process.cwd(), "public", "uploads", preset.directory)
  const thumbnailDir = path.join(uploadsDir, "thumbnails")
  await mkdir(uploadsDir, { recursive: true })
  if (preset.generateThumbnail) {
    await mkdir(thumbnailDir, { recursive: true })
  }

  try {
    const ext = outputExtension(file.type, preset.convertToWebp)
    const mimeType = outputMime(file.type, preset.convertToWebp)
    const filename = `${baseName(file.name) || "image"}-${randomUUID()}.${ext}`
    const outputPath = path.join(uploadsDir, filename)
    let width: number | null = null
    let height: number | null = null
    let thumbnailUrl: string | null = null

    if (file.type === "image/gif") {
      await writeFile(outputPath, input)
      const metadata = await sharp(input, { animated: true }).metadata()
      width = metadata.width ?? null
      height = metadata.height ?? null
    } else {
      const image = sharp(input).rotate().resize({
        width: preset.maxWidth,
        height: preset.maxHeight,
        fit: "inside",
        withoutEnlargement: true,
      })
      await writeSharpOutput({
        image,
        outputPath,
        mimeType,
        quality: preset.quality,
      })
      const metadata = await sharp(outputPath).metadata()
      width = metadata.width ?? null
      height = metadata.height ?? null

      if (preset.generateThumbnail) {
        const thumbName = `${path.parse(filename).name}-thumb.webp`
        const thumbPath = path.join(thumbnailDir, thumbName)
        await sharp(outputPath)
          .resize({
            width: preset.thumbnailWidth,
            height: preset.thumbnailHeight,
            fit: "cover",
          })
          .webp({ quality: preset.quality })
          .toFile(thumbPath)
        thumbnailUrl = `${preset.publicPath}/thumbnails/${thumbName}`
      }
    }

    const url = `${preset.publicPath}/${filename}`
    return prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        url,
        mimeType,
        alt: altText || null,
        altText: altText || null,
        thumbnailUrl,
        width,
        height,
        size: file.size,
        metadata: {
          kind: preset.kind,
          sourceMimeType: file.type,
          optimized: file.type !== "image/gif",
          settings: {
            convertToWebp: preset.convertToWebp,
            imageQuality: preset.quality,
            maxImageWidth: preset.maxWidth,
            maxImageHeight: preset.maxHeight,
            generateThumbnail: preset.generateThumbnail,
          },
        },
      },
    })
  } catch {
    throw new Error("Không thể xử lý ảnh. Vui lòng thử ảnh khác.")
  }
}

export async function processAndStoreAvatar(file: File, altText?: string) {
  const settings = await getMediaSettings()
  validateFile(file, settings.allowedImageTypes, settings.avatarMaxSizeMB)

  const input = Buffer.from(await file.arrayBuffer())
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars")
  await mkdir(uploadsDir, { recursive: true })

  try {
    const isGif = file.type === "image/gif"
    const ext = isGif ? "gif" : "webp"
    const filename = `${baseName(file.name) || "avatar"}-${randomUUID()}.${ext}`
    const outputPath = path.join(uploadsDir, filename)

    if (isGif) {
      await writeFile(outputPath, input)
    } else {
      await sharp(input)
        .rotate()
        .resize({
          width: settings.avatarWidth,
          height: settings.avatarHeight,
          fit: "cover",
        })
        .webp({ quality: settings.avatarQuality })
        .toFile(outputPath)
    }

    const metadata = await sharp(outputPath, { animated: isGif }).metadata()
    const url = `/uploads/avatars/${filename}`

    return prisma.media.create({
      data: {
        filename,
        originalName: file.name,
        url,
        mimeType: isGif ? "image/gif" : "image/webp",
        alt: altText || null,
        altText: altText || null,
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        size: file.size,
        metadata: {
          kind: "avatar",
          sourceMimeType: file.type,
          avatarWidth: settings.avatarWidth,
          avatarHeight: settings.avatarHeight,
          avatarQuality: settings.avatarQuality,
        },
      },
    })
  } catch {
    throw new Error("Không thể xử lý avatar. Vui lòng thử ảnh khác.")
  }
}
