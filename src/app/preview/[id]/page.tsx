import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ContentRenderer } from "@/components/article/content-renderer"
import { Container } from "@/components/layout/container"
import { requireAdmin } from "@/lib/admin-auth"
import { getPostForPreview } from "@/modules/posts/queries"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Preview",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const post = await getPostForPreview(id)

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-svh bg-background py-10">
      <Container className="max-w-3xl">
        <div className="mb-8 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Bản xem trước chỉ dành cho quản trị viên. Trạng thái hiện tại:{" "}
          <span className="font-medium text-foreground">{post.status}</span>
        </div>
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="mb-8 aspect-video w-full rounded-lg border object-cover"
          />
        ) : null}
        <article>
          <p className="text-sm text-muted-foreground">
            {post.category?.name ?? "Uncategorized"} ·{" "}
            {post.author?.name ?? "Tekvora"}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">
            {post.title}
          </h1>
          {post.excerpt ? (
            <p className="mt-4 text-lg leading-8 text-muted-foreground">
              {post.excerpt}
            </p>
          ) : null}
          <ContentRenderer html={post.content ?? ""} className="mt-10" />
        </article>
      </Container>
    </main>
  )
}
