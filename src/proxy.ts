import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { shouldSkipRuntimeRedirect } from "@/modules/redirects/paths"

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (!pathname.startsWith("/admin") && !shouldSkipRuntimeRedirect(pathname)) {
    const lookupUrl = new URL("/api/redirects/lookup", request.url)
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
  matcher: ["/((?!api|_next|uploads|favicon.ico|robots.txt|sitemap.xml).*)"],
}
