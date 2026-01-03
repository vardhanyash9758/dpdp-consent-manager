"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  FileCheck,
  Users,
  Lock
} from "lucide-react"

interface AppSettings {
  allowPurposeCreationInBanner: boolean
  requirePurposeApproval: boolean
  defaultPurposeValidity: number
  enableAdvancedPurposeFields: boolean
}

export function SettingsManagement() {
  const [settings, setSettings] = useState<AppSettings>({
    allowPurposeCreationInBanner: true,
    requirePurposeApproval: false,
    defaultPurposeValidity: 12,
    enableAdvancedPurposeFields: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings')
      if (response.ok) {
        const result = await response.json()
        setSettings(result.data)
        setOriginalSettings(result.data)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        const result = await response.json()
        setOriginalSettings(result.data)
        setHasChanges(false)
        alert('Settings saved successfully!')
      } else {
        const error = await response.json()
        alert(`Failed to save settings: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    setHasChanges(JSON.stringify(newSettings) !== JSON.stringify(originalSettings))
  }

  const resetSettings = () => {
    if (originalSettings) {
      setSettings(originalSettings)
      setHasChanges(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Application Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings for purpose management and consent workflows.
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Purpose Management Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              <CardTitle>Purpose Management</CardTitle>
            </div>
            <CardDescription>
              Control how purposes are created and managed in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Allow Purpose Creation in Banner */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Purpose Creation in Banner</Label>
                <p className="text-xs text-muted-foreground">
                  Allow users to create new purposes directly in the banner configuration
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {settings.allowPurposeCreationInBanner ? (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Lock className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                </div>
              </div>
              <Switch
                checked={settings.allowPurposeCreationInBanner}
                onCheckedChange={(checked) => updateSetting('allowPurposeCreationInBanner', checked)}
              />
            </div>

            <Separator />

            {/* Advanced Purpose Fields */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Advanced Purpose Fields</Label>
                <p className="text-xs text-muted-foreground">
                  Show advanced fields like data fields, platforms, and third-party sources
                </p>
              </div>
              <Switch
                checked={settings.enableAdvancedPurposeFields}
                onCheckedChange={(checked) => updateSetting('enableAdvancedPurposeFields', checked)}
              />
            </div>

            <Separator />

            {/* Default Validity */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Default Purpose Validity</Label>
                <p className="text-xs text-muted-foreground">
                  Default validity period for new purposes (in months)
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  value={settings.defaultPurposeValidity}
                  onChange={(e) => updateSetting('defaultPurposeValidity', parseInt(e.target.value) || 12)}
                  className="w-24"
                  min="1"
                  max="60"
                />
                <span className="text-sm text-muted-foreground">months</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Workflow Settings</CardTitle>
            </div>
            <CardDescription>
              Configure approval workflows and user permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Purpose Approval */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Purpose Approval Required</Label>
                <p className="text-xs text-muted-foreground">
                  Require admin approval before new purposes become active
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {settings.requirePurposeApproval ? (
                    <Badge className="bg-orange-50 text-orange-700 border-orange-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Approval Required
                    </Badge>
                  ) : (
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Auto-Approved
                    </Badge>
                  )}
                </div>
              </div>
              <Switch
                checked={settings.requirePurposeApproval}
                onCheckedChange={(checked) => updateSetting('requirePurposeApproval', checked)}
              />
            </div>

            <Separator />

            {/* Info Section */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-blue-900">Security Note</h4>
                  <p className="text-xs text-blue-700">
                    Disabling purpose creation in banner forces users to use the dedicated Purpose Management section, 
                    providing better control and oversight of data collection purposes.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Impact Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Configuration Impact
          </CardTitle>
          <CardDescription>
            How these settings affect the user experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">When Purpose Creation is Disabled:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Users cannot create purposes in banner configuration</li>
                <li>• Only existing purposes can be selected</li>
                <li>• "Create Custom" tab is hidden in purpose dialog</li>
                <li>• Users are directed to Purpose Management section</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-sm">When Approval is Required:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• New purposes start in "pending" status</li>
                <li>• Admin review required before activation</li>
                <li>• Email notifications sent to administrators</li>
                <li>• Purpose appears in approval queue</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
              <Clock className="h-3 w-3 mr-1" />
              Unsaved Changes
            </Badge>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={resetSettings}
            disabled={!hasChanges || saving}
          >
            Reset Changes
          </Button>
          
          <Button 
            variant="outline" 
            onClick={loadSettings}
            disabled={saving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <ButtonShine 
            onClick={saveSettings}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </ButtonShine>
        </div>
      </div>
    </div>
  )
}