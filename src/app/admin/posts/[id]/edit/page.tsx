import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PostForm } from "@/app/admin/posts/post-form"
import { requireAdmin } from "@/lib/admin-auth"
import { getSiteConfig } from "@/lib/settings"
import { getPostEditorOptions, getPostForEdit } from "@/modules/posts/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sửa bài viết",
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const [post, options, siteConfig] = await Promise.all([
    getPostForEdit(id),
    getPostEditorOptions(),
    getSiteConfig(),
  ])

  if (!post) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa bài viết</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung, trạng thái xuất bản và SEO.
        </p>
      </div>
      <PostForm
        post={post}
        options={options}
        defaultSeoTitle={siteConfig.seoTitle}
        defaultSeoDescription={siteConfig.seoDescription}
      />
    </div>
  )
}
