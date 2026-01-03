"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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
  Users2,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  Database,
  Lock,
  Unlock,
  Activity
} from "lucide-react"
import { Vendor, Purpose, DataType, VendorAccessLog } from "@/lib/types/vendor"

const PURPOSES: { value: Purpose; label: string; description: string }[] = [
  { value: 'user_authentication', label: 'User Authentication', description: 'Login and identity verification' },
  { value: 'kyc_verification', label: 'KYC Verification', description: 'Know Your Customer compliance' },
  { value: 'fraud_detection', label: 'Fraud Detection', description: 'Security and fraud prevention' },
  { value: 'analytics', label: 'Analytics', description: 'Usage analytics and insights' },
  { value: 'communication', label: 'Communication', description: 'SMS, email, and notifications' },
  { value: 'customer_support', label: 'Customer Support', description: 'Help desk and support services' }
]

const DATA_TYPES: { value: DataType; label: string; sensitive: boolean }[] = [
  { value: 'name', label: 'Name', sensitive: false },
  { value: 'email', label: 'Email', sensitive: false },
  { value: 'phone', label: 'Phone', sensitive: false },
  { value: 'address', label: 'Address', sensitive: false },
  { value: 'aadhaar', label: 'Aadhaar', sensitive: true },
  { value: 'pan', label: 'PAN', sensitive: true },
  { value: 'device_data', label: 'Device Data', sensitive: false }
]

