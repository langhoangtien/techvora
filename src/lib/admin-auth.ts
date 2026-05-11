import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/admin")
  }

  return session
}

export async function isAdminSession() {
  const session = await getServerSession(authOptions)

  return session?.user?.role === "ADMIN"
}

