import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { SettingsForm } from "@/app/admin/settings/settings-form"
import { authOptions } from "@/lib/auth"
import { getSettings } from "@/lib/settings"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Cài đặt site",
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role !== "ADMIN") {
    redirect("/admin")
  }

  const settings = await getSettings()

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cài đặt site</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý cấu hình chung, SEO, mạng xã hội, quảng cáo, giao diện và
          footer của Tekvora.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  )
}