export function VendorAssessment() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null)
  const [accessLogs, setAccessLogs] = useState<VendorAccessLog[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    loadVendors()
  }, [])

  useEffect(() => {
    if (selectedVendor) {
      loadVendorDetails(selectedVendor.vendor_id)
    }
  }, [selectedVendor])

  const loadVendors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vendors')
      if (response.ok) {
        const result = await response.json()
        setVendors(result.data || [])
        if (result.data && result.data.length > 0 && !selectedVendor) {
          setSelectedVendor(result.data[0])
        }
      }
    } catch (error) {
      console.error('Failed to load vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVendorDetails = async (vendorId: string) => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}`)
      if (response.ok) {
        const result = await response.json()
        setSelectedVendor(result.data)
        setAccessLogs(result.data.access_logs || [])
      }
    } catch (error) {
      console.error('Failed to load vendor details:', error)
    }
  }

  const updateVendorAccess = async (updates: { allowed_purposes?: Purpose[]; allowed_data_types?: DataType[] }) => {
    if (!selectedVendor) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/vendors/${selectedVendor.vendor_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (response.ok) {
        const result = await response.json()
        setSelectedVendor(result.data)
        // Update the vendor in the list
        setVendors(vendors.map(v => v.vendor_id === selectedVendor.vendor_id ? result.data : v))
      }
    } catch (error) {
      console.error('Failed to update vendor:', error)
    } finally {
      setUpdating(false)
    }
  }

  const togglePurpose = (purpose: Purpose) => {
    if (!selectedVendor) return
    
    const currentPurposes = selectedVendor.allowed_purposes || []
    const newPurposes = currentPurposes.includes(purpose)
      ? currentPurposes.filter(p => p !== purpose)
      : [...currentPurposes, purpose]
    
    updateVendorAccess({ allowed_purposes: newPurposes })
  }

  const toggleDataType = (dataType: DataType) => {
    if (!selectedVendor) return
    
    const currentDataTypes = selectedVendor.allowed_data_types || []
    const newDataTypes = currentDataTypes.includes(dataType)
      ? currentDataTypes.filter(dt => dt !== dataType)
      : [...currentDataTypes, dataType]
    
    updateVendorAccess({ allowed_data_types: newDataTypes })
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-600'
      case 'MEDIUM': return 'text-yellow-600'
      case 'LOW': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getAccessStatusIcon = (granted: boolean) => {
    return granted ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading vendor assessment...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Vendor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users2 className="h-5 w-5" />
            Vendor Assessment
          </CardTitle>
          <CardDescription>Configure vendor data access permissions and monitor compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <Label>Select Vendor:</Label>
            <Select 
              value={selectedVendor?.vendor_id || ""} 
              onValueChange={(value) => {
                const vendor = vendors.find(v => v.vendor_id === value)
                setSelectedVendor(vendor || null)
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose a vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map(vendor => (
                  <SelectItem key={vendor.vendor_id} value={vendor.vendor_id}>
                    <div className="flex items-center gap-2">
                      <span>{vendor.vendor_name}</span>
                      <Badge variant="outline" className="text-xs">
                        {vendor.dpa_status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedVendor && (
        <>
          {/* Vendor Info & Risk Assessment */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Vendor Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Vendor Name</Label>
                  <p className="text-lg font-semibold">{selectedVendor.vendor_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <Badge variant="outline" className="ml-2">{selectedVendor.category}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Contact</Label>
                  <p className="text-sm">{selectedVendor.contact_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedVendor.contact_email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">DPA Status</Label>
                  <div className="mt-1">
                    {selectedVendor.dpa_status === 'APPROVED' ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>
                    ) : selectedVendor.dpa_status === 'PENDING' ? (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200">{selectedVendor.dpa_status}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Risk Level</Label>
                  <p className={`text-2xl font-bold ${getRiskLevelColor(selectedVendor.risk_level)}`}>
                    {selectedVendor.risk_level}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data Access Status</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedVendor.dpa_status === 'APPROVED' ? (
                      <>
                        <Unlock className="h-4 w-4 text-green-600" />
                        <span className="text-green-600 font-medium">Allowed</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 text-red-600" />
                        <span className="text-red-600 font-medium">Blocked</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Active Purposes</Label>
                  <p className="text-lg font-semibold">{selectedVendor.allowed_purposes.length}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data Types</Label>
                  <p className="text-lg font-semibold">{selectedVendor.allowed_data_types.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {accessLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent access attempts</p>
                ) : (
                  <div className="space-y-3">
                    {accessLogs.slice(0, 3).map((log) => (
                      <div key={log.log_id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{log.purpose.replace('_', ' ')}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {getAccessStatusIcon(log.access_granted)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Purpose Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Purpose Mapping</CardTitle>
              <CardDescription>Configure what purposes this vendor can process data for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {PURPOSES.map((purpose) => (
                  <div key={purpose.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={purpose.value}
                      checked={selectedVendor.allowed_purposes.includes(purpose.value)}
                      onCheckedChange={() => togglePurpose(purpose.value)}
                      disabled={updating || selectedVendor.dpa_status !== 'APPROVED'}
                    />
                    <div className="flex-1">
                      <Label htmlFor={purpose.value} className="font-medium cursor-pointer">
                        {purpose.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{purpose.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {selectedVendor.dpa_status !== 'APPROVED' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Vendor must have approved DPA to configure purposes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Access Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Data Access Scope</CardTitle>
              <CardDescription>Control what types of data this vendor can access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {DATA_TYPES.map((dataType) => (
                  <div key={dataType.value} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <Checkbox
                      id={dataType.value}
                      checked={selectedVendor.allowed_data_types.includes(dataType.value)}
                      onCheckedChange={() => toggleDataType(dataType.value)}
                      disabled={updating || selectedVendor.dpa_status !== 'APPROVED'}
                    />
                    <div className="flex-1">
                      <Label htmlFor={dataType.value} className="font-medium cursor-pointer flex items-center gap-2">
                        {dataType.label}
                        {dataType.sensitive && (
                          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Sensitive</Badge>
                        )}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
              {selectedVendor.dpa_status !== 'APPROVED' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Vendor must have approved DPA to configure data access
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Access Audit Log */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Access Audit Log
              </CardTitle>
              <CardDescription>Complete history of vendor data access attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Data Types</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <Activity className="h-12 w-12 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">No access logs found</p>
                            <p className="text-sm text-muted-foreground">Access attempts will appear here</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      accessLogs.map((log) => (
                        <TableRow key={log.log_id}>
                          <TableCell className="text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.purpose.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {log.data_types_requested.map(dt => (
                                <Badge key={dt} variant="secondary" className="text-xs">
                                  {dt}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getAccessStatusIcon(log.access_granted)}
                              <span className={log.access_granted ? 'text-green-600' : 'text-red-600'}>
                                {log.access_granted ? 'Granted' : 'Denied'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {log.reason || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}