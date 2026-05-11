"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export type ProfileFormState = {
  ok: boolean
  message?: string
  errors?: Partial<Record<"name" | "avatarUrl", string>>
}

export type PasswordFormState = {
  ok: boolean
  message?: string
  errors?: Partial<
    Record<"currentPassword" | "newPassword" | "confirmPassword", string>
  >
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await requireAdmin()
  const userId = session.user?.id

  if (!userId) {
    return {
      ok: false,
      message: "Không thể xác định tài khoản hiện tại.",
    }
  }

  const name = text(formData, "name")
  const avatarUrl = text(formData, "avatarUrl")
  const errors: ProfileFormState["errors"] = {}

  if (!name) {
    errors.name = "Vui lòng nhập tên hiển thị."
  }

  if (avatarUrl) {
    try {
      new URL(avatarUrl, "http://localhost")
    } catch {
      errors.avatarUrl = "Avatar URL không hợp lệ."
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin tài khoản.",
      errors,
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      avatarUrl: avatarUrl || null,
      image: avatarUrl || null,
    },
  })

  revalidatePath("/admin/profile")
  revalidatePath("/admin", "layout")

  return {
    ok: true,
    message: "Đã cập nhật thông tin tài khoản.",
  }
}

export async function changePasswordAction(
  _prevState: PasswordFormState,
  formData: FormData
): Promise<PasswordFormState> {
  const session = await requireAdmin()
  const userId = session.user?.id

  if (!userId) {
    return {
      ok: false,
      message: "Không thể xác định tài khoản hiện tại.",
    }
  }

  const currentPassword = text(formData, "currentPassword")
  const newPassword = text(formData, "newPassword")
  const confirmPassword = text(formData, "confirmPassword")
  const errors: PasswordFormState["errors"] = {}

  if (!currentPassword) {
    errors.currentPassword = "Vui lòng nhập mật khẩu hiện tại."
  }

  if (!newPassword) {
    errors.newPassword = "Vui lòng nhập mật khẩu mới."
  } else if (newPassword.length < 8) {
    errors.newPassword = "Mật khẩu mới phải có ít nhất 8 ký tự."
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Vui lòng xác nhận mật khẩu mới."
  } else if (newPassword && newPassword !== confirmPassword) {
    errors.confirmPassword = "Mật khẩu xác nhận không khớp."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin đổi mật khẩu.",
      errors,
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  })

  if (!user?.passwordHash) {
    return {
      ok: false,
      message: "Tài khoản này chưa có mật khẩu để thay đổi.",
    }
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.passwordHash
  )

  if (!isCurrentPasswordValid) {
    return {
      ok: false,
      message: "Mật khẩu hiện tại không đúng.",
      errors: {
        currentPassword: "Mật khẩu hiện tại không đúng.",
      },
    }
  }

  const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash)

  if (isSamePassword) {
    return {
      ok: false,
      message: "Mật khẩu mới phải khác mật khẩu hiện tại.",
      errors: {
        newPassword: "Mật khẩu mới phải khác mật khẩu hiện tại.",
      },
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      passwordHash: await bcrypt.hash(newPassword, 12),
    },
  })

  return {
    ok: true,
    message: "Đã đổi mật khẩu.",
  }
}
