import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ComparisonForm } from "@/app/admin/comparisons/comparison-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getComparisonForEdit } from "@/modules/comparisons/queries"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Sửa comparison" }

export default async function EditComparisonPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const comparison = await getComparisonForEdit(id)
  if (!comparison) notFound()
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">Sửa comparison</h1><p className="mt-1 text-sm text-muted-foreground">Cập nhật nội dung, bảng so sánh, SEO và CTA.</p></div><ComparisonForm comparison={comparison} /></div>
}
