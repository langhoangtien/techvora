import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { authOptions } from "@/lib/auth"
import { getSiteConfig } from "@/lib/settings"
import { getThemeStyle } from "@/lib/theme"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getServerSession } from "next-auth"

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  const siteConfig = await getSiteConfig()

  return (
    <SidebarProvider style={getThemeStyle(siteConfig.theme)}>
      <AdminSidebar user={session?.user} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center border-b bg-background/80 backdrop-blur-xl">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Quản trị {siteConfig.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
