"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

import { isAdminSession } from "@/lib/admin-auth"
import { adminRedirect, deleteErrorMessage } from "@/lib/admin-redirect"
import { prisma } from "@/lib/prisma"

export type UserFormState = {
  ok: boolean
  message?: string
  errors?: Partial<Record<"email" | "name" | "password" | "role", string>>
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim()
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key)
  return value ? value : null
}

async function ensureAdmin() {
  return isAdminSession()
}

export async function saveUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  if (!(await ensureAdmin())) {
    return {
      ok: false,
      message: "Bạn không có quyền lưu người dùng.",
    }
  }

  const id = nullableText(formData, "id")
  const email = text(formData, "email")
  const name = nullableText(formData, "name")
  const password = nullableText(formData, "password")
  const avatarUrl = nullableText(formData, "avatarUrl")
  const role = text(formData, "role") || "EDITOR"
  const errors: UserFormState["errors"] = {}

  if (!email) {
    errors.email = "Vui lòng nhập email."
  } else if (!email.includes("@")) {
    errors.email = "Email không hợp lệ."
  }

  if (id && !password) {
    // Khi cập nhật, password là tùy chọn
  } else if (!id && !password) {
    errors.password = "Vui lòng nhập mật khẩu cho user mới."
  } else if (password && password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự."
  }

  const existingEmail = email
    ? await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      })
    : null

  if (existingEmail && existingEmail.id !== id) {
    errors.email = "Email này đã được sử dụng."
  }

  if (Object.keys(errors).length > 0) {
    return {
      ok: false,
      message: "Vui lòng kiểm tra lại thông tin người dùng.",
      errors,
    }
  }

  try {
    const data: any = {
      email,
      name,
      role,
      avatarUrl,
    }

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10)
    }

    if (id) {
      await prisma.user.update({
        where: { id },
        data,
      })
    } else {
      await prisma.user.create({
        data,
      })
    }

    revalidatePath("/admin/users")
    redirect(
      adminRedirect(
        "/admin/users",
        {
          success: id ? "Đã cập nhật người dùng." : "Đã tạo người dùng.",
        }
      )
    )
  } catch (error) {
    return {
      ok: false,
      message: "Có lỗi xảy ra khi lưu người dùng.",
    }
  }
}

export async function deleteUserAction(formData: FormData) {
  if (!(await ensureAdmin())) {
    redirect(
      adminRedirect("/admin/users", {
        error: "Bạn không có quyền xóa người dùng.",
      })
    )
  }

  const id = text(formData, "id")
  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) {
    redirect(adminRedirect("/admin/users", { error: "Không tìm thấy người dùng." }))
  }

  try {
    // Xóa author nếu có
    await prisma.author.deleteMany({ where: { userId: id } })
    // Xóa user
    await prisma.user.delete({ where: { id } })
  } catch {
    redirect(adminRedirect("/admin/users", { error: deleteErrorMessage("người dùng") }))
  }

  revalidatePath("/admin/users")
  redirect(adminRedirect("/admin/users", { success: "Đã xóa người dùng." }))
}
