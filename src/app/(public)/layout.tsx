import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { getSiteConfig } from "@/lib/settings"
import { getThemeStyle } from "@/lib/theme"
import { getFeaturedHeaderCategories } from "@/modules/categories/public"

export const dynamic = "force-dynamic"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [siteConfig, headerCategories] = await Promise.all([
    getSiteConfig(),
    getFeaturedHeaderCategories(),
  ])

  return (
    <div
      className="min-h-svh bg-background"
      style={getThemeStyle(siteConfig.theme)}
    >
      <SiteHeader config={siteConfig} categoryNavItems={headerCategories} />
      <main>{children}</main>
      <SiteFooter config={siteConfig} />
    </div>
  )
}
