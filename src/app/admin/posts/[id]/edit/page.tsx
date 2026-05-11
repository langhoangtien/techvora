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
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
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
  const query = (await searchParams) ?? {}
  const success = Array.isArray(query.success) ? query.success[0] : query.success

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Sửa bài viết</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cập nhật nội dung, trạng thái xuất bản và SEO.
        </p>
      </div>
      {success ? (
        <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      ) : null}
      <PostForm
        post={post}
        options={options}
        defaultSeoTitle={siteConfig.seoTitle}
        defaultSeoDescription={siteConfig.seoDescription}
      />
    </div>
  )
}
