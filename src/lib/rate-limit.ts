import { NextResponse, type NextRequest } from "next/server"

type RateLimitBucket = {
  count: number
  resetAt: number
}

export type RateLimitRule = {
  key: string
  limit: number
  windowMs: number
}

type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: number
}

const globalRateLimit = globalThis as typeof globalThis & {
  __tekvoraRateLimitStore?: Map<string, RateLimitBucket>
  __tekvoraRateLimitLastCleanup?: number
}

// In-memory fallback: suitable for a single app instance only.
// Use Redis or another shared store before scaling to multiple containers.
const store =
  globalRateLimit.__tekvoraRateLimitStore ??
  new Map<string, RateLimitBucket>()

globalRateLimit.__tekvoraRateLimitStore = store

function cleanupExpiredBuckets(now: number) {
  const lastCleanup = globalRateLimit.__tekvoraRateLimitLastCleanup ?? 0

  if (now - lastCleanup < 60_000) return

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key)
    }
  }

  globalRateLimit.__tekvoraRateLimitLastCleanup = now
}

export function getClientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  )
}

export function checkRateLimit(
  request: NextRequest,
  rule: RateLimitRule
): RateLimitResult {
  const now = Date.now()
  cleanupExpiredBuckets(now)

  const ip = getClientIp(request)
  const key = `${rule.key}:${ip}`
  const bucket = store.get(key)

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + rule.windowMs
    store.set(key, { count: 1, resetAt })

    return {
      allowed: true,
      limit: rule.limit,
      remaining: rule.limit - 1,
      resetAt,
    }
  }

  bucket.count += 1

  return {
    allowed: bucket.count <= rule.limit,
    limit: rule.limit,
    remaining: Math.max(rule.limit - bucket.count, 0),
    resetAt: bucket.resetAt,
  }
}

export function rateLimitResponse(result: RateLimitResult) {
  const retryAfter = Math.max(Math.ceil((result.resetAt - Date.now()) / 1000), 1)

  return NextResponse.json(
    {
      error: "Too many requests. Please try again later.",
      retryAfter,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
      },
    }
  )
}
