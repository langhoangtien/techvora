import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { SaaSForm } from "@/app/admin/saas/saas-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getSaaSForEdit } from "@/modules/saas/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sửa SaaS product",
}

export default async function EditSaaSPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const product = await getSaaSForEdit(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa SaaS product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung, pricing, rating, SEO và CTA affiliate.
        </p>
      </div>
      <SaaSForm product={product} />
    </div>
  )
}
