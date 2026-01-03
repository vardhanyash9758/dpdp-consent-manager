import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/repository'

export async function POST(request: NextRequest) {
  try {
    console.log('[Test Flow] Starting complete flow test...')
    
    // Step 1: Create a template
    const template = await db.createTemplate({
      name: 'Complete Flow Test Template',
      description: 'Testing the complete consent flow',
      status: 'active',
      bannerConfig: {
        title: 'Privacy & Cookie Consent',
        description: 'We use cookies to enhance your experience and analyze our traffic.',
        acceptButtonText: 'Accept All',
        rejectButtonText: 'Reject All',
        customizeButtonText: 'Customize',
        position: 'bottom',
        theme: 'light',
        primaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#374151'
      },
      purposes: [
        {
          id: 'essential',
          name: 'Essential Cookies',
          description: 'Required for basic website functionality',
          required: true,
          category: 'essential'
        },
        {
          id: 'analytics',
          name: 'Analytics',
          description: 'Help us understand website usage',
          required: false,
          category: 'analytics'
        }
      ],
      translations: {},
      createdBy: 'test-flow',
      organizationId: 'test'
    })
    
    console.log('[Test Flow] Template created:', template.id)
    
    // Step 2: Verify template retrieval
    const retrievedTemplate = await db.getTemplate(template.id)
    if (!retrievedTemplate) {
      throw new Error('Template retrieval failed')
    }
    
    console.log('[Test Flow] Template retrieved successfully')
    
    // Step 3: Submit consent
    const consentData = {
      templateId: template.id,
      userReferenceId: 'test-user-' + Date.now(),
      status: 'accepted' as const,
      purposes: ['essential', 'analytics'],
      timestamp: Date.now(),
      platform: 'web',
      language: 'en'
    }
    
    const consent = await db.createConsent(consentData, {
      userAgent: 'test-flow',
      ipAddress: '127.0.0.1'
    })
    
    console.log('[Test Flow] Consent created:', consent.id)
    
    // Step 4: Verify consent retrieval
    const retrievedConsent = await db.getConsent(consent.id)
    if (!retrievedConsent) {
      throw new Error('Consent retrieval failed')
    }
    
    console.log('[Test Flow] Consent retrieved successfully')
    
    // Step 5: Get analytics
    const analytics = await db.getConsentAnalytics({
      templateId: template.id
    })
    
    console.log('[Test Flow] Analytics retrieved:', analytics)
    
    return NextResponse.json({
      success: true,
      message: 'Complete flow test successful',
      data: {
        template: {
          id: template.id,
          name: template.name,
          status: template.status
        },
        consent: {
          id: consent.id,
          status: consent.status,
          purposes: consent.acceptedPurposes
        },
        analytics,
        embedScript: `<!-- DPDP Consent Manager SDK -->
<script 
  src="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sdk/consent-manager.js"
  data-template-id="${template.id}"
  data-user-id="CLIENT_USER_REFERENCE_ID"
  data-platform="web"
  defer>
</script>
<!-- End DPDP Consent Manager -->`
      }
    })
    
  } catch (error) {
    console.error('[Test Flow] Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Complete flow test failed'
    }, { status: 500 })
  }
}