import type { Metadata } from "next"

import { MediaLibrary } from "@/app/admin/media/media-library"
import { requireAdmin } from "@/lib/admin-auth"
import { getMediaForAdmin, getMediaMimeTypes } from "@/modules/media/queries"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Media Library",
}

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function value(params: Record<string, string | string[] | undefined>, key: string) {
  const raw = params[key]
  return Array.isArray(raw) ? raw[0] : raw
}

export default async function MediaPage({ searchParams }: PageProps) {
  await requireAdmin()
  const params = (await searchParams) ?? {}
  const filters = {
    q: value(params, "q") ?? "",
    mimeType: value(params, "mimeType") ?? "",
    sort: value(params, "sort") ?? "newest",
  }
  const [media, mimeTypes] = await Promise.all([
    getMediaForAdmin(filters),
    getMediaMimeTypes(),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý ảnh đã tải lên, metadata, alt text và file thumbnail.
          </p>
        </div>
      </div>
      <form className="grid gap-2 rounded-lg border bg-card p-4 md:grid-cols-[1fr_220px_180px_auto]">
        <Input name="q" defaultValue={filters.q} placeholder="Tìm filename hoặc originalName" />
        <select
          name="mimeType"
          defaultValue={filters.mimeType}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm"
        >
          <option value="">Tất cả MIME</option>
          {mimeTypes.map((mimeType) => (
            <option key={mimeType} value={mimeType}>
              {mimeType}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={filters.sort}
          className="h-8 rounded-lg border bg-background px-2.5 text-sm"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="largest">Dung lượng lớn nhất</option>
          <option value="smallest">Dung lượng nhỏ nhất</option>
        </select>
        <Button type="submit" variant="outline">
          Lọc
        </Button>
      </form>
      <MediaLibrary media={media} />
    </div>
  )
}

