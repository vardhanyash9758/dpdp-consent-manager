"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Building2,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Upload,
  AlertTriangle,
  Shield,
  Users,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Download,
  CheckSquare,
  Square
} from "lucide-react"
import { Vendor, VendorCategory, CreateVendorRequest, VendorStats } from "@/lib/types/vendor"
import { VendorDetail } from "@/components/vendor-detail"

const VENDOR_CATEGORIES: { value: VendorCategory; label: string }[] = [
  { value: 'analytics', label: 'Analytics' },
  { value: 'kyc', label: 'KYC' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'infra', label: 'Infrastructure' },
  { value: 'payments', label: 'Payments' },
  { value: 'other', label: 'Other' }
]

export function VendorOverview() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [stats, setStats] = useState<VendorStats>({
    total_vendors: 0,
    approved_vendors: 0,
    pending_dpa: 0,
    high_risk_vendors: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [creating, setCreating] = useState(false)
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null)
  const [selectedVendors, setSelectedVendors] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [newVendor, setNewVendor] = useState<CreateVendorRequest>({
    vendor_name: "",
    category: "other",
    contact_name: "",
    contact_email: "",
    notes: ""
  })

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

  const createVendor = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVendor)
      })

      if (response.ok) {
        const result = await response.json()
        setVendors([result.data, ...vendors])
        setStats(prev => ({ ...prev, total_vendors: prev.total_vendors + 1, pending_dpa: prev.pending_dpa + 1 }))
        setShowCreateDialog(false)
        setNewVendor({
          vendor_name: "",
          category: "other",
          contact_name: "",
          contact_email: "",
          notes: ""
        })
      }
    } catch (error) {
      console.error('Failed to create vendor:', error)
    } finally {
      setCreating(false)
    }
  }

  const approveVendor = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dpa_signed_on: new Date().toISOString(),
          dpa_valid_till: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        })
      })

      if (response.ok) {
        loadVendors() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to approve vendor:', error)
    }
  }

  const rejectVendor = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/approve`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadVendors() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to reject vendor:', error)
    }
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

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High Risk</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium Risk</Badge>
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low Risk</Badge>
      default:
        return <Badge variant="secondary">{level}</Badge>
    }
  }

  const handleVendorUpdated = (updatedVendor: Vendor) => {
    setVendors(vendors.map(v => v.vendor_id === updatedVendor.vendor_id ? updatedVendor : v))
    loadVendors() // Refresh stats
  }

  const toggleVendorSelection = (vendorId: string) => {
    setSelectedVendors(prev => 
      prev.includes(vendorId) 
        ? prev.filter(id => id !== vendorId)
        : [...prev, vendorId]
    )
  }

  const toggleAllVendors = () => {
    if (selectedVendors.length === filteredVendors.length) {
      setSelectedVendors([])
    } else {
      setSelectedVendors(filteredVendors.map(v => v.vendor_id))
    }
  }

  const performBulkAction = async (action: string) => {
    if (selectedVendors.length === 0) return
    
    try {
      setBulkActionLoading(true)
      const response = await fetch('/api/vendors/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          vendor_ids: selectedVendors
        })
      })

      if (response.ok) {
        loadVendors()
        setSelectedVendors([])
        alert(`Bulk ${action} completed successfully`)
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const exportVendors = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await fetch(`/api/vendors/export?format=${format}&include_logs=true`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `vendors_export_${new Date().toISOString().split('T')[0]}.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export vendors:', error)
    }
  }

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.contact_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter
    const matchesStatus = statusFilter === "all" || vendor.dpa_status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Show vendor detail if one is selected
  if (selectedVendorId) {
    return (
      <VendorDetail 
        vendorId={selectedVendorId} 
        onBack={() => setSelectedVendorId(null)}
        onVendorUpdated={handleVendorUpdated}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-3xl font-bold">{stats.total_vendors}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Vendors</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved_vendors}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending DPA</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending_dpa}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                <p className="text-3xl font-bold text-red-600">{stats.high_risk_vendors}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Vendor Overview
              </CardTitle>
              <CardDescription>Manage vendor relationships and DPA compliance</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={loadVendors} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportVendors('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <ButtonShine>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Vendor
                  </ButtonShine>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Vendor</DialogTitle>
                    <DialogDescription>Add a new vendor to your DPDP compliance system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vendor-name">Vendor Name *</Label>
                        <Input
                          id="vendor-name"
                          value={newVendor.vendor_name}
                          onChange={(e) => setNewVendor({ ...newVendor, vendor_name: e.target.value })}
                          placeholder="Vendor company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={newVendor.category} onValueChange={(value: VendorCategory) => setNewVendor({ ...newVendor, category: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VENDOR_CATEGORIES.map(cat => (
                              <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Contact Name *</Label>
                        <Input
                          id="contact-name"
                          value={newVendor.contact_name}
                          onChange={(e) => setNewVendor({ ...newVendor, contact_name: e.target.value })}
                          placeholder="Primary contact person"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Contact Email *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={newVendor.contact_email}
                          onChange={(e) => setNewVendor({ ...newVendor, contact_email: e.target.value })}
                          placeholder="contact@vendor.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={newVendor.notes}
                        onChange={(e) => setNewVendor({ ...newVendor, notes: e.target.value })}
                        placeholder="Additional notes about this vendor"
                      />
                    </div>
                    <ButtonShine 
                      onClick={createVendor} 
                      disabled={creating || !newVendor.vendor_name || !newVendor.contact_name || !newVendor.contact_email}
                      className="w-full"
                    >
                      {creating ? 'Creating...' : 'Create Vendor'}
                    </ButtonShine>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Bulk Actions */}
          {selectedVendors.length > 0 && (
            <div className="flex items-center gap-4 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium">{selectedVendors.length} vendors selected</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => performBulkAction('approve')}
                  disabled={bulkActionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => performBulkAction('reject')}
                  disabled={bulkActionLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedVendors([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}

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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {VENDOR_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
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

          {/* Vendor Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <button onClick={toggleAllVendors} className="p-1">
                      {selectedVendors.length === filteredVendors.length && filteredVendors.length > 0 ? (
                        <CheckSquare className="h-4 w-4" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </TableHead>
                  <TableHead>Vendor Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>DPA Status</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Data Access</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading vendors...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Building2 className="h-12 w-12 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">No vendors found</p>
                        <p className="text-sm text-muted-foreground">Create your first vendor to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor) => (
                    <TableRow key={vendor.vendor_id}>
                      <TableCell>
                        <button 
                          onClick={() => toggleVendorSelection(vendor.vendor_id)}
                          className="p-1"
                        >
                          {selectedVendors.includes(vendor.vendor_id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{vendor.vendor_name}</p>
                          <p className="text-sm text-muted-foreground">{vendor.contact_name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {VENDOR_CATEGORIES.find(c => c.value === vendor.category)?.label || vendor.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{getDPAStatusBadge(vendor.dpa_status)}</TableCell>
                      <TableCell>{getRiskLevelBadge(vendor.risk_level)}</TableCell>
                      <TableCell>
                        {vendor.dpa_status === 'APPROVED' ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Yes</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-200">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(vendor.updated_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedVendorId(vendor.vendor_id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          {vendor.dpa_status === 'PENDING' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => approveVendor(vendor.vendor_id)}
                                className="text-green-600 border-green-200 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => rejectVendor(vendor.vendor_id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <Upload className="h-4 w-4 mr-1" />
                            DPA
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}