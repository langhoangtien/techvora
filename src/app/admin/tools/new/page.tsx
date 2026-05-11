import type { Metadata } from "next"

import { ToolForm } from "@/app/admin/tools/tool-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getToolEditorOptions } from "@/modules/tools/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tạo công cụ",
}

export default async function NewToolPage() {
  await requireAdmin()
  const options = await getToolEditorOptions()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tạo công cụ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tạo tool page và gắn component tương tác từ registry.
        </p>
      </div>
      <ToolForm categories={options.categories} />
    </div>
  )
}
