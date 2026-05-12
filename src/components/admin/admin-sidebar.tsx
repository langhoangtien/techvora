"use client"

import {  nav, siteConfig } from "@/config/site"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavSecondary } from "../nav-secondary";


export function AdminSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                  T
                </span>
                <span className="grid text-left text-sm leading-tight">
                  <span className="font-semibold">{siteConfig.name}</span>
                  <span className="text-xs text-sidebar-foreground/70">
                    Admin CMS
                  </span>
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={nav.adminNavMain} label="Quản trị" />
        <NavSecondary  className="mt-auto"  items={nav.adminNavSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "Quản trị viên",
            email: user?.email ?? "admin@tekvora.local",
            avatar: user?.image ?? "",
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
