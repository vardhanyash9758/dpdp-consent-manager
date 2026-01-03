"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "@/hooks/use-translations"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ButtonShine } from "@/components/ui/button-shine"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Volume2, 
  Globe, 
  Bold, 
  Italic, 
  Underline, 
  Plus, 
  X, 
  AlertCircle, 
  Check, 
  Plug, 
  Copy,
  Save,
  Eye,
  Smartphone,
  Monitor,
  Palette,
  Settings,
  FileText,
  Languages,
  Shield
} from "lucide-react"
import { ColorPicker } from "@/components/ui/color-picker"

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "mr", name: "Marathi - मराठी" },
  { code: "ta", name: "Tamil - தமিழ்" },
  { code: "gu", name: "Gujarati - ગુજરાતી" },
  { code: "kn", name: "Kannada - ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam - മലയാളം" },
  { code: "or", name: "Odia - ଓଡ଼ିଆ" },
  { code: "pa", name: "Punjabi - ਪੰਜਾਬੀ" },
  { code: "as", name: "Assamese - অসমীয়া" },
  { code: "mai", name: "Maithili - मैथिली" },
  { code: "bh", name: "Bhojpuri - भোজপুরী" },
  { code: "ks", name: "Kashmiri - कश्मीरी" },
  { code: "ne", name: "Nepali - नेपाली" },
  { code: "sd", name: "Sindhi - سنڌي" },
  { code: "ur", name: "Urdu - اردو" },
  { code: "kok", name: "Konkani - कोंकणी" },
  { code: "mni", name: "Manipuri - মৈতৈলোন্" },
  { code: "sat", name: "Santali - ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "doi", name: "Dogri - डोगरी" },
]

