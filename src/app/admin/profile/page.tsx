import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProfileForm } from "@/app/admin/profile/profile-form"
import { requireAdmin } from "@/lib/admin-auth"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Hồ sơ tài khoản",
}

export default async function AdminProfilePage() {
  const session = await requireAdmin()
  const userId = session.user?.id

  if (!userId) {
    notFound()
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      image: true,
    },
  })

  if (!user) {
    notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hồ sơ tài khoản</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý thông tin cá nhân, ảnh đại diện và mật khẩu đăng nhập.
        </p>
      </div>
      <ProfileForm user={user} />
    </div>
  )
}
