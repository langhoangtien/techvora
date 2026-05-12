const blockedPrefixes = ["/admin", "/api", "/preview"] as const
const runtimeExcludedPrefixes = [
  "/admin",
  "/api",
  "/_next",
  "/uploads",
  "/preview",
] as const
const runtimeExcludedPaths = ["/favicon.ico", "/robots.txt", "/sitemap.xml"] as const

export function normalizeRedirectPath(value: string) {
  const path = value.trim()
  if (!path) return path

  if (path.length > 1 && path.endsWith("/")) {
    return path.replace(/\/+$/, "")
  }

  return path
}

export function isExternalRedirectUrl(value: string) {
  return value.startsWith("https://")
}

export function isBlockedRedirectPath(path: string) {
  return blockedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export function shouldSkipRuntimeRedirect(path: string) {
  if (runtimeExcludedPaths.includes(path as (typeof runtimeExcludedPaths)[number])) return true
  return runtimeExcludedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

export function isValidFromPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//")
}

export function isValidToPath(path: string) {
  if (isExternalRedirectUrl(path)) return true
  return isValidFromPath(path)
}

export function pathForContentSlug(kind: "article" | "tool" | "service" | "comparison", slug: string) {
  switch (kind) {
    case "article":
      return `/articles/${slug}`
    case "tool":
      return `/tools/${slug}`
    case "service":
      return `/services/${slug}`
    case "comparison":
      return `/compare/${slug}`
  }
}
