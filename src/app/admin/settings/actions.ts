"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import type { SettingsMap, ThemeSettings } from "@/lib/settings"
import { updateSetting } from "@/lib/settings"

export type SettingsFormState = {
  ok: boolean
  message?: string
  errors?: Partial<Record<string, string>>
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on"
}

function numberValue(formData: FormData, key: string, fallback: number) {
  const value = Number(text(formData, key))
  return Number.isFinite(value) ? value : fallback
}

function csv(formData: FormData, key: string) {
  return text(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function validateUrl(value: string) {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function validateRange(
  errors: NonNullable<SettingsFormState["errors"]>,
  key: string,
  value: number,
  min: number,
  max: number,
  label: string
) {
  if (value < min || value > max) {
    errors[key] = `${label} phải nằm trong khoảng ${min}-${max}.`
  }
}

export async function updateSettingsAction(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== "ADMIN") {
    return {
      ok: false,
      message: "Bạn không có quyền cập nhật cài đặt site.",
    }
  }

  const settings: SettingsMap = {
    general: {
      siteName: text(formData, "siteName"),
      siteUrl: text(formData, "siteUrl"),
      tagline: text(formData, "tagline"),
      defaultLocale: text(formData, "defaultLocale") || "en",
      logoUrl: text(formData, "logoUrl"),
      faviconUrl: text(formData, "faviconUrl"),
    },
    seo: {
      defaultSeoTitle: text(formData, "defaultSeoTitle"),
      defaultSeoDescription: text(formData, "defaultSeoDescription"),
      defaultOgImage: text(formData, "defaultOgImage"),
      robotsIndex: bool(formData, "robotsIndex"),
      robotsFollow: bool(formData, "robotsFollow"),
    },
    social: {
      twitterUrl: text(formData, "twitterUrl"),
      facebookUrl: text(formData, "facebookUrl"),
      linkedinUrl: text(formData, "linkedinUrl"),
      githubUrl: text(formData, "githubUrl"),
      youtubeUrl: text(formData, "youtubeUrl"),
    },
    ads: {
      enableAds: bool(formData, "enableAds"),
      adsensePublisherId: text(formData, "adsensePublisherId"),
      articleTopAd: text(formData, "articleTopAd"),
      articleMiddleAd: text(formData, "articleMiddleAd"),
      sidebarAd: text(formData, "sidebarAd"),
      mobileStickyAd: text(formData, "mobileStickyAd"),
    },
    theme: {
      primaryColor: text(formData, "primaryColor"),
      accentColor: text(formData, "accentColor"),
      defaultTheme: text(formData, "defaultTheme") as ThemeSettings["defaultTheme"],
    },
    footer: {
      footerDescription: text(formData, "footerDescription"),
      copyrightText: text(formData, "copyrightText"),
    },
    media: {
      maxUploadSizeMB: numberValue(formData, "maxUploadSizeMB", 5),
      allowedImageTypes: csv(formData, "allowedImageTypes"),
      convertToWebp: bool(formData, "convertToWebp"),
      imageQuality: numberValue(formData, "imageQuality", 80),
      maxImageWidth: numberValue(formData, "maxImageWidth", 1600),
      maxImageHeight: numberValue(formData, "maxImageHeight", 1600),
      generateThumbnail: bool(formData, "generateThumbnail"),
      thumbnailWidth: numberValue(formData, "thumbnailWidth", 400),
      thumbnailHeight: numberValue(formData, "thumbnailHeight", 400),
      avatarMaxSizeMB: numberValue(formData, "avatarMaxSizeMB", 2),
      avatarWidth: numberValue(formData, "avatarWidth", 300),
      avatarHeight: numberValue(formData, "avatarHeight", 300),
      avatarQuality: numberValue(formData, "avatarQuality", 85),
    },
  }

  const errors: SettingsFormState["errors"] = {}

  if (!settings.general.siteName) errors.siteName = "Vui lòng nhập tên website."
  if (!settings.general.siteUrl) {
    errors.siteUrl = "Vui lòng nhập URL website."
  } else if (!validateUrl(settings.general.siteUrl)) {
    errors.siteUrl = "URL website không hợp lệ. Ví dụ: https://tekvora.com"
  }
  if (!settings.seo.defaultSeoTitle) errors.defaultSeoTitle = "Vui lòng nhập tiêu đề SEO mặc định."
  if (!settings.seo.defaultSeoDescription) errors.defaultSeoDescription = "Vui lòng nhập mô tả SEO mặc định."
  if (settings.media.allowedImageTypes.length === 0) errors.allowedImageTypes = "Vui lòng nhập ít nhất một MIME type ảnh."

  validateRange(errors, "maxUploadSizeMB", settings.media.maxUploadSizeMB, 1, 20, "Dung lượng upload tối đa")
  validateRange(errors, "imageQuality", settings.media.imageQuality, 40, 100, "Chất lượng ảnh")
  validateRange(errors, "maxImageWidth", settings.media.maxImageWidth, 300, 4000, "Chiều rộng ảnh tối đa")
  validateRange(errors, "maxImageHeight", settings.media.maxImageHeight, 300, 4000, "Chiều cao ảnh tối đa")
  validateRange(errors, "avatarMaxSizeMB", settings.media.avatarMaxSizeMB, 1, 10, "Dung lượng avatar tối đa")
  validateRange(errors, "avatarWidth", settings.media.avatarWidth, 100, 1000, "Chiều rộng avatar")
  validateRange(errors, "avatarHeight", settings.media.avatarHeight, 100, 1000, "Chiều cao avatar")
  validateRange(errors, "avatarQuality", settings.media.avatarQuality, 40, 100, "Chất lượng avatar")

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại các trường bắt buộc.",
      errors,
    }
  }

  await Promise.all([
    updateSetting("general", settings.general),
    updateSetting("seo", settings.seo),
    updateSetting("social", settings.social),
    updateSetting("ads", settings.ads),
    updateSetting("theme", settings.theme),
    updateSetting("footer", settings.footer),
    updateSetting("media", settings.media),
  ])

  revalidatePath("/", "layout")
  revalidatePath("/admin/settings")

  return {
    ok: true,
    message: "Đã lưu cài đặt site.",
  }
}
