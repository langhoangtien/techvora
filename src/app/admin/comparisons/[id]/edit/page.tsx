import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComparisonForm } from "@/app/admin/comparisons/comparison-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getComparisonForEdit } from "@/modules/comparisons/queries"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Sửa comparison" }

export default async function EditComparisonPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin()
  const [{ id }, query] = await Promise.all([params, searchParams])
  const comparison = await getComparisonForEdit(id)
  if (!comparison) notFound()
  const success = Array.isArray(query?.success) ? query?.success[0] : query?.success
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">Sửa comparison</h1><p className="mt-1 text-sm text-muted-foreground">Cập nhật nội dung, bảng so sánh, SEO và CTA.</p></div>{success ? <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}<ComparisonForm comparison={comparison} /></div>
}
