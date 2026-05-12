import type { Metadata } from "next"

import { RedirectForm } from "@/app/admin/redirects/redirect-form"
import { requireAdmin } from "@/lib/admin-auth"

export const metadata: Metadata = { title: "Tạo redirect" }

export default async function NewRedirectPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tạo redirect</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo chuyển hướng 301 hoặc 302 cho public website.
        </p>
      </div>
      <RedirectForm />
    </div>
  )
}
