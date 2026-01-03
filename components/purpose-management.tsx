"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  FileCheck,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Shield,
  BarChart3,
  Target,
  Users,
  Cookie,
  CheckCircle,
  XCircle,
  Calendar,
  Activity,
  MoreHorizontal
} from "lucide-react"

export interface ConsentPurpose {
  id: string
  name: string
  description: string
  required: boolean
  category: 'essential' | 'analytics' | 'marketing' | 'personalization' | 'other'
  dataFields: string[]
  thirdPartySources: string[]
  platforms: string[]
  validityMonths: number
  createdAt: Date
  updatedAt: Date
  usageCount?: number
  isActive: boolean
}
const PURPOSE_CATEGORIES = [
  { value: 'essential', label: 'Essential', icon: Shield },
  { value: 'analytics', label: 'Analytics', icon: BarChart3 },
  { value: 'marketing', label: 'Marketing', icon: Target },
  { value: 'personalization', label: 'Personalization', icon: Users },
  { value: 'other', label: 'Other', icon: Cookie }
] as const

const DATA_FIELDS = [
  'Name', 'Email', 'Phone', 'Address', 'DOB', 'Location', 'Device Info', 'IP Address', 'Cookies', 'Usage Data'
]

const PLATFORMS = ['Web', 'Mobile', 'Tablet', 'Desktop App', 'API']

