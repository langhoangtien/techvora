import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { HostingForm } from "@/app/admin/hosting/hosting-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getHostingForEdit } from "@/modules/hosting/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sửa hosting review",
}

export default async function EditHostingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const [{ id }, query] = await Promise.all([params, searchParams])
  const provider = await getHostingForEdit(id)

  if (!provider) {
    notFound()
  }

  const success = Array.isArray(query?.success) ? query?.success[0] : query?.success

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa hosting review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung, rating, SEO và CTA affiliate.
        </p>
      </div>
      {success ? <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      <HostingForm provider={provider} />
    </div>
  )
}
