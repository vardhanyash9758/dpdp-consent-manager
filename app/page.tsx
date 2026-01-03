"use client"

import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
  VendorOverviewSection,
  VendorAssessmentSection,
  DPAManagementSection,
} from "@/components/dashboard-sections"
import { NoticeBannerConfig } from "@/components/notice-banner-config"
import { PurposeManagement } from "@/components/purpose-management"

export default function Page() {
  const [activeSection, setActiveSection] = useState("dashboard")

  // Listen for navigation events
  useEffect(() => {
    const handleNavigate = (event: any) => {
      setActiveSection(event.detail)
    }
    
    window.addEventListener('navigate-to-section', handleNavigate)
    return () => window.removeEventListener('navigate-to-section', handleNavigate)
  }, [])

  const renderActiveSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />
      case "notice-banner":
        return <NoticeBannerConfig />
      case "purposes":
        return <PurposeManagement />
      case "cookie-consents":
        return <CookieConsentsSection />
      case "profiles":
        return <ProfilesSection />
      case "analysis":
        return <AnalysisSection />
      case "consent-logs":
        return <ConsentLogsSection />
      case "vendor-overview":
        return <VendorOverviewSection />
      case "vendor-assessment":
        return <VendorAssessmentSection />
      case "dpa-management":
        return <DPAManagementSection />
      case "dsr":
        return <DSRSection />
      case "integration":
        return <IntegrationSection />
      case "breach-policies":
        return <BreachPoliciesSection />
      case "settings":
        return <SettingsSection />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar onNavigate={setActiveSection} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">DPDP Consent Manager</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {activeSection
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen">{renderActiveSection()}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