export function NoticeBannerConfig() {
  const [headerText, setHeaderText] = useState("Request for Data Usage Consent")
  const [bodyText, setBodyText] = useState(
    "Your data privacy is important to us. You have the right to decline any optional data collection or usage not required for the basic functioning of our services.",
  )
  const [translatedContent, setTranslatedContent] = useState<Record<string, string>>({})
  const { translate, translateMultiple, isTranslating } = useTranslations()
  const [brandColor, setBrandColor] = useState("#4F46E5")
  const [customButtons, setCustomButtons] = useState<Array<{id: number, text: string, color: string}>>([
    { id: 1, text: "Accept All", color: "#10B981" },
    { id: 2, text: "Reject All", color: "#EF4444" },
    { id: 3, text: "Customize", color: "#6B7280" }
  ])
  const [position, setPosition] = useState("bottom")
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false)
  const [enablePurposeCollection, setEnablePurposeCollection] = useState(false)

  const [audioEnabled, setAudioEnabled] = useState(true)
  const [translationEnabled, setTranslationEnabled] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedTemplate, setSavedTemplate] = useState<any>(null)

  const addCustomButton = () => {
    const newId = Math.max(...customButtons.map((b) => b.id), 0) + 1
    setCustomButtons([...customButtons, { id: newId, text: "New Button", color: "#6b7280" }])
  }

  const removeButton = (id: number) => {
    setCustomButtons(customButtons.filter((btn) => btn.id !== id))
  }

  const updateButtonText = (id: number, text: string) => {
    setCustomButtons(customButtons.map((btn) => (btn.id === id ? { ...btn, text } : btn)))
  }

  const updateButtonColor = (id: number, color: string) => {
    setCustomButtons(customButtons.map((btn) => (btn.id === id ? { ...btn, color } : btn)))
  }

  const playConsentAudio = async () => {
    if (!audioEnabled) return

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `${headerText}. ${bodyText}`,
          language: selectedLanguage,
        }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        audio.play()
      }
    } catch (error) {
      console.error("Error playing audio:", error)
    }
  }

  const translateContent = async (languageCode: string, languageName: string) => {
    if (languageCode === "en") {
      setTranslatedContent({})
      return
    }

    try {
      // Collect all texts that need translation
      const textsToTranslate = [
        headerText,
        bodyText,
        'Accept All',
        'Reject All', 
        'Customize',
        'Name',
        'Email',
        'Phone',
        'Address',
        'DOB',
        ...customButtons.map(b => b.text)
      ].filter(Boolean)

      // Remove duplicates
      const uniqueTexts = [...new Set(textsToTranslate)]

      // Translate all texts
      const translations = await translateMultiple(uniqueTexts, languageCode, languageName)
      setTranslatedContent(translations)
    } catch (error) {
      console.error("Translation error:", error)
    }
  }

  const saveAsTemplate = async () => {
    setSaving(true)
    try {
      // Build translations object
      const translations: Record<string, any> = {}
      if (selectedLanguage !== 'en' && Object.keys(translatedContent).length > 0) {
        translations[selectedLanguage] = {
          title: translatedContent[headerText] || headerText,
          description: translatedContent[bodyText] || bodyText,
          acceptButtonText: translatedContent['Accept All'] || 'Accept All',
          rejectButtonText: translatedContent['Reject All'] || 'Reject All',
          customizeButtonText: translatedContent['Customize'] || 'Customize'
        }
      }

      // Create basic purposes if purpose collection is enabled
      const backendPurposes = enablePurposeCollection ? [
        {
          id: 'essential',
          name: 'Essential Services',
          description: 'Required for basic functionality of our services',
          required: true,
          category: 'essential'
        },
        {
          id: 'analytics',
          name: 'Analytics & Performance',
          description: 'Help us improve our services through usage analytics',
          required: false,
          category: 'analytics'
        }
      ] : []

      // Create template data
      const templateData = {
        name: `${headerText} Template`,
        description: `Template created from Notice Banner configuration`,
        status: 'active',
        bannerConfig: {
          title: headerText,
          description: bodyText,
          acceptButtonText: customButtons.find(b => b.text.toLowerCase().includes('accept'))?.text || 'Accept All',
          rejectButtonText: customButtons.find(b => b.text.toLowerCase().includes('reject'))?.text || 'Reject All',
          customizeButtonText: customButtons.find(b => !b.text.toLowerCase().includes('accept') && !b.text.toLowerCase().includes('reject'))?.text || 'Customize',
          position: position,
          theme: 'light',
          primaryColor: brandColor,
          backgroundColor: '#ffffff',
          textColor: '#374151',
          enablePurposeCollection: enablePurposeCollection
        },
        purposes: backendPurposes,
        translations,
        createdBy: 'notice-banner-config',
        organizationId: 'default'
      }

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(templateData)
      })

      if (response.ok) {
        const result = await response.json()
        setSavedTemplate(result.data)
        alert(`Template saved successfully! Template ID: ${result.data.id}`)
      } else {
        const error = await response.json()
        console.error('Failed to save template:', error)
        alert('Failed to save template: ' + error.message)
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Configuration Panel */}
      <div className="flex flex-col gap-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="button">Button</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <Label>Brand Color</Label>
              </div>
              <ColorPicker value={brandColor} onChange={setBrandColor} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Label htmlFor="header">Header Text</Label>
              </div>
              <Input
                id="header"
                value={headerText}
                onChange={(e) => setHeaderText(e.target.value)}
                placeholder="Enter header text"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body Text</Label>
              <div className="space-y-2">
                <div className="flex gap-1 rounded-md border border-input bg-background p-1">
                  <button className="rounded p-1 hover:bg-accent">
                    <Bold className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1 hover:bg-accent">
                    <Italic className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1 hover:bg-accent">
                    <Underline className="h-4 w-4" />
                  </button>
                </div>
                <Textarea
                  id="body"
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Enter body text"
                  className="min-h-[120px]"
                />
              </div>
            </div>

            {/* Purpose Collection Toggle */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      <Label>Purpose Collection</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enable collection of data usage purposes from users
                    </p>
                  </div>
                  <Switch 
                    checked={enablePurposeCollection} 
                    onCheckedChange={setEnablePurposeCollection} 
                  />
                </div>
                
                {enablePurposeCollection && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-blue-900">Purpose Collection Enabled</h4>
                        <p className="text-xs text-blue-700">
                          Users will be able to consent to specific data usage purposes. 
                          Basic purposes (Essential Services, Analytics) will be included automatically.
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Navigate to purposes section
                            const event = new CustomEvent('navigate-to-section', { detail: 'purposes' })
                            window.dispatchEvent(event)
                          }}
                          className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Purposes
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="button" className="mt-6 space-y-6">
            <Card className="p-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Consent Features</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audio Consent</Label>
                    <p className="text-sm text-muted-foreground">Enable text-to-speech for consent</p>
                  </div>
                  <Switch checked={audioEnabled} onCheckedChange={setAudioEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language Translation</Label>
                    <p className="text-sm text-muted-foreground">Enable multi-language support</p>
                  </div>
                  <Switch checked={translationEnabled} onCheckedChange={setTranslationEnabled} />
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger id="position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Buttons Configuration</Label>
                  <ButtonShine onClick={addCustomButton} size="sm" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Button
                  </ButtonShine>
                </div>
                {customButtons.map((button, index) => (
                  <div key={button.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Button {index + 1}</Label>
                      {customButtons.length > 1 && (
                        <Button
                          onClick={() => removeButton(button.id)}
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Input
                      value={button.text}
                      onChange={(e) => updateButtonText(button.id, e.target.value)}
                      placeholder="Button text"
                    />
                    <ColorPicker value={button.color} onChange={(color) => updateButtonColor(button.id, color)} />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <ButtonShine className="w-full" onClick={saveAsTemplate} disabled={saving}>
          {saving ? (
            <>
              <Settings className="mr-2 h-4 w-4 animate-spin" />
              Saving Template...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </>
          )}
        </ButtonShine>
        
        {/* Enhanced success message with integration options */}
        {savedTemplate && (
          <Card className="border-green-200 dark:border-green-800 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-green-800 dark:text-green-200">
                    Template Created Successfully!
                  </CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">
                    Your consent banner is ready for deployment
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Template Name</p>
                  <p className="text-sm text-green-700 dark:text-green-300">{savedTemplate.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Template ID</p>
                  <p className="text-sm font-mono text-green-700 dark:text-green-300">{savedTemplate.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Status</p>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    {savedTemplate.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">Purpose Collection</p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {enablePurposeCollection ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Navigate to integration section
                    const event = new CustomEvent('navigate-to-section', { detail: 'integration' })
                    window.dispatchEvent(event)
                  }}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Plug className="h-4 w-4 mr-2" />
                  View in Integration
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`/test-sdk-integration.html`, '_blank')}
                  className="border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Test Live
                </Button>
              </div>

              {/* Embed Script */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-green-800 dark:text-green-200">Embed Script</h4>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      const script = `<!-- DPDP Consent Manager SDK -->
<script 
  src="${window.location.origin}/sdk/consent-manager.js"
  data-template-id="${savedTemplate.id}"
  data-user-id="CLIENT_USER_REFERENCE_ID"
  data-platform="web"
  defer>
</script>
<!-- End DPDP Consent Manager -->`
                      navigator.clipboard.writeText(script)
                      alert('Embed script copied to clipboard!')
                    }}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Script
                  </Button>
                </div>
                <div className="relative">
                  <Textarea 
                    value={`<!-- DPDP Consent Manager SDK -->
<script 
  src="${window.location.origin}/sdk/consent-manager.js"
  data-template-id="${savedTemplate.id}"
  data-user-id="CLIENT_USER_REFERENCE_ID"
  data-platform="web"
  defer>
</script>
<!-- End DPDP Consent Manager -->`}
                    readOnly 
                    className="font-mono text-xs bg-white dark:bg-gray-900 border-green-200" 
                    rows={8}
                  />
                </div>
              </div>

              {/* Implementation Guide */}
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Next Steps</h4>
                <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Replace <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">CLIENT_USER_REFERENCE_ID</code> with your user reference</li>
                  <li>Add the script to your website's HTML head section</li>
                  <li>Test the banner using the "Test Live" button above</li>
                  <li>Monitor consent collection in the Analytics section</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Preview Panel */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Preview</h2>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Monitor className="mr-2 h-4 w-4" />
              Web
            </Button>
            <Button variant="ghost" size="sm">
              <Smartphone className="mr-2 h-4 w-4" />
              Mobile
            </Button>
          </div>
        </div>

        <Card className="flex flex-1 items-center justify-center bg-muted/30 p-8">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="space-y-4">
              <h3 className="text-balance text-lg font-semibold leading-tight text-foreground">
                {isTranslating ? "Translating..." : translatedContent[headerText] || headerText}
              </h3>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {isTranslating ? "Translating..." : translatedContent[bodyText] || bodyText}
              </p>

              <div className="flex gap-2">
                {audioEnabled && (
                  <Button variant="outline" size="sm" onClick={playConsentAudio}>
                    <Volume2 className="mr-2 h-4 w-4" />
                    Play Consent Audio
                  </Button>
                )}
                {translationEnabled && (
                  <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Languages className="mr-2 h-4 w-4" />
                        Change Language
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Select Language</DialogTitle>
                        <DialogDescription>Choose from 19 Indian languages</DialogDescription>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                          <Button
                            key={lang.code}
                            variant={selectedLanguage === lang.code ? "default" : "outline"}
                            onClick={() => {
                              setSelectedLanguage(lang.code)
                              translateContent(lang.code, lang.name)
                              setLanguageDialogOpen(false)
                            }}
                            className="justify-start"
                          >
                            {lang.name}
                          </Button>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {enablePurposeCollection && (
                <div className="space-y-3">
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      <Shield className="h-3 w-3" />
                      {translatedContent['Essential Services'] || 'Essential Services'}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">
                        {translatedContent['Essential Services'] || 'Essential Services'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {translatedContent['Required for basic functionality of our services'] || 'Required for basic functionality of our services'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-foreground">
                        {translatedContent['Analytics & Performance'] || 'Analytics & Performance'}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {translatedContent['Help us improve our services through usage analytics'] || 'Help us improve our services through usage analytics'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">Learn more about DPDP Act:</p>
                <Button variant="link" className="h-auto p-0 text-xs">
                  Data Retention & User Rights
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                You can update this preference in your profile settings at any time.
              </p>

              <div className="flex flex-col gap-2 pt-2">
                {customButtons.map((button, index) => (
                  <ButtonShine
                    key={button.id}
                    className="w-full"
                    style={{
                      backgroundColor: button.color,
                      color: button.color === "#ffffff" ? "#000000" : "#ffffff",
                    }}
                    variant={index === 0 ? "default" : "outline"}
                  >
                    {translatedContent[button.text] || button.text}
                  </ButtonShine>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}