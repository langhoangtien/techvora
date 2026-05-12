import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { RedirectForm } from "@/app/admin/redirects/redirect-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getRedirectForEdit } from "@/modules/redirects/queries"

export const metadata: Metadata = { title: "Sửa redirect" }

export default async function EditRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const redirect = await getRedirectForEdit(id)

  if (!redirect) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa redirect</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật đường dẫn nguồn, đường dẫn đích và mã trạng thái.
        </p>
      </div>
      <RedirectForm redirect={redirect} />
    </div>
  )
}
