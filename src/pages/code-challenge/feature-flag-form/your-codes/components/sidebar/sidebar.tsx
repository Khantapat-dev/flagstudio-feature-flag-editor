import * as React from 'react'
import { Flag, ChevronRight } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from '@/components/ui/sidebar'

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      {/* Logo */}
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/code-challenge/feature-flag-form">
                <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <Flag className="size-5" />
                </div>

                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-bold tracking-tight">
                    FlagStudio
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Feature management
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main content - intentionally empty */}
      <SidebarContent />

      {/* Developer Profile */}
      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-2" />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-auto rounded-xl p-2 transition-colors hover:bg-sidebar-accent"
            >
              <Link to="/about">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  K
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                  <span className="truncate text-sm font-semibold">
                    Khantapat
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Full Stack Developer
                  </span>
                </div>

                <ChevronRight className="ml-auto size-4 shrink-0 text-muted-foreground" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}