"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileText,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Download,
  Eye,
  Upload,
  RefreshCw,
  Search,
  Filter,
  TrendingUp,
  Users
} from "lucide-react"
import { Vendor, VendorStats } from "@/lib/types/vendor"
import { DPAUploadFlow } from "@/components/dpa-upload-flow"

export function DPAManagementDashboard() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stats, setStats] = useState<VendorStats>({
    total_vendors: 0,
    approved_vendors: 0,
    pending_dpa: 0,
    high_risk_vendors: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    loadVendors()
  }, [])

  const loadVendors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vendors')
      if (response.ok) {
        const result = await response.json()
        setVendors(result.data || [])
        setStats(result.stats || stats)
      }
    } catch (error) {
      console.error('Failed to load vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVendorUpdated = (updatedVendor: Vendor) => {
    setVendors(vendors.map(v => v.vendor_id === updatedVendor.vendor_id ? updatedVendor : v))
    loadVendors() // Refresh stats
  }

  const getDPAStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'EXPIRED':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Expired</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getExpiryStatus = (validTill?: Date) => {
    if (!validTill) return null
    
    const now = new Date()
    const expiry = new Date(validTill)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', days: Math.abs(daysUntilExpiry), color: 'text-red-600' }
    } else if (daysUntilExpiry <= 30) {
      return { status: 'expiring', days: daysUntilExpiry, color: 'text-orange-600' }
    } else if (daysUntilExpiry <= 90) {
      return { status: 'warning', days: daysUntilExpiry, color: 'text-yellow-600' }
    }
    return { status: 'valid', days: daysUntilExpiry, color: 'text-green-600' }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || vendor.dpa_status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate DPA-specific stats
  const dpaStats = {
    total_dpas: vendors.length,
    approved_dpas: vendors.filter(v => v.dpa_status === 'APPROVED').length,
    pending_dpas: vendors.filter(v => v.dpa_status === 'PENDING').length,
    expiring_soon: vendors.filter(v => {
      const expiry = getExpiryStatus(v.dpa_valid_till)
      return expiry && (expiry.status === 'expiring' || expiry.status === 'expired')
    }).length,
    with_documents: vendors.filter(v => v.dpa_file_url).length
  }

  // Show DPA Upload Flow if vendor is selected
  if (selectedVendor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setSelectedVendor(null)} variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Back to DPA Dashboard
          </Button>
          <div>
            <h1 className="text-2xl font-bold">DPA Process</h1>
            <p className="text-muted-foreground">{selectedVendor.vendor_name} - Data Processing Agreement</p>
          </div>
        </div>
        <DPAUploadFlow 
          vendor={selectedVendor} 
          onVendorUpdated={(updatedVendor) => {
            handleVendorUpdated(updatedVendor)
            setSelectedVendor(updatedVendor)
          }} 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">DPA Management</h2>
        <p className="text-muted-foreground">Manage Data Processing Agreements and compliance documentation</p>
      </div>

      {/* DPA Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total DPAs</p>
                <p className="text-3xl font-bold">{dpaStats.total_dpas}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-3xl font-bold text-green-600">{dpaStats.approved_dpas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{dpaStats.pending_dpas}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-3xl font-bold text-orange-600">{dpaStats.expiring_soon}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">With Documents</p>
                <p className="text-3xl font-bold text-blue-600">{dpaStats.with_documents}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('PENDING')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Upload className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold">Upload New DPA</h3>
                <p className="text-sm text-muted-foreground">Start DPA process for pending vendors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter('APPROVED')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Review Expiry Dates</h3>
                <p className="text-sm text-muted-foreground">Check DPAs nearing expiration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Export DPA Report</h3>
                <p className="text-sm text-muted-foreground">Generate compliance report</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DPA Management Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                DPA Status Overview
              </CardTitle>
              <CardDescription>Monitor and manage all Data Processing Agreements</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadVendors} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="DPA Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* DPA Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>DPA Status</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Signed Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Expiry Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading DPA data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No DPAs found</p>
                        <p className="text-sm text-muted-foreground">Start by creating vendors and uploading DPAs</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor) => {
                    const expiryStatus = getExpiryStatus(vendor.dpa_valid_till)
                    return (
                      <TableRow key={vendor.vendor_id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{vendor.vendor_name}</p>
                            <p className="text-sm text-muted-foreground">{vendor.category}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getDPAStatusBadge(vendor.dpa_status)}</TableCell>
                        <TableCell>
                          {vendor.dpa_file_url ? (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">Uploaded</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-600">Missing</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {vendor.dpa_signed_on ? new Date(vendor.dpa_signed_on).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {vendor.dpa_valid_till ? new Date(vendor.dpa_valid_till).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {expiryStatus ? (
                            <div className={`text-sm font-medium ${expiryStatus.color}`}>
                              {expiryStatus.status === 'expired' && `Expired ${expiryStatus.days} days ago`}
                              {expiryStatus.status === 'expiring' && `Expires in ${expiryStatus.days} days`}
                              {expiryStatus.status === 'warning' && `${expiryStatus.days} days left`}
                              {expiryStatus.status === 'valid' && 'Valid'}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedVendor(vendor)}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              Manage
                            </Button>
                            {vendor.dpa_file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(vendor.dpa_file_url!, '_blank')}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Expiry Alerts */}
      {dpaStats.expiring_soon > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                  DPA Expiry Alert
                </h3>
                <p className="text-orange-700 dark:text-orange-300 mt-1">
                  {dpaStats.expiring_soon} DPA{dpaStats.expiring_soon > 1 ? 's are' : ' is'} expiring soon or already expired. 
                  Review and renew these agreements to maintain compliance.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                  onClick={() => setStatusFilter('EXPIRED')}
                >
                  View Expiring DPAs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}