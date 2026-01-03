"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Code, ExternalLink, Play } from "lucide-react"

export default function DemoPage() {
  const handleTestSDK = () => {
    // Create and inject the SDK script for testing
    const script = document.createElement('script')
    script.src = '/sdk/consent-manager.js'
    script.setAttribute('data-template-id', 'demo-template-123')
    script.setAttribute('data-user-id', 'demo-user-456')
    script.setAttribute('data-platform', 'web')
    script.setAttribute('data-language', 'en')
    script.defer = true
    
    document.head.appendChild(script)
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">DPDP Consent Manager Demo</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Test the script-based embedding system for consent management
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* SDK Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Test SDK Integration
            </CardTitle>
            <CardDescription>
              Click the button below to load the consent banner using the SDK
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <code className="text-sm">
                {`<script 
  src="/sdk/consent-manager.js"
  data-template-id="demo-template-123"
  data-user-id="demo-user-456"
  data-platform="web"
  defer>
</script>`}
              </code>
            </div>
            <Button onClick={handleTestSDK} className="w-full">
              Load Consent Banner
            </Button>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Endpoints
            </CardTitle>
            <CardDescription>
              Available endpoints for consent management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Badge variant="default" className="mb-1">POST</Badge>
                  <p className="text-sm font-mono">/blutic-svc/api/v1/public/consent-template/update-user</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/api/blutic-svc/api/v1/public/consent-template/update-user" target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <Badge variant="secondary" className="mb-1">GET</Badge>
                  <p className="text-sm font-mono">/iframe/[templateId]</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/iframe/demo-template-123?userId=demo-user-456&platform=web" target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>
            How to integrate the DPDP Consent Manager into your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                1
              </div>
              <div>
                <h3 className="font-semibold">Add the Script Tag</h3>
                <p className="text-sm text-muted-foreground">
                  Copy the script tag and paste it into your website's HTML, preferably in the head section.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                2
              </div>
              <div>
                <h3 className="font-semibold">Configure Parameters</h3>
                <p className="text-sm text-muted-foreground">
                  Replace the template ID with your actual consent template ID and user ID with your user reference.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                3
              </div>
              <div>
                <h3 className="font-semibold">Test & Deploy</h3>
                <p className="text-sm text-muted-foreground">
                  The consent banner will automatically appear when users visit your site. All consent data is stored securely.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}