export function PurposeManagement() {
  const [purposes, setPurposes] = useState<ConsentPurpose[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedPurpose, setSelectedPurpose] = useState<ConsentPurpose | null>(null)
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [newPurpose, setNewPurpose] = useState({
    name: "",
    description: "",
    required: false,
    category: "other" as const,
    dataFields: [] as string[],
    thirdPartySources: [] as string[],
    platforms: [] as string[],
    validityMonths: 12,
    isActive: true
  })

  useEffect(() => {
    loadPurposes()
  }, [])

  const loadPurposes = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/purposes')
      if (response.ok) {
        const result = await response.json()
        setPurposes(result.data || [])
      }
    } catch (error) {
      console.error('Failed to load purposes:', error)
    } finally {
      setLoading(false)
    }
  }
  const createPurpose = async () => {
    try {
      setCreating(true)
      const response = await fetch('/api/purposes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newPurpose,
          validityDays: newPurpose.validityMonths * 30 // Convert months to days for backend
        })
      })

      if (response.ok) {
        const result = await response.json()
        setPurposes([result.data, ...purposes])
        setShowCreateDialog(false)
        setNewPurpose({
          name: "",
          description: "",
          required: false,
          category: "other",
          dataFields: [],
          thirdPartySources: [],
          platforms: [],
          validityMonths: 12,
          isActive: true
        })
      } else {
        const error = await response.json()
        alert(`Failed to create purpose: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to create purpose:', error)
      alert('Failed to create purpose')
    } finally {
      setCreating(false)
    }
  }

  const updatePurpose = async () => {
    if (!selectedPurpose) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/purposes/${selectedPurpose.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selectedPurpose,
          validityDays: selectedPurpose.validityMonths * 30 // Convert months to days for backend
        })
      })

      if (response.ok) {
        const result = await response.json()
        setPurposes(purposes.map(p => p.id === selectedPurpose.id ? result.data : p))
        setShowEditDialog(false)
        setSelectedPurpose(null)
      } else {
        const error = await response.json()
        alert(`Failed to update purpose: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to update purpose:', error)
      alert('Failed to update purpose')
    } finally {
      setUpdating(false)
    }
  }
  const deletePurpose = async (purposeId: string) => {
    try {
      const response = await fetch(`/api/purposes/${purposeId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setPurposes(purposes.filter(p => p.id !== purposeId))
      } else {
        const error = await response.json()
        alert(`Failed to delete purpose: ${error.error}`)
      }
    } catch (error) {
      console.error('Failed to delete purpose:', error)
      alert('Failed to delete purpose')
    }
  }

  const filteredPurposes = purposes.filter(purpose => {
    const matchesSearch = purpose.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purpose.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || purpose.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: purposes.length,
    active: purposes.filter(p => p.isActive).length,
    required: purposes.filter(p => p.required).length,
    categories: PURPOSE_CATEGORIES.length
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Purpose Management</h1>
        <p className="text-muted-foreground">
          Define and manage consent purposes for your DPDP compliance templates.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Total Purposes</p>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Active</p>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Required</p>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.required}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium">Categories</p>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{stats.categories}</div>
          </CardContent>
        </Card>
      </div>
      {/* Purpose Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Purposes</CardTitle>
              <CardDescription>Manage consent purposes for your templates</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={loadPurposes} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <ButtonShine>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Purpose
                  </ButtonShine>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Purpose</DialogTitle>
                    <DialogDescription>Add a new consent purpose for use in templates</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="purpose-name">Purpose Name</Label>
                        <Input
                          id="purpose-name"
                          value={newPurpose.name}
                          onChange={(e) => setNewPurpose({ ...newPurpose, name: e.target.value })}
                          placeholder="e.g., Marketing Communications"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select 
                          value={newPurpose.category} 
                          onValueChange={(value: any) => setNewPurpose({ ...newPurpose, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PURPOSE_CATEGORIES.map(cat => {
                              const Icon = cat.icon
                              return (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <div className="flex items-center gap-2.5">
                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{cat.label}</span>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newPurpose.description}
                        onChange={(e) => setNewPurpose({ ...newPurpose, description: e.target.value })}
                        placeholder="Describe what this purpose is used for and what data it processes"
                        rows={3}
                      />
                    </div>
                    {/* Data Fields */}
                    <div className="space-y-3">
                      <Label>Data Fields</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {DATA_FIELDS.map((field) => (
                          <div key={field} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`field-${field}`}
                              checked={newPurpose.dataFields.includes(field)}
                              onCheckedChange={(checked) => {
                                setNewPurpose({
                                  ...newPurpose,
                                  dataFields: checked
                                    ? [...newPurpose.dataFields, field]
                                    : newPurpose.dataFields.filter((f) => f !== field),
                                })
                              }}
                            />
                            <Label htmlFor={`field-${field}`} className="text-sm font-normal cursor-pointer">
                              {field}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Third Party Sources */}
                    <div className="space-y-2">
                      <Label htmlFor="third-party">Third Party Sources (comma separated)</Label>
                      <Input
                        id="third-party"
                        placeholder="Google Analytics, Facebook Pixel, etc."
                        value={newPurpose.thirdPartySources.join(", ")}
                        onChange={(e) =>
                          setNewPurpose({
                            ...newPurpose,
                            thirdPartySources: e.target.value.split(",").map((s) => s.trim()).filter(s => s),
                          })
                        }
                      />
                    </div>

                    {/* Platforms */}
                    <div className="space-y-3">
                      <Label>Platforms</Label>
                      <div className="flex flex-wrap gap-3">
                        {PLATFORMS.map((platform) => (
                          <div key={platform} className="flex items-center space-x-2.5">
                            <Checkbox
                              id={`platform-${platform}`}
                              checked={newPurpose.platforms.includes(platform)}
                              onCheckedChange={(checked) => {
                                setNewPurpose({
                                  ...newPurpose,
                                  platforms: checked
                                    ? [...newPurpose.platforms, platform]
                                    : newPurpose.platforms.filter((p) => p !== platform),
                                })
                              }}
                            />
                            <Label htmlFor={`platform-${platform}`} className="text-sm font-normal cursor-pointer">
                              {platform}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Validity */}
                    <div className="space-y-2">
                      <Label htmlFor="validity">Validity (months)</Label>
                      <Input
                        id="validity"
                        type="number"
                        value={newPurpose.validityMonths}
                        onChange={(e) =>
                          setNewPurpose({ ...newPurpose, validityMonths: parseInt(e.target.value) || 12 })
                        }
                        placeholder="12"
                        min="1"
                        max="60"
                      />
                    </div>
                    {/* Settings */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-4 w-full">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Required Purpose</Label>
                            <p className="text-xs text-muted-foreground">Users cannot opt-out of required purposes</p>
                          </div>
                          <Switch
                            checked={newPurpose.required}
                            onCheckedChange={(checked) => setNewPurpose({ ...newPurpose, required: checked })}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Active Status</Label>
                            <p className="text-xs text-muted-foreground">Only active purposes appear in templates</p>
                          </div>
                          <Switch
                            checked={newPurpose.isActive}
                            onCheckedChange={(checked) => setNewPurpose({ ...newPurpose, isActive: checked })}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <ButtonShine 
                        onClick={createPurpose} 
                        disabled={creating || !newPurpose.name || !newPurpose.description}
                        className="flex-1"
                      >
                        {creating ? 'Creating...' : 'Create Purpose'}
                      </ButtonShine>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search purposes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PURPOSE_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Purposes Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Loading purposes...</p>
              </div>
            </div>
          ) : filteredPurposes.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FileCheck className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-1">
                <h3 className="font-semibold">No purposes found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm || categoryFilter !== "all" 
                    ? "Try adjusting your search or filter criteria" 
                    : "Create your first purpose to get started"
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Purpose Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Data Fields</TableHead>
                    <TableHead>Platforms</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurposes.map((purpose) => {
                    const categoryInfo = PURPOSE_CATEGORIES.find(c => c.value === purpose.category)
                    const Icon = categoryInfo?.icon || Cookie
                    
                    return (
                      <TableRow key={purpose.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{purpose.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Created {new Date(purpose.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal">
                            <Icon className="h-3 w-3 mr-1.5" />
                            {categoryInfo?.label || 'Other'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm truncate" title={purpose.description}>
                              {purpose.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {purpose.dataFields && purpose.dataFields.length > 0 ? (
                              <>
                                {purpose.dataFields.slice(0, 2).map((field) => (
                                  <Badge key={field} variant="secondary" className="text-xs font-normal px-2 py-0.5">
                                    {field}
                                  </Badge>
                                ))}
                                {purpose.dataFields.length > 2 && (
                                  <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5 bg-muted/50">
                                    +{purpose.dataFields.length - 2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">None</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {purpose.platforms && purpose.platforms.length > 0 ? (
                              <>
                                {purpose.platforms.slice(0, 2).map((platform) => (
                                  <Badge key={platform} variant="secondary" className="text-xs font-normal px-2 py-0.5">
                                    {platform}
                                  </Badge>
                                ))}
                                {purpose.platforms.length > 2 && (
                                  <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5 bg-muted/50">
                                    +{purpose.platforms.length - 2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground">All</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {purpose.validityMonths || Math.ceil((purpose as any).validityDays / 30 || 12)} months
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {purpose.isActive ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-normal">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="font-normal">
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-400 mr-1.5" />
                                Inactive
                              </Badge>
                            )}
                            {purpose.required && (
                              <Badge variant="outline" className="text-xs font-normal border-red-200 text-red-700 bg-red-50">
                                Required
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {purpose.usageCount || 0} templates
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setSelectedPurpose({
                                  ...purpose,
                                  validityMonths: purpose.validityMonths || Math.ceil((purpose as any).validityDays / 30 || 12)
                                })
                                setShowEditDialog(true)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Purpose</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{purpose.name}"? This action cannot be undone and may affect existing templates.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => deletePurpose(purpose.id)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Delete Purpose
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Edit Purpose Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Purpose</DialogTitle>
            <DialogDescription>Update the purpose details</DialogDescription>
          </DialogHeader>
          {selectedPurpose && (
            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-purpose-name">Purpose Name</Label>
                  <Input
                    id="edit-purpose-name"
                    value={selectedPurpose.name}
                    onChange={(e) => setSelectedPurpose({ ...selectedPurpose, name: e.target.value })}
                    placeholder="Purpose name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select 
                    value={selectedPurpose.category} 
                    onValueChange={(value: any) => setSelectedPurpose({ ...selectedPurpose, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PURPOSE_CATEGORIES.map(cat => {
                        const Icon = cat.icon
                        return (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {cat.label}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={selectedPurpose.description}
                  onChange={(e) => setSelectedPurpose({ ...selectedPurpose, description: e.target.value })}
                  placeholder="Describe what this purpose is used for and what data it processes"
                  rows={3}
                />
              </div>

              {/* Data Fields */}
              <div className="space-y-3">
                <Label>Data Fields</Label>
                <div className="grid grid-cols-2 gap-2">
                  {DATA_FIELDS.map((field) => (
                    <div key={field} className="flex items-center space-x-2.5">
                      <Checkbox
                        id={`edit-field-${field}`}
                        checked={selectedPurpose.dataFields?.includes(field) || false}
                        onCheckedChange={(checked) => {
                          const currentFields = selectedPurpose.dataFields || []
                          setSelectedPurpose({
                            ...selectedPurpose,
                            dataFields: checked
                              ? [...currentFields, field]
                              : currentFields.filter((f) => f !== field),
                          })
                        }}
                      />
                      <Label htmlFor={`edit-field-${field}`} className="text-sm font-normal cursor-pointer">
                        {field}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Third Party Sources */}
              <div className="space-y-2">
                <Label htmlFor="edit-third-party">Third Party Sources (comma separated)</Label>
                <Input
                  id="edit-third-party"
                  placeholder="Google Analytics, Facebook Pixel, etc."
                  value={selectedPurpose.thirdPartySources?.join(", ") || ""}
                  onChange={(e) =>
                    setSelectedPurpose({
                      ...selectedPurpose,
                      thirdPartySources: e.target.value.split(",").map((s) => s.trim()).filter(s => s),
                    })
                  }
                />
              </div>

              {/* Platforms */}
              <div className="space-y-3">
                <Label>Platforms</Label>
                <div className="flex flex-wrap gap-3">
                  {PLATFORMS.map((platform) => (
                    <div key={platform} className="flex items-center space-x-2.5">
                      <Checkbox
                        id={`edit-platform-${platform}`}
                        checked={selectedPurpose.platforms?.includes(platform) || false}
                        onCheckedChange={(checked) => {
                          const currentPlatforms = selectedPurpose.platforms || []
                          setSelectedPurpose({
                            ...selectedPurpose,
                            platforms: checked
                              ? [...currentPlatforms, platform]
                              : currentPlatforms.filter((p) => p !== platform),
                          })
                        }}
                      />
                      <Label htmlFor={`edit-platform-${platform}`} className="text-sm font-normal cursor-pointer">
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Validity */}
              <div className="space-y-2">
                <Label htmlFor="edit-validity">Validity (months)</Label>
                <Input
                  id="edit-validity"
                  type="number"
                  value={selectedPurpose.validityMonths}
                  onChange={(e) =>
                    setSelectedPurpose({ ...selectedPurpose, validityMonths: parseInt(e.target.value) || 12 })
                  }
                  placeholder="12"
                  min="1"
                  max="60"
                />
              </div>

              {/* Settings */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Required Purpose</Label>
                      <p className="text-xs text-muted-foreground">Users cannot opt-out of required purposes</p>
                    </div>
                    <Switch
                      checked={selectedPurpose.required}
                      onCheckedChange={(checked) => setSelectedPurpose({ ...selectedPurpose, required: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-xs text-muted-foreground">Only active purposes appear in templates</p>
                    </div>
                    <Switch
                      checked={selectedPurpose.isActive}
                      onCheckedChange={(checked) => setSelectedPurpose({ ...selectedPurpose, isActive: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <ButtonShine 
                  onClick={updatePurpose} 
                  disabled={updating || !selectedPurpose.name || !selectedPurpose.description}
                  className="flex-1"
                >
                  {updating ? 'Updating...' : 'Update Purpose'}
                </ButtonShine>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}