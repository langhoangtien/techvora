import type { Metadata } from "next"

import { PostForm } from "@/app/admin/posts/post-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getSiteConfig } from "@/lib/settings"
import { getPostEditorOptions } from "@/modules/posts/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Tạo bài viết",
}

export default async function NewPostPage() {
  await requireAdmin()
  const [options, siteConfig] = await Promise.all([
    getPostEditorOptions(),
    getSiteConfig(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tạo bài viết</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Soạn nội dung, tối ưu SEO và lưu nháp hoặc xuất bản.
        </p>
      </div>
      <PostForm
        options={options}
        defaultSeoTitle={siteConfig.seoTitle}
        defaultSeoDescription={siteConfig.seoDescription}
      />
    </div>
  )
}

