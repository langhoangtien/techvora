import type { Metadata } from "next"

import { ComparisonForm } from "@/app/admin/comparisons/comparison-form"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Tạo comparison" }

export default async function NewComparisonPage() {
  await requireAdmin()
  return <div className="space-y-6"><div><h1 className="text-2xl font-semibold tracking-tight">Tạo comparison</h1><p className="mt-1 text-sm text-muted-foreground">Tạo trang so sánh public.</p></div><ComparisonForm /></div>
}
