"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Upload,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  User,
  Mail,
  Building2,
  Shield,
  Clock,
  Edit,
  Save,
  X,
  Eye,
  Trash2
} from "lucide-react"
import { Vendor, VendorCategory, VendorAccessLog } from "@/lib/types/vendor"
import { DPAUploadFlow } from "@/components/dpa-upload-flow"

const VENDOR_CATEGORIES: { value: VendorCategory; label: string }[] = [
  { value: 'analytics', label: 'Analytics' },
  { value: 'kyc', label: 'KYC' },
  { value: 'messaging', label: 'Messaging' },
  { value: 'infra', label: 'Infrastructure' },
  { value: 'payments', label: 'Payments' },
  { value: 'other', label: 'Other' }
]

interface VendorDetailProps {
  vendorId: string
  onBack: () => void
  onVendorUpdated?: (vendor: Vendor) => void
}

export function VendorDetail({ vendorId, onBack, onVendorUpdated }: VendorDetailProps) {
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [accessLogs, setAccessLogs] = useState<VendorAccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showDPAFlow, setShowDPAFlow] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editForm, setEditForm] = useState({
    vendor_name: "",
    category: "other" as VendorCategory,
    contact_name: "",
    contact_email: "",
    notes: ""
  })

  const [approvalForm, setApprovalForm] = useState({
    dpa_signed_on: "",
    dpa_valid_till: ""
  })

  useEffect(() => {
    loadVendorDetails()
  }, [vendorId])

  const loadVendorDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/vendors/${vendorId}`)
      if (response.ok) {
        const result = await response.json()
        setVendor(result.data)
        setAccessLogs(result.data.access_logs || [])
        
        // Initialize edit form
        setEditForm({
          vendor_name: result.data.vendor_name,
          category: result.data.category,
          contact_name: result.data.contact_name,
          contact_email: result.data.contact_email,
          notes: result.data.notes || ""
        })

        // Initialize approval form with current dates or defaults
        const signedDate = result.data.dpa_signed_on 
          ? new Date(result.data.dpa_signed_on).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
        
        const validTillDate = result.data.dpa_valid_till
          ? new Date(result.data.dpa_valid_till).toISOString().split('T')[0]
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now

        setApprovalForm({
          dpa_signed_on: signedDate,
          dpa_valid_till: validTillDate
        })
      }
    } catch (error) {
      console.error('Failed to load vendor details:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateVendor = async () => {
    try {
      setUpdating(true)
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const result = await response.json()
        setVendor(result.data)
        setEditing(false)
        onVendorUpdated?.(result.data)
      }
    } catch (error) {
      console.error('Failed to update vendor:', error)
    } finally {
      setUpdating(false)
    }
  }

  const uploadDPAFile = async (file: File) => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('dpa_file', file)

      const response = await fetch(`/api/vendors/${vendorId}/upload-dpa`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const result = await response.json()
        setVendor(result.data.vendor)
        onVendorUpdated?.(result.data.vendor)
        alert('DPA file uploaded successfully!')
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to upload DPA file:', error)
      alert('Failed to upload DPA file')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      uploadDPAFile(file)
    }
  }

  const approveVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dpa_signed_on: approvalForm.dpa_signed_on,
          dpa_valid_till: approvalForm.dpa_valid_till,
          dpa_file_url: vendor?.dpa_file_url
        })
      })

      if (response.ok) {
        const result = await response.json()
        setVendor(result.data)
        setShowApprovalDialog(false)
        onVendorUpdated?.(result.data)
        alert('Vendor DPA approved successfully!')
      }
    } catch (error) {
      console.error('Failed to approve vendor:', error)
    }
  }

  const rejectVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/approve`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        setVendor(result.data)
        onVendorUpdated?.(result.data)
        alert('Vendor DPA rejected')
      }
    } catch (error) {
      console.error('Failed to reject vendor:', error)
    }
  }

  const deleteVendor = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Vendor deleted successfully')
        onBack()
      }
    } catch (error) {
      console.error('Failed to delete vendor:', error)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading vendor details...</span>
        </div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium">Vendor not found</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  // Show DPA Upload Flow if requested
  if (showDPAFlow) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => setShowDPAFlow(false)} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vendor Details
          </Button>
          <div>
            <h1 className="text-2xl font-bold">DPA Management</h1>
            <p className="text-muted-foreground">{vendor.vendor_name} - Data Processing Agreement</p>
          </div>
        </div>
        <DPAUploadFlow 
          vendor={vendor} 
          onVendorUpdated={(updatedVendor) => {
            setVendor(updatedVendor)
            onVendorUpdated?.(updatedVendor)
          }} 
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{vendor.vendor_name}</h1>
            <p className="text-muted-foreground">Vendor Details & Management</p>
          </div>
        </div>
        <div className="flex gap-2">
          {!editing && (
            <Button onClick={() => setEditing(true)} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {vendor.vendor_name}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteVendor} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Vendor Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {editing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-name">Vendor Name</Label>
                    <Input
                      id="vendor-name"
                      value={editForm.vendor_name}
                      onChange={(e) => setEditForm({ ...editForm, vendor_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={editForm.category} onValueChange={(value: VendorCategory) => setEditForm({ ...editForm, category: value })}>
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
                    <Label htmlFor="contact-name">Contact Name</Label>
                    <Input
                      id="contact-name"
                      value={editForm.contact_name}
                      onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      value={editForm.contact_email}
                      onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editForm.notes}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <ButtonShine onClick={updateVendor} disabled={updating}>
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </ButtonShine>
                  <Button onClick={() => setEditing(false)} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Vendor Name</Label>
                    <p className="text-lg font-semibold">{vendor.vendor_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {VENDOR_CATEGORIES.find(c => c.value === vendor.category)?.label || vendor.category}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Risk Level</Label>
                    <div className="mt-1">
                      {getRiskLevelBadge(vendor.risk_level)}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Person</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{vendor.contact_name}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Contact Email</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{vendor.contact_email}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(vendor.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {vendor.notes && (
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                    <p className="mt-1 text-sm">{vendor.notes}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* DPA Status & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              DPA Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Current Status</Label>
              <div className="mt-1">
                {getDPAStatusBadge(vendor.dpa_status)}
              </div>
            </div>

            {vendor.dpa_signed_on && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Signed On</Label>
                <p className="text-sm">{new Date(vendor.dpa_signed_on).toLocaleDateString()}</p>
              </div>
            )}

            {vendor.dpa_valid_till && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Valid Until</Label>
                <p className="text-sm">{new Date(vendor.dpa_valid_till).toLocaleDateString()}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">DPA Document</Label>
              {vendor.dpa_file_url ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-sm">Document uploaded</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(vendor.dpa_file_url!, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = vendor.dpa_file_url!
                      link.download = `${vendor.vendor_name}_DPA.pdf`
                      link.click()
                    }}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No document uploaded</p>
              )}
            </div>

            <div className="space-y-2">
              <ButtonShine
                onClick={() => setShowDPAFlow(true)}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {vendor.dpa_file_url ? 'Manage DPA Process' : 'Start DPA Upload'}
              </ButtonShine>
            </div>

            {vendor.dpa_status === 'PENDING' && (
              <div className="space-y-2">
                <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
                  <DialogTrigger asChild>
                    <ButtonShine className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve DPA
                    </ButtonShine>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Approve DPA</DialogTitle>
                      <DialogDescription>
                        Set the DPA signing and validity dates for {vendor.vendor_name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signed-date">DPA Signed On</Label>
                        <Input
                          id="signed-date"
                          type="date"
                          value={approvalForm.dpa_signed_on}
                          onChange={(e) => setApprovalForm({ ...approvalForm, dpa_signed_on: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="valid-till">Valid Until</Label>
                        <Input
                          id="valid-till"
                          type="date"
                          value={approvalForm.dpa_valid_till}
                          onChange={(e) => setApprovalForm({ ...approvalForm, dpa_valid_till: e.target.value })}
                        />
                      </div>
                      <ButtonShine onClick={approveVendor} className="w-full">
                        Approve DPA
                      </ButtonShine>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={rejectVendor}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject DPA
                </Button>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Data Access</Label>
              <div className="flex items-center gap-2 mt-1">
                {vendor.dpa_status === 'APPROVED' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Allowed</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">Blocked</span>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Access Configuration Summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Allowed Purposes</CardTitle>
            <CardDescription>Data processing purposes approved for this vendor</CardDescription>
          </CardHeader>
          <CardContent>
            {vendor.allowed_purposes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No purposes configured</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {vendor.allowed_purposes.map(purpose => (
                  <Badge key={purpose} variant="outline">
                    {purpose.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Allowed Data Types</CardTitle>
            <CardDescription>Types of data this vendor can access</CardDescription>
          </CardHeader>
          <CardContent>
            {vendor.allowed_data_types.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data types configured</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {vendor.allowed_data_types.map(dataType => (
                  <Badge 
                    key={dataType} 
                    variant="outline"
                    className={dataType === 'aadhaar' || dataType === 'pan' ? 'border-red-200 text-red-700' : ''}
                  >
                    {dataType}
                    {(dataType === 'aadhaar' || dataType === 'pan') && (
                      <AlertTriangle className="h-3 w-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Access Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Access Logs
          </CardTitle>
          <CardDescription>Latest data access attempts by this vendor</CardDescription>
        </CardHeader>
        <CardContent>
          {accessLogs.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
              <p className="text-muted-foreground">No access logs found</p>
              <p className="text-sm text-muted-foreground">Access attempts will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accessLogs.map((log) => (
                <div key={log.log_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{log.purpose.replace('_', ' ')}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {log.data_types_requested.map(dt => (
                        <Badge key={dt} variant="secondary" className="text-xs">
                          {dt}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {log.access_granted ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${log.access_granted ? 'text-green-600' : 'text-red-600'}`}>
                      {log.access_granted ? 'Granted' : 'Denied'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}