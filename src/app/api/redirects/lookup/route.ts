import { NextResponse } from "next/server"

import { getRuntimeRedirect } from "@/modules/redirects/runtime"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path") ?? ""
  const redirect = await getRuntimeRedirect(path)

  return NextResponse.json(redirect ?? null)
}
