import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { shouldSkipRuntimeRedirect } from "@/modules/redirects/paths"

const rateLimitRules = {
  auth: { key: "auth", limit: 20, windowMs: 60_000 },
  api: { key: "api", limit: 120, windowMs: 60_000 },
  admin: { key: "admin", limit: 90, windowMs: 60_000 },
  search: { key: "search", limit: 60, windowMs: 60_000 },
} as const

function getRateLimitRule(pathname: string) {
  if (pathname === "/api/health" || pathname === "/api/redirects/lookup") {
    return null
  }

  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return rateLimitRules.auth
  }

  if (pathname === "/search" || pathname.startsWith("/api/search")) {
    return rateLimitRules.search
  }

  if (pathname.startsWith("/api")) {
    return rateLimitRules.api
  }

  if (pathname.startsWith("/admin")) {
    return rateLimitRules.admin
  }

  return null
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const rateLimitRule = getRateLimitRule(pathname)

  if (rateLimitRule) {
    const result = checkRateLimit(request, rateLimitRule)

    if (!result.allowed) {
      return rateLimitResponse(result)
    }
  }

  if (pathname.startsWith("/api")) return NextResponse.next()

 if (!pathname.startsWith("/admin") && !shouldSkipRuntimeRedirect(pathname)) {
  const internalBaseUrl =
    process.env.INTERNAL_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    request.nextUrl.origin

  const lookupUrl = new URL("/api/redirects/lookup", internalBaseUrl)
  lookupUrl.searchParams.set("path", pathname)

  const response = await fetch(lookupUrl, { cache: "no-store" })

  if (response.ok) {
    const redirect = (await response.json()) as {
      destination?: string
      statusCode?: number
    } | null

    if (
      redirect?.destination &&
      (redirect.statusCode === 301 || redirect.statusCode === 302)
    ) {
      return NextResponse.redirect(
        new URL(redirect.destination, request.url),
        redirect.statusCode
      )
    }
  }
}

  if (!pathname.startsWith("/admin") || pathname === "/admin/login") return NextResponse.next()

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (token) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/admin/login", request.url)
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: [
    "/((?!_next|uploads|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
}
