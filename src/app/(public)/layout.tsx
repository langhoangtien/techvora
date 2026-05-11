import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getSiteConfig } from "@/lib/settings"
import { getThemeStyle } from "@/lib/theme"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const siteConfig = await getSiteConfig()

  return (
    <div
      className="min-h-svh bg-background"
      style={getThemeStyle(siteConfig.theme)}
    >
      <SiteHeader config={siteConfig} />
      <main>{children}</main>
      <SiteFooter config={siteConfig} />
    </div>
  )
}
