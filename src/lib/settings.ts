import type { Prisma } from "@/generated/prisma/client"

import { siteConfig } from "@/config/site"
import { prisma } from "@/lib/prisma"

export type GeneralSettings = {
  siteName: string
  siteUrl: string
  tagline: string
  defaultLocale: string
  logoUrl: string
  faviconUrl: string
}

export type SeoSettings = {
  defaultSeoTitle: string
  defaultSeoDescription: string
  defaultOgImage: string
  robotsIndex: boolean
  robotsFollow: boolean
}

export type SocialSettings = {
  twitterUrl: string
  facebookUrl: string
  linkedinUrl: string
  githubUrl: string
  youtubeUrl: string
}

export type AdsSettings = {
  enableAds: boolean
  adsensePublisherId: string
  articleTopAd: string
  articleMiddleAd: string
  sidebarAd: string
  mobileStickyAd: string
}

export type ThemeSettings = {
  primaryColor: string
  accentColor: string
  defaultTheme: "system" | "light" | "dark"
}

export type FooterSettings = {
  footerDescription: string
  copyrightText: string
}

export type MediaSettings = {
  maxUploadSizeMB: number
  allowedImageTypes: string[]
  convertToWebp: boolean
  imageQuality: number
  maxImageWidth: number
  maxImageHeight: number
  generateThumbnail: boolean
  thumbnailWidth: number
  thumbnailHeight: number
  avatarMaxSizeMB: number
  avatarWidth: number
  avatarHeight: number
  avatarQuality: number
}

export type SettingsMap = {
  general: GeneralSettings
  seo: SeoSettings
  social: SocialSettings
  ads: AdsSettings
  theme: ThemeSettings
  footer: FooterSettings
  media: MediaSettings
}

export type SettingKey = keyof SettingsMap

export type SiteConfigFromSettings = {
  name: string
  url: string
  tagline: string
  locale: string
  logoUrl: string
  faviconUrl: string
  seoTitle: string
  seoDescription: string
  ogImage: string
  robots: {
    index: boolean
    follow: boolean
  }
  theme: ThemeSettings
  footer: FooterSettings
  social: SocialSettings
  ads: AdsSettings
  media: MediaSettings
}

export const defaultSettings: SettingsMap = {
  general: {
    siteName: siteConfig.name,
    siteUrl: siteConfig.url,
    tagline: "Klare Orientierung für Software, Tools und digitale Services.",
    defaultLocale: "de-DE",
    logoUrl: "",
    faviconUrl: "/favicon.ico",
  },
  seo: {
    defaultSeoTitle: siteConfig.name,
    defaultSeoDescription: siteConfig.description,
    defaultOgImage: "",
    robotsIndex: true,
    robotsFollow: true,
  },
  social: {
    twitterUrl: "",
    facebookUrl: "",
    linkedinUrl: "",
    githubUrl: "",
    youtubeUrl: "",
  },
  ads: {
    enableAds: false,
    adsensePublisherId: "",
    articleTopAd: "",
    articleMiddleAd: "",
    sidebarAd: "",
    mobileStickyAd: "",
  },
  theme: {
    primaryColor: "red",
    accentColor: "blue",
    defaultTheme: "system",
  },
  footer: {
    footerDescription:
      "Praxisnahe Recherche und Kaufberatung für Software, Infrastruktur und digitale Services.",
    copyrightText: `Copyright ${new Date().getFullYear()} ${siteConfig.name}. Alle Rechte vorbehalten.`,
  },
  media: {
    maxUploadSizeMB: 5,
    allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    convertToWebp: true,
    imageQuality: 80,
    maxImageWidth: 1600,
    maxImageHeight: 1600,
    generateThumbnail: true,
    thumbnailWidth: 400,
    thumbnailHeight: 400,
    avatarMaxSizeMB: 2,
    avatarWidth: 300,
    avatarHeight: 300,
    avatarQuality: 85,
  },
}

const settingKeys = Object.keys(defaultSettings) as SettingKey[]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function mergeSetting<K extends SettingKey>(
  key: K,
  value: Prisma.JsonValue | null | undefined
): SettingsMap[K] {
  if (!isRecord(value)) {
    return defaultSettings[key]
  }

  return {
    ...defaultSettings[key],
    ...value,
  } as SettingsMap[K]
}

export async function getSetting<K extends SettingKey>(
  key: K
): Promise<SettingsMap[K]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: {
        key_locale: {
          key,
          locale: defaultSettings.general.defaultLocale,
        },
      },
    })

    return mergeSetting(key, setting?.value)
  } catch {
    return defaultSettings[key]
  }
}

export async function getSettings(): Promise<SettingsMap> {
  try {
    const rows = await prisma.siteSetting.findMany({
      where: {
        key: {
          in: settingKeys,
        },
        locale: defaultSettings.general.defaultLocale,
      },
    })

    const byKey = new Map(rows.map((row) => [row.key, row.value]))

    return settingKeys.reduce((settings, key) => {
      settings[key] = mergeSetting(key, byKey.get(key)) as never
      return settings
    }, {} as SettingsMap)
  } catch {
    return defaultSettings
  }
}

export async function getMediaSettings() {
  return getSetting("media")
}

export async function updateSetting<K extends SettingKey>(
  key: K,
  value: SettingsMap[K]
) {
  return prisma.siteSetting.upsert({
    where: {
      key_locale: {
        key,
        locale: defaultSettings.general.defaultLocale,
      },
    },
    create: {
      key,
      locale: defaultSettings.general.defaultLocale,
      value: value as Prisma.InputJsonValue,
    },
    update: {
      value: value as Prisma.InputJsonValue,
    },
  })
}

export async function getSiteConfig(): Promise<SiteConfigFromSettings> {
  const settings = await getSettings()

  return {
    name: settings.general.siteName,
    url: settings.general.siteUrl,
    tagline: settings.general.tagline,
    locale: settings.general.defaultLocale,
    logoUrl: settings.general.logoUrl,
    faviconUrl: settings.general.faviconUrl,
    seoTitle: settings.seo.defaultSeoTitle,
    seoDescription: settings.seo.defaultSeoDescription,
    ogImage: settings.seo.defaultOgImage,
    robots: {
      index: settings.seo.robotsIndex,
      follow: settings.seo.robotsFollow,
    },
    theme: settings.theme,
    footer: settings.footer,
    social: settings.social,
    ads: settings.ads,
    media: settings.media,
  }
}
