import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'

// GET /api/public/templates/[id] - Get template by ID (public endpoint for SDK)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const language = searchParams.get('language') || 'en'
    const platform = searchParams.get('platform') || 'web'
    
    // Get template from database
    const template = await database.getTemplate(resolvedParams.id)
    
    if (!template) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
        message: `Template with ID ${resolvedParams.id} does not exist`
      }, { status: 404 })
    }

    // Check if template is active
    if (template.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Template not available',
        message: 'Template is not active'
      }, { status: 404 })
    }

    // Format template data for SDK consumption
    const templateData = {
      id: template.id,
      name: template.name,
      description: template.description,
      config: {
        title: template.bannerConfig.title,
        description: template.bannerConfig.description,
        acceptButtonText: template.bannerConfig.acceptButtonText,
        rejectButtonText: template.bannerConfig.rejectButtonText,
        customizeButtonText: template.bannerConfig.customizeButtonText,
        position: template.bannerConfig.position,
        theme: template.bannerConfig.theme,
        primaryColor: template.bannerConfig.primaryColor,
        backgroundColor: template.bannerConfig.backgroundColor,
        textColor: template.bannerConfig.textColor
      },
      purposes: template.purposes.map(purpose => ({
        id: purpose.id,
        name: purpose.name,
        description: purpose.description,
        required: purpose.required,
        category: purpose.category
      })),
      translations: template.translations[language] || null,
      language,
      platform,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt
    }

    // Apply translations if available
    if (template.translations[language]) {
      const translation = template.translations[language]
      templateData.config.title = translation.title || templateData.config.title
      templateData.config.description = translation.description || templateData.config.description
      templateData.config.acceptButtonText = translation.acceptButtonText || templateData.config.acceptButtonText
      templateData.config.rejectButtonText = translation.rejectButtonText || templateData.config.rejectButtonText
      templateData.config.customizeButtonText = translation.customizeButtonText || templateData.config.customizeButtonText
      
      // Apply purpose translations
      templateData.purposes = templateData.purposes.map(purpose => ({
        ...purpose,
        name: translation.purposes?.[purpose.id]?.name || purpose.name,
        description: translation.purposes?.[purpose.id]?.description || purpose.description
      }))
    }

    return NextResponse.json({
      success: true,
      data: templateData
    })
    
  } catch (error) {
    console.error('Failed to fetch template:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch template'
    }, { status: 500 })
  }
}