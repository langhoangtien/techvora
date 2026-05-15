"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { IconDeviceFloppy as SaveIcon, IconUpload as UploadIcon } from "@tabler/icons-react"
import { toast } from "sonner"
import type { UserRole } from "@/generated/prisma/client"

import {
  changePasswordAction,
  type PasswordFormState,
  updateProfileAction,
  type ProfileFormState,
} from "@/app/admin/profile/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type ProfileUser = {
  name: string | null
  email: string
  role: UserRole
  avatarUrl: string | null
  image: string | null
}

const profileInitialState: ProfileFormState = { ok: false }
const passwordInitialState: PasswordFormState = { ok: false }

function initials(name: string | null, email: string) {
  const source = name || email
  return source.slice(0, 2).toUpperCase()
}

function useToastState(state: { ok: boolean; message?: string }) {
  useEffect(() => {
    if (!state.message) return

    if (state.ok) {
      toast.success(state.message)
    } else {
      toast.error(state.message)
    }
  }, [state])
}

export function ProfileForm({ user }: { user: ProfileUser }) {
  const [profileState, profileAction, isProfilePending] = useActionState(
    updateProfileAction,
    profileInitialState
  )
  const [passwordState, passwordAction, isPasswordPending] = useActionState(
    changePasswordAction,
    passwordInitialState
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? user.image ?? "")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  useToastState(profileState)
  useToastState(passwordState)

  async function uploadAvatar(file: File) {
    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("altText", user.name ?? user.email)

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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin tài khoản</CardTitle>
            <CardDescription>
              Cập nhật tên hiển thị của quản trị viên. Email và vai trò không thể thay đổi tại đây.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={profileAction} className="space-y-5">
              <FieldGroup>
                <Field data-invalid={Boolean(profileState.errors?.name)}>
                  <FieldLabel htmlFor="name" required>
                    Tên hiển thị
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name ?? ""}
                    required
                    aria-invalid={Boolean(profileState.errors?.name)}
                  />
                  {profileState.errors?.name ? (
                    <FieldError>{profileState.errors.name}</FieldError>
                  ) : null}
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input id="email" value={user.email} disabled readOnly />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="role">Vai trò</FieldLabel>
                    <Input id="role" value={user.role} disabled readOnly />
                  </Field>
                </div>
                <Field data-invalid={Boolean(profileState.errors?.avatarUrl)}>
                  <FieldLabel htmlFor="avatarUrl">Avatar URL</FieldLabel>
                  <Input
                    id="avatarUrl"
                    name="avatarUrl"
                    value={avatarUrl}
                    onChange={(event) => setAvatarUrl(event.target.value)}
                    aria-invalid={Boolean(profileState.errors?.avatarUrl)}
                  />
                  {profileState.errors?.avatarUrl ? (
                    <FieldError>{profileState.errors.avatarUrl}</FieldError>
                  ) : null}
                </Field>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isProfilePending}>
                    <SaveIcon />
                    {isProfilePending ? "Đang lưu..." : "Lưu thông tin"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>
              Mật khẩu mới cần tối thiểu 8 ký tự và phải khác mật khẩu hiện tại.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={passwordAction} className="space-y-5">
              <FieldGroup>
                <Field data-invalid={Boolean(passwordState.errors?.currentPassword)}>
                  <FieldLabel htmlFor="currentPassword" required>
                    Mật khẩu hiện tại
                  </FieldLabel>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    required
                    aria-invalid={Boolean(passwordState.errors?.currentPassword)}
                  />
                  {passwordState.errors?.currentPassword ? (
                    <FieldError>{passwordState.errors.currentPassword}</FieldError>
                  ) : null}
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field data-invalid={Boolean(passwordState.errors?.newPassword)}>
                    <FieldLabel htmlFor="newPassword" required>
                      Mật khẩu mới
                    </FieldLabel>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      aria-invalid={Boolean(passwordState.errors?.newPassword)}
                    />
                    {passwordState.errors?.newPassword ? (
                      <FieldError>{passwordState.errors.newPassword}</FieldError>
                    ) : null}
                  </Field>
                  <Field data-invalid={Boolean(passwordState.errors?.confirmPassword)}>
                    <FieldLabel htmlFor="confirmPassword" required>
                      Xác nhận mật khẩu mới
                    </FieldLabel>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      minLength={8}
                      required
                      aria-invalid={Boolean(passwordState.errors?.confirmPassword)}
                    />
                    {passwordState.errors?.confirmPassword ? (
                      <FieldError>{passwordState.errors.confirmPassword}</FieldError>
                    ) : null}
                  </Field>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isPasswordPending}>
                    <SaveIcon />
                    {isPasswordPending ? "Đang đổi..." : "Đổi mật khẩu"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Ảnh đại diện</CardTitle>
          <CardDescription>
            Avatar được xử lý theo cấu hình media hiện tại.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              <AvatarImage src={avatarUrl} alt={user.name ?? user.email} />
              <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <input
            ref={fileInputRef}
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
            className="w-full"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon />
            {uploading ? "Đang tải lên..." : "Tải avatar lên"}
          </Button>
          {uploadError ? <FieldError>{uploadError}</FieldError> : null}
        </CardContent>
      </Card>
    </div>
  )
}
