"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
} from "@/components/ui/alert-dialog"
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  Calendar,
  Clock,
  Shield
} from "lucide-react"
import { Vendor } from "@/lib/types/vendor"

interface DPAUploadFlowProps {
  vendor: Vendor
  onVendorUpdated: (vendor: Vendor) => void
}

type UploadStep = 'select' | 'uploading' | 'uploaded' | 'approval' | 'completed'

export function DPAUploadFlow({ vendor, onVendorUpdated }: DPAUploadFlowProps) {
  const [currentStep, setCurrentStep] = useState<UploadStep>(() => {
    if (vendor.dpa_status === 'APPROVED') return 'completed'
    if (vendor.dpa_file_url) return 'uploaded'
    return 'select'
  })
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [approving, setApproving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [approvalForm, setApprovalForm] = useState({
    dpa_signed_on: new Date().toISOString().split('T')[0],
    dpa_valid_till: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    // Validate file
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    try {
      setUploading(true)
      setCurrentStep('uploading')
      setUploadProgress(0)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const formData = new FormData()
      formData.append('dpa_file', file)

      const response = await fetch(`/api/vendors/${vendor.vendor_id}/upload-dpa`, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.ok) {
        const result = await response.json()
        onVendorUpdated(result.data.vendor)
        setCurrentStep('uploaded')
        
        // Auto-advance to approval step after 1 second
        setTimeout(() => {
          setCurrentStep('approval')
        }, 1000)
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error}`)
        setCurrentStep('select')
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
      setCurrentStep('select')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleApproval = async () => {
    try {
      setApproving(true)
      const response = await fetch(`/api/vendors/${vendor.vendor_id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dpa_signed_on: approvalForm.dpa_signed_on,
          dpa_valid_till: approvalForm.dpa_valid_till,
          dpa_file_url: vendor.dpa_file_url
        })
      })

      if (response.ok) {
        const result = await response.json()
        onVendorUpdated(result.data)
        setCurrentStep('completed')
      } else {
        const error = await response.json()
        alert(`Approval failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Approval failed:', error)
      alert('Approval failed. Please try again.')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendor.vendor_id}/approve`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        onVendorUpdated(result.data)
        alert('DPA rejected successfully')
      }
    } catch (error) {
      console.error('Rejection failed:', error)
      alert('Rejection failed. Please try again.')
    }
  }

  const handleDeleteFile = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendor.vendor_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dpa_file_url: null,
          dpa_status: 'PENDING'
        })
      })

      if (response.ok) {
        const result = await response.json()
        onVendorUpdated(result.data)
        setCurrentStep('select')
        setShowDeleteDialog(false)
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete file. Please try again.')
    }
  }

  const getStepStatus = (step: UploadStep) => {
    const steps: UploadStep[] = ['select', 'uploading', 'uploaded', 'approval', 'completed']
    const currentIndex = steps.indexOf(currentStep)
    const stepIndex = steps.indexOf(step)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            DPA Upload & Approval Process
          </CardTitle>
          <CardDescription>
            Complete the Data Processing Agreement workflow for {vendor.vendor_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            {[
              { step: 'select', label: 'Upload Document', icon: Upload },
              { step: 'uploaded', label: 'Document Review', icon: FileText },
              { step: 'approval', label: 'Legal Approval', icon: CheckCircle },
              { step: 'completed', label: 'Completed', icon: Shield }
            ].map(({ step, label, icon: Icon }, index) => {
              const status = getStepStatus(step as UploadStep)
              return (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    status === 'completed' ? 'bg-green-500 border-green-500 text-white' :
                    status === 'current' ? 'bg-blue-500 border-blue-500 text-white' :
                    'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      status === 'completed' ? 'text-green-600' :
                      status === 'current' ? 'text-blue-600' :
                      'text-gray-400'
                    }`}>
                      {label}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      getStepStatus(['uploaded', 'approval', 'completed'][index] as UploadStep) === 'completed' 
                        ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 'select' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Upload DPA Document</CardTitle>
            <CardDescription>
              Upload the signed Data Processing Agreement (PDF format only, max 10MB)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Drop your DPA file here</h3>
              <p className="text-gray-500 mb-4">or click to browse files</p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <ButtonShine onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose PDF File
              </ButtonShine>
              
              <div className="mt-4 text-xs text-gray-500">
                <p>• PDF files only</p>
                <p>• Maximum file size: 10MB</p>
                <p>• Document must be signed by both parties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'uploading' && (
        <Card>
          <CardHeader>
            <CardTitle>Uploading Document...</CardTitle>
            <CardDescription>Please wait while we upload your DPA document</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={uploadProgress} className="w-full" />
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Uploading... {uploadProgress}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'uploaded' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Document Uploaded Successfully
            </CardTitle>
            <CardDescription>
              Your DPA document has been uploaded and is ready for review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">DPA Document</p>
                  <p className="text-sm text-gray-600">
                    Uploaded {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(vendor.dpa_file_url!, '_blank')}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
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
            </div>
            
            <div className="mt-4 flex gap-2">
              <ButtonShine onClick={() => setCurrentStep('approval')}>
                Proceed to Approval
              </ButtonShine>
              <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <Button 
                  variant="outline" 
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete & Re-upload
                </Button>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete DPA Document</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this DPA document? You'll need to upload a new one.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteFile}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Document
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'approval' && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Legal Approval</CardTitle>
            <CardDescription>
              Review the document and set approval dates for the DPA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Document Preview */}
            <div className="p-4 bg-gray-50 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">DPA Document Ready for Approval</p>
                    <p className="text-sm text-gray-600">
                      {vendor.vendor_name} - Data Processing Agreement
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(vendor.dpa_file_url!, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review Document
                  </Button>
                </div>
              </div>
            </div>

            {/* Approval Form */}
            <div className="grid grid-cols-2 gap-4">
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
            </div>

            {/* Approval Actions */}
            <div className="flex gap-3">
              <ButtonShine 
                onClick={handleApproval} 
                disabled={approving}
                className="flex-1"
              >
                {approving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve DPA
                  </>
                )}
              </ButtonShine>
              <Button 
                variant="outline" 
                onClick={handleReject}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>

            {/* Legal Notice */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Legal Review Required</p>
                  <p className="text-yellow-700 mt-1">
                    Ensure the DPA document has been reviewed by legal counsel and contains all required 
                    DPDP Act compliance clauses before approval.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              DPA Process Completed
            </CardTitle>
            <CardDescription>
              {vendor.vendor_name} is now approved and can access data per configured permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Status Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">DPA Status</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    APPROVED
                  </Badge>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-800">Valid Until</span>
                  </div>
                  <p className="text-blue-700">
                    {vendor.dpa_valid_till ? new Date(vendor.dpa_valid_till).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Document Access */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-6 w-6 text-gray-600" />
                    <div>
                      <p className="font-medium">Approved DPA Document</p>
                      <p className="text-sm text-gray-600">
                        Signed on {vendor.dpa_signed_on ? new Date(vendor.dpa_signed_on).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                        link.download = `${vendor.vendor_name}_DPA_Approved.pdf`
                        link.click()
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Configure vendor data access permissions in Vendor Assessment</li>
                  <li>• Set up purpose and data type limitations</li>
                  <li>• Monitor vendor access logs for compliance</li>
                  <li>• Set calendar reminders for DPA renewal before expiry</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}