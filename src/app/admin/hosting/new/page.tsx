import type { Metadata } from "next"

import { HostingForm } from "@/app/admin/hosting/hosting-form"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tạo hosting review",
}

export default async function NewHostingPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tạo hosting review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo review nhà cung cấp hosting/VPS để hiển thị trên public site.
        </p>
      </div>
      <HostingForm />
    </div>
  )
}
