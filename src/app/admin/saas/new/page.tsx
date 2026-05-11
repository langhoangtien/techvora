import type { Metadata } from "next"

import { SaaSForm } from "@/app/admin/saas/saas-form"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tạo SaaS product",
}

export default async function NewSaaSPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tạo SaaS product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo hồ sơ sản phẩm SaaS để hiển thị trên public site.
        </p>
      </div>
      <SaaSForm />
    </div>
  )
}
