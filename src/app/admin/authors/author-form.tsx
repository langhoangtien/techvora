"use client"

import { useActionState, useRef, useState } from "react"
import type { Author } from "@prisma/client"

import {
  saveAuthorAction,
  type AuthorFormState,
} from "@/modules/authors/actions"
import { SlugFields } from "@/components/admin/slug-fields"
import { SubmitButton } from "@/components/admin/submit-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const initialState: AuthorFormState = {
  ok: false,
}

export function AuthorForm({
  author,
  trigger,
}: {
  author?: Author | null
  trigger?: React.ReactNode
}) {
  const [state, formAction] = useActionState(saveAuthorAction, initialState)
  const [open, setOpen] = useState(Boolean(author))
  const inputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(author?.avatarUrl ?? "")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)

    if (!nextOpen && author) {
      const url = new URL(window.location.href)
      url.searchParams.delete("edit")
      window.history.replaceState(null, "", `${url.pathname}${url.search}`)
    }
  }

  async function uploadAvatar(file: File) {
    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("altText", author?.name ?? "Author avatar")

    try {
      const response = await fetch("/api/admin/media/avatar-upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        setUploadError(data.error ?? "Không thể tải avatar lên.")
        return
      }

      setAvatarUrl(data.url)
    } catch {
      setUploadError("Không thể tải avatar lên. Vui lòng thử lại.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{author ? "Sửa tác giả" : "Tạo tác giả"}</DialogTitle>
          <DialogDescription>
            Hồ sơ tác giả dùng cho bài viết, review và trang nội dung public.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={author?.id ?? ""} />
          {state.message ? (
            <div className={state.ok ? "text-sm text-emerald-600" : "text-sm text-destructive"}>
              {state.message}
            </div>
          ) : null}
          <FieldGroup>
            <SlugFields
              nameLabel="Tên tác giả"
              name={author?.name}
              slug={author?.slug}
              nameError={state.errors?.name}
              slugError={state.errors?.slug}
            />
            <Field>
              <FieldLabel htmlFor="bio">Tiểu sử</FieldLabel>
              <textarea
                id="bio"
                name="bio"
                defaultValue={author?.bio ?? ""}
                rows={4}
                className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
                <div className="flex items-center gap-3">
                  <Avatar className="size-12 rounded-lg">
                    <AvatarImage src={avatarUrl} alt={author?.name ?? "Author avatar"} />
                    <AvatarFallback className="rounded-lg">
                      {(author?.name ?? "AU").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-2">
                    <Input
                      id="avatarUrl"
                      name="avatarUrl"
                      value={avatarUrl}
                      onChange={(event) => setAvatarUrl(event.target.value)}
                    />
                    <input
                      ref={inputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        event.target.value = ""
                        if (file) void uploadAvatar(file)
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => inputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Đang tải..." : "Tải avatar"}
                    </Button>
                    {uploadError ? (
                      <p className="text-sm text-destructive">{uploadError}</p>
                    ) : null}
                  </div>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="websiteUrl">Website URL</FieldLabel>
                <Input id="websiteUrl" name="websiteUrl" defaultValue={author?.websiteUrl ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="twitterUrl">Twitter/X URL</FieldLabel>
                <Input id="twitterUrl" name="twitterUrl" defaultValue={author?.twitterUrl ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="linkedinUrl">LinkedIn URL</FieldLabel>
                <Input id="linkedinUrl" name="linkedinUrl" defaultValue={author?.linkedinUrl ?? ""} />
              </Field>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Hủy
                </Button>
              </DialogClose>
              <SubmitButton>{author ? "Lưu tác giả" : "Tạo tác giả"}</SubmitButton>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
