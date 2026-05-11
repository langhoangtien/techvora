"use client"

import { useRef, useState } from "react"
import type { Media } from "@prisma/client"
import {
  ClipboardIcon,
  CopyIcon,
  ImageIcon,
  Trash2Icon,
  UploadIcon,
  XIcon,
} from "lucide-react"

import {
  deleteMediaAction,
  updateMediaAltTextAction,
} from "@/modules/media/actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function formatBytes(size?: number | null) {
  if (!size) return "Không rõ"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function MediaLibrary({
  media,
  success,
  error,
}: {
  media: Media[]
  success?: string
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<Media | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [forceDelete, setForceDelete] = useState(false)

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    setUploadError(null)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("altText", file.name)
        const response = await fetch("/api/admin/media/upload", {
          method: "POST",
          body: formData,
        })
        const data = await response.json()

        if (!response.ok) {
          setUploadError(data.error ?? "Không thể tải ảnh lên.")
          break
        }
      }
      window.location.reload()
    } catch {
      setUploadError("Không thể tải ảnh lên. Vui lòng thử lại.")
    } finally {
      setUploading(false)
    }
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {success ? (
          <div className="rounded-lg border bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        ) : null}
        {error || uploadError ? (
          <div className="rounded-lg border bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error ?? uploadError}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              void uploadFiles(event.target.files)
              event.target.value = ""
            }}
          />
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <UploadIcon />
            {uploading ? "Đang tải..." : "Tải ảnh lên"}
          </Button>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border bg-card p-8 text-center">
          <ImageIcon className="size-10 text-muted-foreground" />
          <h3 className="mt-4 font-medium">Chưa có media</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Ảnh tải lên từ editor, cover image hoặc Media Library sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelected(item)
                setForceDelete(false)
              }}
              className="overflow-hidden rounded-lg border bg-card text-left transition-colors hover:border-foreground/20"
            >
              <div className="bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnailUrl ?? item.url}
                  alt={item.altText ?? item.filename}
                  className="aspect-video w-full object-cover"
                />
              </div>
              <div className="space-y-1 p-3">
                <div className="truncate text-sm font-medium">{item.filename}</div>
                <div className="text-xs text-muted-foreground">{item.mimeType}</div>
                <div className="text-xs text-muted-foreground">
                  {formatBytes(item.size)} · {item.width ?? "?"}x{item.height ?? "?"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-lg border bg-background shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <div>
                <h2 className="font-semibold">Chi tiết media</h2>
                <p className="text-sm text-muted-foreground">{selected.filename}</p>
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => setSelected(null)}>
                <XIcon />
                <span className="sr-only">Đóng</span>
              </Button>
            </div>
            <div className="grid gap-6 p-4 lg:grid-cols-[1fr_340px]">
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selected.url}
                  alt={selected.altText ?? selected.filename}
                  className="max-h-[560px] w-full rounded-lg border object-contain"
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2 text-sm">
                  <Detail label="URL" value={selected.url} />
                  <Detail label="Tên file" value={selected.filename} />
                  <Detail label="Tên gốc" value={selected.originalName ?? "Không có"} />
                  <Detail label="MIME" value={selected.mimeType} />
                  <Detail label="Dung lượng" value={formatBytes(selected.size)} />
                  <Detail label="Kích thước" value={`${selected.width ?? "?"}x${selected.height ?? "?"}`} />
                  <Detail label="Thumbnail" value={selected.thumbnailUrl ?? "Không có"} />
                  <Detail label="Ngày tạo" value={formatDate(selected.createdAt)} />
                </div>
                <Button type="button" variant="outline" onClick={() => void copyUrl(selected.url)}>
                  {copied ? <ClipboardIcon /> : <CopyIcon />}
                  {copied ? "Đã copy" : "Copy URL"}
                </Button>
                <form action={updateMediaAltTextAction} className="space-y-2">
                  <input type="hidden" name="id" value={selected.id} />
                  <label className="text-sm font-medium" htmlFor="altText">Alt text</label>
                  <Input id="altText" name="altText" defaultValue={selected.altText ?? ""} />
                  <Button type="submit" variant="outline">Lưu alt text</Button>
                </form>
                <form action={deleteMediaAction} className="space-y-3 rounded-lg border p-3">
                  <input type="hidden" name="id" value={selected.id} />
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="force"
                      checked={forceDelete}
                      onChange={(event) => setForceDelete(event.target.checked)}
                    />
                    Force delete nếu media đang được sử dụng
                  </label>
                  <Button
                    type="submit"
                    variant="destructive"
                    onClick={(event) => {
                      if (!window.confirm("Bạn chắc chắn muốn xóa media này?")) {
                        event.preventDefault()
                      }
                    }}
                  >
                    <Trash2Icon />
                    Xóa media
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <div className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className={cn("break-all rounded-md bg-muted px-2 py-1")}>{value}</div>
    </div>
  )
}
