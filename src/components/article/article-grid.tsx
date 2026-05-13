import { ArticleCard } from "@/components/article/article-card"
import { EmptyState } from "@/components/layout/empty-state"
import { formatPublicDate } from "@/modules/posts/public"

type ArticleGridPost = {
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  publishedAt: Date | null
  category: { name: string } | null
  author: { name: string } | null
}

export function ArticleGrid({
  posts,
  emptyTitle = "Keine Artikel gefunden",
}: {
  posts: ArticleGridPost[]
  emptyTitle?: string
}) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description="Veröffentlichte Artikel erscheinen hier, sobald sie verfügbar sind."
      />
    )
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <ArticleCard
          key={post.slug}
          title={post.title}
          href={`/articles/${post.slug}`}
          excerpt={post.excerpt ?? undefined}
          imageUrl={post.coverImageUrl}
          category={post.category?.name}
          author={post.author?.name}
          publishedAt={formatPublicDate(post.publishedAt)}
        />
      ))}
    </div>
  )
}
