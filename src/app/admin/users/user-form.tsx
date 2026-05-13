"use client"

import { useActionState, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@prisma/client"
import {
  IconEye,
  IconEyeOff,
  IconTrash,
} from "@tabler/icons-react"
import { toast } from "sonner"

import {
  saveUserAction,
  deleteUserAction,
  type UserFormState,
} from "@/modules/users/actions"
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

const initialState: UserFormState = {
  ok: false,
}

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = name || email || "U"
  return source.slice(0, 2).toUpperCase()
}

export function UserForm({
  user,
  trigger,
}: {
  user?: (User & { author?: { id: string; slug: string } | null }) | null
  trigger?: React.ReactNode
}) {
  const router = useRouter()
  const [state, formAction] = useActionState(saveUserAction, initialState)
  const [deleteState, deleteAction] = useActionState(deleteUserAction, undefined as any)
  const [open, setOpen] = useState(Boolean(user))
  const [showPassword, setShowPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? user?.image ?? "")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen && user) {
      const url = new URL(window.location.href)
      url.searchParams.delete("edit")
      router.replace(`${url.pathname}${url.search}`, { scroll: false })
    }
  }

  async function uploadAvatar(file: File) {
    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("altText", user?.name ?? user?.email ?? "User avatar")

    try {
      const response = await fetch("/api/admin/media/avatar-upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        setUploadError(data.error ?? "Không thể tải avatar lên.")
        toast.error(data.error ?? "Không thể tải avatar lên.")
        return
      }

      setAvatarUrl(data.url)
      toast.success("Đã tải avatar lên.")
    } catch {
      setUploadError("Không thể tải avatar lên. Vui lòng thử lại.")
      toast.error("Không thể tải avatar lên. Vui lòng thử lại.")
    } finally {
      setUploading(false)
    }
  }

  function handleDelete() {
    if (window.confirm("Bạn chắc chắn muốn xóa người dùng này không? Hành động này không thể hoàn tác.")) {
      setIsDeleting(true)
      const formData = new FormData()
      formData.append("id", user?.id ?? "")
      deleteAction(formData)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Sửa người dùng" : "Tạo người dùng"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Cập nhật thông tin người dùng hiện có."
              : "Tạo tài khoản người dùng mới cho hệ thống."}
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={user?.id ?? ""} />
          <input type="hidden" name="avatarUrl" value={avatarUrl} />

          {state.message ? (
            <div
              className={
                state.ok
                  ? "text-sm text-emerald-600"
                  : "text-sm text-destructive"
              }
            >
              {state.message}
            </div>
          ) : null}

          <FieldGroup>
            <Field>
              <FieldLabel>Avatar</FieldLabel>
              <div className="flex items-center gap-3">
                <Avatar className="size-12 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={user?.name ?? "User avatar"} />
                  <AvatarFallback className="rounded-lg">
                    {initials(user?.name, user?.email)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    placeholder="Avatar URL"
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
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user?.email ?? ""}
                placeholder="user@example.com"
                required
              />
              {state.errors?.email ? (
                <div className="text-xs text-destructive">{state.errors.email}</div>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="name">Tên hiển thị</FieldLabel>
              <Input
                id="name"
                name="name"
                defaultValue={user?.name ?? ""}
                placeholder="Nhập tên người dùng"
              />
              {state.errors?.name ? (
                <div className="text-xs text-destructive">{state.errors.name}</div>
              ) : null}
            </Field>

            <Field>
              <FieldLabel htmlFor="role">Vai trò</FieldLabel>
              <select
                id="role"
                name="role"
                defaultValue={user?.role ?? "EDITOR"}
                className="h-8 rounded-lg border bg-background px-3 text-sm"
              >
                <option value="EDITOR">Biên tập viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
              {state.errors?.role ? (
                <div className="text-xs text-destructive">{state.errors.role}</div>
              ) : null}
            </Field>

            {user?.author?.slug && (
              <Field>
                <FieldLabel>Tác giả</FieldLabel>
                <div className="text-sm text-muted-foreground">
                  /{user.author.slug}
                </div>
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="password">
                {user ? "Mật khẩu mới (bỏ trống nếu không thay đổi)" : "Mật khẩu"}
              </FieldLabel>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={user ? "Nhập mật khẩu mới..." : "Nhập mật khẩu"}
                  required={!user}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {state.errors?.password ? (
                <div className="text-xs text-destructive">{state.errors.password}</div>
              ) : null}
            </Field>
          </FieldGroup>

          <DialogFooter className="gap-2">
            {user ? (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <IconTrash className="h-4 w-4" />
                Xóa
              </Button>
            ) : null}
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Hủy
              </Button>
            </DialogClose>
            <SubmitButton>
              {user ? "Cập nhật" : "Tạo người dùng"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
