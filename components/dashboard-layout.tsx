"use client"

import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileCheck,
  ScrollText,
  FileText,
  Plug,
  ShieldAlert,
  Settings,
  ChevronDown,
  CheckSquare,
  Bell,
  BarChart3,
  Shield,
} from "lucide-react"
import {
  DashboardOverview,
  AnalysisSection,
  ConsentLogsSection,
  DSRSection,
  IntegrationSection,
  BreachPoliciesSection,
  SettingsSection,
  CookieConsentsSection,
  ProfilesSection,
} from "./dashboard-sections"
import { NoticeBannerConfig } from "./notice-banner-config"

interface SidebarLinkProps {
  label: string
  href?: string
  icon: React.ReactNode
  isActive?: boolean
  onClick?: () => void
  children?: SidebarLinkProps[]
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(["consents"])
  const [activeSection, setActiveSection] = useState("dashboard")

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const links: SidebarLinkProps[] = [
    {
      label: "Dashboard",
      href: "#",
      icon: <LayoutDashboard className="h-5 w-5 shrink-0" />,
      onClick: () => setActiveSection("dashboard"),
    },
    {
      label: "Consents",
      icon: <FileCheck className="h-5 w-5 shrink-0" />,
      children: [
        {
          label: "Notice Banner",
          href: "#",
          icon: <Bell className="h-4 w-4 shrink-0" />,
          onClick: () => setActiveSection("notice-banner"),
        },
        {
          label: "Cookie Consents",
          href: "#",
          icon: <CheckSquare className="h-4 w-4 shrink-0" />,
          onClick: () => setActiveSection("cookie-consents"),
        },
        {
          label: "Profiles",
          href: "#",
          icon: <FileText className="h-4 w-4 shrink-0" />,
          onClick: () => setActiveSection("profiles"),
        },
      ],
    },
    {
      label: "Analysis",
      href: "#",
      icon: <BarChart3 className="h-5 w-5 shrink-0" />,
      onClick: () => setActiveSection("analysis"),
    },
    {
      label: "Consent Logs",
      href: "#",
      icon: <ScrollText className="h-5 w-5 shrink-0" />,
      onClick: () => setActiveSection("consent-logs"),
    },
    {
      label: "DSR",
      href: "#",
      icon: <Shield className="h-5 w-5 shrink-0" />,
      onClick: () => setActiveSection("dsr"),
    },
    {
      label: "Integration",
      href: "#",
      icon: <Plug className="h-5 w-5 shrink-0" />,
      onClick: () => setActiveSection("integration"),
    },
    {
      label: "Breach Policies",
      href: "#",
      icon: <ShieldAlert className="h-5 w-5 shrink-0" />,
      onClick: () => setActiveSection("breach-policies"),
    },
    {
      label: "Settings",
      href: "#",
      icon: <Settings className="h-5 w-5 shrink-0" />,
      onClick: () => setActiveSection("settings"),
    },
  ]

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />
      case "notice-banner":
        return <NoticeBannerConfig />
      case "cookie-consents":
        return <CookieConsentsSection />
      case "profiles":
        return <ProfilesSection />
      case "analysis":
        return <AnalysisSection />
      case "consent-logs":
        return <ConsentLogsSection />
      case "dsr":
        return <DSRSection />
      case "integration":
        return <IntegrationSection />
      case "breach-policies":
        return <BreachPoliciesSection />
      case "settings":
        return <SettingsSection />
      default:
        return children
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-border bg-card transition-all duration-300",
          open ? "w-64" : "w-16",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          {open && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">Consentin</span>
              <span className="text-xs text-muted-foreground">by Legalify</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map((link, idx) => (
            <div key={idx}>
              {link.children ? (
                <div>
                  <button
                    onClick={() => toggleSection(link.label.toLowerCase())}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      "text-muted-foreground",
                    )}
                  >
                    {link.icon}
                    {open && (
                      <>
                        <span className="flex-1 text-left">{link.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedSections.includes(link.label.toLowerCase()) && "rotate-180",
                          )}
                        />
                      </>
                    )}
                  </button>
                  {open && expandedSections.includes(link.label.toLowerCase()) && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-border pl-3">
                      {link.children.map((child, childIdx) => (
                        <button
                          key={childIdx}
                          onClick={child.onClick}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                            activeSection === child.label.toLowerCase().replace(" ", "-")
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground",
                          )}
                        >
                          {child.icon}
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={link.onClick}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    activeSection === link.label.toLowerCase().replace(" ", "-")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {link.icon}
                  {open && <span>{link.label}</span>}
                </button>
              )}
            </div>
          ))}
        </nav>

        {/* Toggle Button */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setOpen(!open)}
            className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronDown className={cn("h-5 w-5 transition-transform", open && "rotate-90")} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">
              {activeSection
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <Settings className="h-5 w-5" />
            </button>
            <button className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-primary" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">{renderActiveSection()}</div>
      </main>
    </div>
  )
}
