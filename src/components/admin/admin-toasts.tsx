"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

export function AdminToasts() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const lastToastKey = useRef("")

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")

    if (!success && !error) {
      return
    }

    const toastKey = `${pathname}?${searchParams.toString()}`
    if (toastKey === lastToastKey.current) {
      return
    }
    lastToastKey.current = toastKey

    if (success) {
      toast.success(success)
    }

    if (error) {
      toast.error(error)
    }

    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete("success")
    nextParams.delete("error")
    const nextQuery = nextParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    })
  }, [pathname, router, searchParams])

  return null
}
