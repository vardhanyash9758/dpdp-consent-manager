"use client"

import type * as React from "react"
import {
  LayoutDashboard,
  FileCheck,
  ScrollText,
  Shield,
  Plug,
  ShieldAlert,
  Settings,
  Bell,
  BarChart3,
  ChevronRight,
  Play,
  LogOut,
  HelpCircle,
  Building2,
  Users2,
  FileText,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown, User2 } from "lucide-react"

const data = {
  general: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      key: "dashboard",
      isActive: true,
    },
  ],
  consent: [
    {
      title: "Notice Banner",
      url: "#",
      icon: Bell,
      key: "notice-banner",
    },
    {
      title: "Purposes",
      url: "#",
      icon: FileCheck,
      key: "purposes",
    },
  ],
  analytics: [
    {
      title: "Analysis",
      url: "#",
      icon: BarChart3,
      key: "analysis",
    },
    {
      title: "Consent Logs",
      url: "#",
      icon: ScrollText,
      key: "consent-logs",
    },
  ],
  vendors: [
    {
      title: "Vendor Overview",
      url: "#",
      icon: Building2,
      key: "vendor-overview",
    },
    {
      title: "Vendor Assessment",
      url: "#",
      icon: Users2,
      key: "vendor-assessment",
    },
    {
      title: "DPA Management",
      url: "#",
      icon: FileText,
      key: "dpa-management",
    },
  ],
  tools: [
    {
      title: "Integration",
      url: "#",
      icon: Plug,
      key: "integration",
    },
    {
      title: "DSR",
      url: "#",
      icon: Shield,
      key: "dsr",
    },
    {
      title: "Breach Policies",
      url: "#",
      icon: ShieldAlert,
      key: "breach-policies",
    },
  ],
  support: [
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      key: "settings",
    },
    {
      title: "Demo",
      url: "/demo",
      icon: Play,
      key: "demo",
      external: true,
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onNavigate?: (section: string) => void
}

export function AppSidebar({ onNavigate, ...props }: AppSidebarProps) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <img src="/images/image.png" alt="Better Call Saul" className="h-10 w-auto object-contain" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* General Section */}
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarMenu>
            {data.general.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  asChild
                  isActive={item.isActive}
                  onClick={() => onNavigate?.(item.key)}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Consent Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Consent</SidebarGroupLabel>
          <SidebarMenu>
            {data.consent.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  asChild
                  onClick={() => onNavigate?.(item.key)}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarMenu>
            {data.analytics.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  asChild
                  onClick={() => onNavigate?.(item.key)}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Vendor Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Vendor Management</SidebarGroupLabel>
          <SidebarMenu>
            {data.vendors.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  asChild
                  onClick={() => onNavigate?.(item.key)}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarMenu>
            {data.tools.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  asChild
                  onClick={() => onNavigate?.(item.key)}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Support */}
        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarMenu>
            {data.support.map((item) => (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  asChild
                  onClick={() => {
                    if (item.external) {
                      window.open(item.url, '_blank')
                    } else {
                      onNavigate?.(item.key)
                    }
                  }}
                >
                  <a href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Admin User</span>
                    <span className="truncate text-xs text-muted-foreground">admin@company.com</span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User2 className="mr-2 h-4 w-4" />
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Help & Support</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
