import type { Metadata } from "next"

import { ServiceForm } from "@/app/admin/services/service-form"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Táº¡o service",
}

export default async function NewServicesPage() {
  await requireAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Táº¡o service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Táº¡o há»“ sÆ¡ sáº£n pháº©m Services Ä‘á»ƒ hiá»ƒn thá»‹ trÃªn public site.
        </p>
      </div>
      <ServiceForm />
    </div>
  )
}
