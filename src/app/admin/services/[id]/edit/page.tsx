import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ServiceForm } from "@/app/admin/services/service-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getServiceForEdit } from "@/modules/services/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sá»­a service",
}

export default async function EditServicesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const product = await getServiceForEdit(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sá»­a service</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cáº­p nháº­t ná»™i dung, pricing, rating, SEO vÃ  CTA affiliate.
        </p>
      </div>
      <ServiceForm product={product} />
    </div>
  )
}
