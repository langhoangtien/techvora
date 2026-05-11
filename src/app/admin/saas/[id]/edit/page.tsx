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
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const [{ id }, query] = await Promise.all([params, searchParams])
  const product = await getSaaSForEdit(id)

  if (!product) {
    notFound()
  }

  const success = Array.isArray(query?.success) ? query?.success[0] : query?.success

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa SaaS product</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung, pricing, rating, SEO và CTA affiliate.
        </p>
      </div>
      {success ? <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      <SaaSForm product={product} />
    </div>
  )
}
