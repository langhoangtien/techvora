import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ToolForm } from "@/app/admin/tools/tool-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getToolEditorOptions, getToolForEdit } from "@/modules/tools/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sửa công cụ",
}

export default async function EditToolPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireAdmin()
  const [{ id }, query] = await Promise.all([params, searchParams])
  const [tool, options] = await Promise.all([getToolForEdit(id), getToolEditorOptions()])

  if (!tool) {
    notFound()
  }

  const success = Array.isArray(query?.success) ? query?.success[0] : query?.success

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa công cụ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung, SEO và widget của công cụ.
        </p>
      </div>
      {success ? <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</div> : null}
      <ToolForm tool={tool} categories={options.categories} />
    </div>
  )
}
