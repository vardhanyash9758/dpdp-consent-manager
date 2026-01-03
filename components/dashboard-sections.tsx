"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  Plug,
  ShieldAlert,
  Clock,
  Copy,
  Check,
  RefreshCw,
  Search,
  Plus,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  Globe,
  Activity,
  Download,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Calendar,
  Database,
} from "lucide-react"
import { ChartBarSingle } from "@/components/ui/chart-bar-single"
import { VendorOverview } from "@/components/vendor-overview"
import { VendorAssessment } from "@/components/vendor-assessment"
import { DPAManagementDashboard } from "@/components/dpa-management-dashboard"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"

import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SettingsManagement } from "@/components/settings-management"
import { PurposeManagement } from "@/components/purpose-management"



export function DashboardOverview() {
  const [activeFilter, setActiveFilter] = useState("Monthly")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [dashboardData, setDashboardData] = useState<{
    templates: number
    consents: number
    acceptanceRate: number
    activeTemplates: number
    totalUsers: number
    recentActivity: Array<{
      action: string
      user: string
      time: string
      type: string
    }>
    templatePerformance: Array<{
      name: string
      consents: number
      acceptanceRate: number
      status: string
    }>
    loading: boolean
    error: string | null
  }>({
    templates: 0,
    consents: 0,
    acceptanceRate: 0,
    activeTemplates: 0,
    totalUsers: 0,
    recentActivity: [],
    templatePerformance: [],
    loading: true,
    error: null
  })

  // Load dashboard data
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true, error: null }))

      // Load templates
      const templatesResponse = await fetch('/api/templates')
      let templatesData: { data: any[], success: boolean } = { data: [], success: false }
      
      if (templatesResponse.ok) {
        templatesData = await templatesResponse.json()
      }

      // Load consent data from multiple templates
      let totalConsents = 0
      let acceptedConsents = 0
      let uniqueUsers = new Set()
      const templatePerformance = []

      if (templatesData.success && templatesData.data?.length > 0) {
        // Get consent data for each template
        for (const template of templatesData.data as any[]) {
          try {
            const consentResponse = await fetch(
              `/api/blutic-svc/api/v1/public/consent-template/update-user?templateId=${template.id}`
            )
            
            if (consentResponse.ok) {
              const consentData = await consentResponse.json()
              const consents = consentData.data || []
              
              const templateConsents = consents.length
              const templateAccepted = consents.filter((c: any) => c.status === 'accepted').length
              const acceptanceRate = templateConsents > 0 ? (templateAccepted / templateConsents) * 100 : 0
              
              totalConsents += templateConsents
              acceptedConsents += templateAccepted
              
              // Track unique users
              consents.forEach((c: any) => uniqueUsers.add(c.userReferenceId))
              
              // Add to performance data
              templatePerformance.push({
                name: template.name,
                consents: templateConsents,
                acceptanceRate: Math.round(acceptanceRate),
                status: template.status
              })
            }
          } catch (err) {
            console.warn(`Failed to load consent data for template ${template.id}:`, err)
          }
        }
      }

      const overallAcceptanceRate = totalConsents > 0 ? (acceptedConsents / totalConsents) * 100 : 0

      setDashboardData({
        templates: templatesData.data?.length || 0,
        consents: totalConsents,
        acceptanceRate: Math.round(overallAcceptanceRate * 10) / 10, // Round to 1 decimal
        activeTemplates: (templatesData.data as any[])?.filter((t: any) => t.status === 'active').length || 0,
        totalUsers: uniqueUsers.size,
        templatePerformance: templatePerformance.sort((a, b) => b.acceptanceRate - a.acceptanceRate).slice(0, 4),
        recentActivity: [
          { action: "Dashboard Refreshed", user: "System", time: "Just now", type: "system" },
          { action: `${templatesData.data?.length || 0} Templates Loaded`, user: "System", time: "Just now", type: "data" },
          { action: `${totalConsents} Consents Found`, user: "System", time: "Just now", type: "consent" }
        ],
        loading: false,
        error: null
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setDashboardData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to load data'
      }))
    }
  }

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto">
      {/* Clean Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className={`h-2 w-2 rounded-full ${
                  dashboardData.error ? 'bg-red-500' : 
                  dashboardData.loading ? 'bg-yellow-500 animate-pulse' : 
                  'bg-green-500'
                }`}></div>
                <span>{dashboardData.error ? 'Error' : dashboardData.loading ? 'Loading' : 'Live'}</span>
              </div>
              <span>|</span>
              <button 
                className="flex items-center gap-1 hover:underline disabled:opacity-50"
                onClick={loadDashboardData}
                disabled={dashboardData.loading}
              >
                <RefreshCw className={`h-3 w-3 ${dashboardData.loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
          

        </div>

        {/* Clean Filter Section */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Date Range:</span>
              <div className="px-3 py-1 bg-background rounded-md border text-sm">
                Oct 16 - Nov 16
              </div>
            </div>
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Weekly">Weekly</SelectItem>
                <SelectItem value="Monthly">Monthly</SelectItem>
                <SelectItem value="Quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {dashboardData.error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <span className="font-medium">Error loading dashboard data:</span>
              <span className="text-sm">{dashboardData.error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clean Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Templates</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold">
                    {dashboardData.loading ? "..." : dashboardData.templates}
                  </p>
                  <span className="text-sm text-green-600 font-medium">
                    +{dashboardData.activeTemplates} active
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Consents</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold">
                    {dashboardData.loading ? "..." : dashboardData.consents.toLocaleString()}
                  </p>
                  <span className="text-sm text-green-600 font-medium">
                    +12.5%
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Shield className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acceptance Rate</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold">
                    {dashboardData.loading ? "..." : `${dashboardData.acceptanceRate.toFixed(1)}%`}
                  </p>
                  <span className="text-sm text-green-600 font-medium">
                    +2.1%
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <p className="text-3xl font-bold">
                    {dashboardData.loading ? "..." : dashboardData.totalUsers.toLocaleString()}
                  </p>
                  <span className="text-sm text-blue-600 font-medium">
                    {dashboardData.totalUsers > 0 ? 'tracked' : 'no data'}
                  </span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Consent Overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Consent Overview</CardTitle>
              <CardDescription>Monthly consent collection trends</CardDescription>
            </div>
            <Select defaultValue="monthly">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                  <span>Total Consents</span>
                </div>
                <div className="text-muted-foreground">
                  Total: {dashboardData.consents.toLocaleString()}
                </div>
              </div>
              
              {/* Chart Area */}
              <div className="h-[300px] flex items-end justify-between gap-2 p-4 bg-muted/20 rounded-lg">
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full">
                      <div 
                        className="w-full bg-primary rounded"
                        style={{ height: `${Math.random() * 200 + 50}px` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(2024, i).toLocaleDateString('en', { month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Template Performance</CardTitle>
            <CardDescription>Top performing templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {dashboardData.loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse"></div>
                    <div className="h-2 bg-muted rounded animate-pulse"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData.templatePerformance.length > 0 ? (
              dashboardData.templatePerformance.map((template, i) => (
                <div key={i}>
                  <div className="space-y-3 py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-base">{template.name}</span>
                          <Badge 
                            variant={template.status === 'active' ? 'default' : 'secondary'} 
                            className={`text-xs ${
                              template.status === 'active' 
                                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
                                : ''
                            }`}
                          >
                            {template.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {template.consents.toLocaleString()} consents collected
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-xl">{template.acceptanceRate}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${template.acceptanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                  {i < dashboardData.templatePerformance.length - 1 && (
                    <div className="border-b border-muted"></div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No template data available</p>
                <p className="text-xs">Create templates to see performance metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Geographic Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Consent collection by region</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { country: "India", percentage: 45, consents: 1247, flag: "🇮🇳" },
              { country: "United States", percentage: 28, consents: 892, flag: "🇺🇸" },
              { country: "United Kingdom", percentage: 15, consents: 634, flag: "🇬🇧" },
              { country: "Germany", percentage: 8, consents: 321, flag: "🇩🇪" },
              { country: "Others", percentage: 4, consents: 156, flag: "🌍" }
            ].map((region, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{region.flag}</span>
                  <div>
                    <p className="font-medium">{region.country}</p>
                    <p className="text-sm text-muted-foreground">
                      {region.consents.toLocaleString()} consents
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{region.percentage}%</p>
                  <div className="w-16 bg-muted rounded-full h-2 mt-1">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${region.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest consent interactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="h-2 w-2 rounded-full bg-muted animate-pulse"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded animate-pulse"></div>
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                    </div>
                    <div className="h-3 bg-muted rounded animate-pulse w-16"></div>
                  </div>
                ))}
              </div>
            ) : dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className={`h-2 w-2 rounded-full ${
                    activity.type === 'create' ? 'bg-primary' :
                    activity.type === 'consent' ? 'bg-primary' :
                    activity.type === 'data' ? 'bg-primary' :
                    activity.type === 'system' ? 'bg-primary/70' :
                    'bg-primary/50'
                  }`}></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-xs">Activity will appear here as you use the system</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AnalysisSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Detailed consent and compliance metrics</p>
      </div>
      <DashboardOverview />
    </div>
  )
}

export function ConsentLogsSection() {
  const logsData = [
    { userId: "user_1001", action: "Accepted", timestamp: "1 min ago", ip: "192.168.1.1", status: "Valid" },
    { userId: "user_1002", action: "Rejected", timestamp: "2 mins ago", ip: "192.168.1.2", status: "Valid" },
    { userId: "user_1003", action: "Customized", timestamp: "3 mins ago", ip: "192.168.1.3", status: "Valid" },
    { userId: "user_1004", action: "Accepted", timestamp: "4 mins ago", ip: "192.168.1.4", status: "Valid" },
    { userId: "user_1005", action: "Accepted", timestamp: "5 mins ago", ip: "192.168.1.5", status: "Expired" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Consent Logs</CardTitle>
              <CardDescription>Track all consent interactions and user preferences</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <ButtonShine>
                <Download className="mr-2 h-4 w-4" />
                Export Logs
              </ButtonShine>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left text-sm font-medium">User ID</th>
                    <th className="p-4 text-left text-sm font-medium">Action</th>
                    <th className="p-4 text-left text-sm font-medium">Timestamp</th>
                    <th className="p-4 text-left text-sm font-medium">IP Address</th>
                    <th className="p-4 text-left text-sm font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData.map((log, i) => (
                    <tr key={i} className="border-b last:border-0 transition-colors hover:bg-muted/50">
                      <td className="p-4 font-mono text-sm">{log.userId}</td>
                      <td className="p-4">
                        <Badge variant="secondary">{log.action}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {log.timestamp}
                      </td>
                      <td className="p-4 font-mono text-sm">{log.ip}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            log.status === "Valid" ? "default" : log.status === "in-progress" ? "secondary" : "outline"
                          }
                          className={
                            log.status === "Valid"
                              ? "border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400"
                              : "border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-400"
                          }
                        >
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function DSRSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Subject Requests</CardTitle>
              <CardDescription>Manage user data access and deletion requests</CardDescription>
            </div>
            <ButtonShine>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </ButtonShine>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { type: "Access", status: "pending", user: "user_1234" },
              { type: "Deletion", status: "in-progress", user: "user_5678" },
              { type: "Correction", status: "completed", user: "user_9012" },
            ].map((request, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{request.type} Request</p>
                    <Badge
                      variant={
                        request.status === "completed"
                          ? "default"
                          : request.status === "in-progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">User ID: {request.user}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function IntegrationSection() {
  const [copied, setCopied] = useState(false)
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Load templates on component mount
  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const result = await response.json()
        setTemplates(result.data || [])
        if (result.data && result.data.length > 0) {
          setSelectedTemplate(result.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateEmbedScript = (templateId: string) => {
    return `<!-- DPDP Consent Manager SDK -->
<script 
  src="${window.location.origin}/sdk/consent-manager.js"
  data-template-id="${templateId}"
  data-user-id="CLIENT_USER_REFERENCE_ID"
  data-platform="web"
  defer>
</script>
<!-- End DPDP Consent Manager -->`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const embeddedApps = [
    { name: "example.com", status: "active", installs: "1.2k", lastSync: "2 mins ago" },
    { name: "app.mysite.io", status: "active", installs: "856", lastSync: "5 mins ago" },
    { name: "dashboard.company.com", status: "inactive", installs: "432", lastSync: "1 day ago" },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading templates...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Consent Templates</CardTitle>
              <CardDescription>Manage your saved consent banner templates and get embed codes</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadTemplates}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <div className="text-sm text-muted-foreground">
                Create templates in the <strong>Notice Banner</strong> section
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span>Loading templates...</span>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No templates created yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Go to the <strong>Notice Banner</strong> section to create your first consent template
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => {
                  // Trigger navigation to notice-banner section
                  const event = new CustomEvent('navigate-to-section', { detail: 'notice-banner' })
                  window.dispatchEvent(event)
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
                <Button variant="ghost" onClick={() => window.open('/test-complete-flow.html', '_blank')}>
                  <Search className="h-4 w-4 mr-2" />
                  Test Flow
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4">
                {templates.map((template) => (
                  <div 
                    key={template.id} 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">{template.description || 'No description'}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                            {template.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(template.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-muted-foreground">ID: {template.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {template.purposes?.length || 0} purposes
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Embed Script Section */}
      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Embed Script for "{selectedTemplate.name}"</CardTitle>
            <CardDescription>Copy and paste this script into your website to enable consent management</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Textarea 
                value={generateEmbedScript(selectedTemplate.id)} 
                readOnly 
                className="font-mono text-xs" 
                rows={8} 
                style={{ resize: "none" }} 
              />
              <ButtonShine 
                onClick={() => copyToClipboard(generateEmbedScript(selectedTemplate.id))} 
                size="sm" 
                className="absolute right-2 top-2" 
                variant="secondary"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </ButtonShine>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>Note:</strong> Replace{" "}
                <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">CLIENT_USER_REFERENCE_ID</code> with your user reference ID.
                The template ID is already configured.
              </p>
            </div>
            
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Template Configuration:</h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <div>• Title: {selectedTemplate.bannerConfig?.title}</div>
                <div>• Purposes: {selectedTemplate.purposes?.length || 0} configured</div>
                <div>• Status: {selectedTemplate.status}</div>
                <div>• Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Embedded Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Embedded Applications</CardTitle>
          <CardDescription>Applications currently using your consent manager</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-md border">
              <div className="grid grid-cols-4 gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
                <div>Domain</div>
                <div>Status</div>
                <div>Consents</div>
                <div>Last Sync</div>
              </div>
              {embeddedApps.map((app, i) => (
                <div key={i} className="grid grid-cols-4 gap-4 border-b p-4 text-sm last:border-0">
                  <div className="font-medium">{app.name}</div>
                  <div>
                    <Badge variant={app.status === "active" ? "default" : "secondary"}>{app.status}</Badge>
                  </div>
                  <div className="text-muted-foreground">{app.installs}</div>
                  <div className="text-muted-foreground">{app.lastSync}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Third-party Integrations */}
      <Card>
        <CardHeader>
          <CardTitle>Third-party Integrations</CardTitle>
          <CardDescription>Connect with external services and platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "Google Tag Manager", status: "connected", icon: Plug },
              { name: "Segment", status: "connected", icon: Plug },
              { name: "Shopify", status: "available", icon: Plug },
              { name: "WordPress", status: "available", icon: Plug },
            ].map((integration, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <integration.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-sm text-muted-foreground">{integration.status}</p>
                  </div>
                </div>
                <ButtonShine variant={integration.status === "connected" ? "outline" : "default"} size="sm">
                  {integration.status === "connected" ? "Manage" : "Connect"}
                </ButtonShine>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function BreachPoliciesSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Data Breach Policies</CardTitle>
              <CardDescription>Configure automated breach notification policies</CardDescription>
            </div>
            <ButtonShine>
              <Plus className="mr-2 h-4 w-4" />
              Create Policy
            </ButtonShine>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Immediate Notification", severity: "Critical", active: true },
              { name: "72-Hour Reporting", severity: "High", active: true },
              { name: "Weekly Summary", severity: "Low", active: false },
            ].map((policy, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{policy.name}</p>
                    <Badge variant={policy.severity === "Critical" ? "destructive" : "secondary"}>
                      {policy.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Status: {policy.active ? "Active" : "Inactive"}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <ButtonShine variant={policy.active ? "destructive" : "default"} size="sm">
                    {policy.active ? (
                      <>
                        <XCircle className="mr-2 h-4 w-4" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Activate
                      </>
                    )}
                  </ButtonShine>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function SettingsSection() {
  return <SettingsManagement />
}

export function PurposesSection() {
  return <PurposeManagement />
}

export function CookieConsentsSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Cookie Consents</CardTitle>
              <CardDescription>Manage cookie consent configurations</CardDescription>
            </div>
            <ButtonShine>
              <Plus className="mr-2 h-4 w-4" />
              New Configuration
            </ButtonShine>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Essential Cookies", category: "Necessary", enabled: true },
              { name: "Analytics Cookies", category: "Analytics", enabled: true },
              { name: "Marketing Cookies", category: "Marketing", enabled: false },
            ].map((cookie, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium">{cookie.name}</p>
                  <p className="text-sm text-muted-foreground">Category: {cookie.category}</p>
                </div>
                <Badge variant={cookie.enabled ? "default" : "secondary"}>
                  {cookie.enabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfilesSection() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Consent Profiles</CardTitle>
              <CardDescription>Manage consent collection profiles for different scenarios</CardDescription>
            </div>
            <ButtonShine>
              <Plus className="mr-2 h-4 w-4" />
              Create Profile
            </ButtonShine>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Default Profile", domains: 3, active: true },
              { name: "EU Profile", domains: 5, active: true },
              { name: "US Profile", domains: 2, active: false },
            ].map((profile, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <p className="font-medium">{profile.name}</p>
                  <p className="text-sm text-muted-foreground">{profile.domains} domains</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={profile.active ? "default" : "secondary"}>
                    {profile.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function VendorOverviewSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vendor Overview</h2>
        <p className="text-muted-foreground">Manage vendor relationships and DPA compliance</p>
      </div>
      <VendorOverview />
    </div>
  )
}

export function VendorAssessmentSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vendor Assessment</h2>
        <p className="text-muted-foreground">Configure vendor data access permissions and monitor compliance</p>
      </div>
      <VendorAssessment />
    </div>
  )
}

export function DPAManagementSection() {
  return <DPAManagementDashboard />
}
