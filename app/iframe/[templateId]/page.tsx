"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Shield, Cookie, X, Settings, Globe } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ConsentPurpose {
  id: string
  name: string
  description: string
  required: boolean
  enabled: boolean
}

const LANGUAGES = {
  en: "English",
  hi: "हिंदी",
  es: "Español",
  fr: "Français"
}

const CONSENT_PURPOSES: ConsentPurpose[] = [
  {
    id: "essential",
    name: "Essential Cookies",
    description: "Required for basic website functionality and security",
    required: true,
    enabled: true
  },
  {
    id: "analytics",
    name: "Analytics & Performance",
    description: "Help us understand how visitors interact with our website",
    required: false,
    enabled: false
  },
  {
    id: "marketing",
    name: "Marketing & Advertising",
    description: "Used to deliver personalized advertisements and content",
    required: false,
    enabled: false
  },
  {
    id: "personalization",
    name: "Personalization",
    description: "Remember your preferences and provide customized experience",
    required: false,
    enabled: false
  }
]

export default function ConsentIframePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const templateId = params.templateId as string
  const userId = searchParams.get('userId')
  const platform = searchParams.get('platform') || 'web'
  const initialLanguage = searchParams.get('language') || 'en'
  const templateDataParam = searchParams.get('templateData')
  
  const [language, setLanguage] = useState(initialLanguage)
  const [purposes, setPurposes] = useState<ConsentPurpose[]>(CONSENT_PURPOSES)
  const [showDetails, setShowDetails] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [templateData, setTemplateData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Send message to parent window
  const sendMessage = (type: string, payload: any) => {
    if (window.parent) {
      window.parent.postMessage({
        type,
        payload
      }, '*')
    }
  }

  // Handle consent action
  const handleConsentAction = (status: 'accepted' | 'rejected' | 'updated') => {
    const enabledPurposes = purposes
      .filter(p => p.enabled)
      .map(p => p.id)

    sendMessage('CONSENT_ACTION', {
      status,
      purposes: enabledPurposes,
      timestamp: Date.now(),
      language
    })

    setIsVisible(false)
  }

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
    sendMessage('LANGUAGE_CHANGE', {
      language: newLanguage
    })
  }

  // Handle purpose toggle
  const handlePurposeToggle = (purposeId: string, enabled: boolean) => {
    setPurposes(prev => prev.map(p => 
      p.id === purposeId ? { ...p, enabled } : p
    ))
  }

  // Handle accept all
  const handleAcceptAll = () => {
    setPurposes(prev => prev.map(p => ({ ...p, enabled: true })))
    handleConsentAction('accepted')
  }

  // Handle reject all
  const handleRejectAll = () => {
    setPurposes(prev => prev.map(p => ({ ...p, enabled: p.required })))
    handleConsentAction('rejected')
  }

  // Handle save preferences
  const handleSavePreferences = () => {
    handleConsentAction('updated')
  }

  // Load template data
  useEffect(() => {
    async function loadTemplate() {
      try {
        let data
        
        // Try to get template data from URL parameter first
        if (templateDataParam) {
          try {
            data = JSON.parse(decodeURIComponent(templateDataParam))
          } catch (e) {
            console.warn('Failed to parse template data from URL parameter')
          }
        }
        
        // If no data from URL, fetch from API
        if (!data) {
          const response = await fetch(`/api/public/templates/${templateId}?language=${initialLanguage}&platform=${platform}`)
          if (response.ok) {
            const result = await response.json()
            data = result.data
          }
        }
        
        if (data) {
          setTemplateData(data)
          // Update purposes from template data
          if (data.purposes) {
            setPurposes(data.purposes.map((p: any) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              required: p.required,
              enabled: p.required // Required purposes are enabled by default
            })))
          }
        }
      } catch (error) {
        console.error('Failed to load template data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTemplate()
  }, [templateId, initialLanguage, platform, templateDataParam])

  // Listen for messages from parent
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_LANGUAGE') {
        setLanguage(event.data.payload.language)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading consent preferences...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!isVisible) {
    return null
  }

  // Use template data for display text
  const displayConfig = templateData?.config || {
    title: 'Privacy & Cookie Consent',
    description: 'We use cookies to enhance your experience and analyze our traffic',
    acceptButtonText: 'Accept All',
    rejectButtonText: 'Reject All',
    customizeButtonText: 'Customize',
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#374151'
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <Card 
        className="w-full max-w-2xl shadow-2xl"
        style={{ 
          backgroundColor: displayConfig.backgroundColor,
          color: displayConfig.textColor 
        }}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: displayConfig.primaryColor + '20' }}
              >
                <Shield 
                  className="h-6 w-6" 
                  style={{ color: displayConfig.primaryColor }}
                />
              </div>
              <div>
                <CardTitle className="text-xl">{displayConfig.title}</CardTitle>
                <CardDescription style={{ color: displayConfig.textColor + 'CC' }}>
                  {displayConfig.description}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LANGUAGES).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Actions */}
          {!showDetails && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                By clicking "Accept All", you consent to our use of cookies for analytics, 
                personalization, and marketing purposes. You can customize your preferences 
                or reject non-essential cookies.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={handleAcceptAll}
                  style={{ 
                    backgroundColor: displayConfig.primaryColor,
                    borderColor: displayConfig.primaryColor 
                  }}
                  className="hover:opacity-90"
                >
                  {displayConfig.acceptButtonText}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRejectAll}
                  style={{ 
                    borderColor: displayConfig.primaryColor,
                    color: displayConfig.primaryColor 
                  }}
                >
                  {displayConfig.rejectButtonText}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDetails(true)}
                  className="flex items-center gap-2"
                  style={{ color: displayConfig.textColor }}
                >
                  <Settings className="h-4 w-4" />
                  {displayConfig.customizeButtonText}
                </Button>
              </div>
            </div>
          )}

          {/* Detailed Preferences */}
          {showDetails && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Cookie Preferences</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {purposes.map((purpose) => (
                  <div key={purpose.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Cookie className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{purpose.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {purpose.description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {purpose.required && (
                          <Badge variant="secondary" className="text-xs">
                            Required
                          </Badge>
                        )}
                        <Switch
                          checked={purpose.enabled}
                          onCheckedChange={(enabled) => handlePurposeToggle(purpose.id, enabled)}
                          disabled={purpose.required}
                        />
                      </div>
                    </div>
                    {purpose.id !== purposes[purposes.length - 1].id && (
                      <Separator />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleSavePreferences}
                  style={{ 
                    backgroundColor: displayConfig.primaryColor,
                    borderColor: displayConfig.primaryColor 
                  }}
                  className="hover:opacity-90"
                >
                  Save Preferences
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleAcceptAll}
                  style={{ 
                    borderColor: displayConfig.primaryColor,
                    color: displayConfig.primaryColor 
                  }}
                >
                  {displayConfig.acceptButtonText}
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleRejectAll}
                  style={{ color: displayConfig.textColor }}
                >
                  {displayConfig.rejectButtonText}
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Template ID: {templateId} | User: {userId} | Platform: {platform}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}