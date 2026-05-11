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
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const [tool, options] = await Promise.all([getToolForEdit(id), getToolEditorOptions()])

  if (!tool) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa công cụ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung, SEO và widget của công cụ.
        </p>
      </div>
      <ToolForm tool={tool} categories={options.categories} />
    </div>
  )
}
