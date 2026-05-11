import type { Metadata } from "next"

import { AdminShell } from "@/components/admin/admin-shell"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Quản trị",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminShell>{children}</AdminShell>
}
