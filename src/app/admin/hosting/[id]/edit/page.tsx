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
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const provider = await getHostingForEdit(id)

  if (!provider) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa hosting review</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung, rating, SEO và CTA affiliate.
        </p>
      </div>
      <HostingForm provider={provider} />
    </div>
  )
}
