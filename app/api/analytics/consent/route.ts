import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'

// GET /api/analytics/consent - Get consent analytics and statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const status = searchParams.get('status')
    
    // Get all templates for overview
    const templates = await database.getAllTemplates()
    
    // Get consent data
    let consents = []
    if (templateId) {
      consents = await database.getConsentsByTemplate(templateId)
    } else {
      // Get all consents for all templates
      for (const template of templates) {
        const templateConsents = await database.getConsentsByTemplate(template.id)
        consents.push(...templateConsents)
      }
    }
    
    // Apply date filters
    if (startDate) {
      const start = new Date(startDate)
      consents = consents.filter(c => c.consentTimestamp >= start)
    }
    
    if (endDate) {
      const end = new Date(endDate)
      consents = consents.filter(c => c.consentTimestamp <= end)
    }
    
    // Apply status filter
    if (status && ['accepted', 'rejected', 'partial'].includes(status)) {
      consents = consents.filter(c => c.status === status)
    }
    
    // Calculate statistics
    const totalConsents = consents.length
    const acceptedConsents = consents.filter(c => c.status === 'accepted').length
    const rejectedConsents = consents.filter(c => c.status === 'rejected').length
    const partialConsents = consents.filter(c => c.status === 'partial').length
    
    // Calculate acceptance rate
    const acceptanceRate = totalConsents > 0 ? (acceptedConsents / totalConsents) * 100 : 0
    
    // Group by template
    const templateStats = templates.map(template => {
      const templateConsents = consents.filter(c => c.templateId === template.id)
      const templateAccepted = templateConsents.filter(c => c.status === 'accepted').length
      const templateRejected = templateConsents.filter(c => c.status === 'rejected').length
      const templatePartial = templateConsents.filter(c => c.status === 'partial').length
      
      return {
        templateId: template.id,
        templateName: template.name,
        totalConsents: templateConsents.length,
        accepted: templateAccepted,
        rejected: templateRejected,
        partial: templatePartial,
        acceptanceRate: templateConsents.length > 0 ? (templateAccepted / templateConsents.length) * 100 : 0
      }
    })
    
    // Group by date (last 30 days)
    const dailyStats = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const nextDate = new Date(date)
      nextDate.setDate(nextDate.getDate() + 1)
      
      const dayConsents = consents.filter(c => 
        c.consentTimestamp >= date && c.consentTimestamp < nextDate
      )
      
      dailyStats.push({
        date: date.toISOString().split('T')[0],
        total: dayConsents.length,
        accepted: dayConsents.filter(c => c.status === 'accepted').length,
        rejected: dayConsents.filter(c => c.status === 'rejected').length,
        partial: dayConsents.filter(c => c.status === 'partial').length
      })
    }
    
    // Group by platform
    const platformStats = consents.reduce((acc, consent) => {
      if (!acc[consent.platform]) {
        acc[consent.platform] = { total: 0, accepted: 0, rejected: 0, partial: 0 }
      }
      acc[consent.platform].total++
      acc[consent.platform][consent.status]++
      return acc
    }, {} as Record<string, any>)
    
    // Group by language
    const languageStats = consents.reduce((acc, consent) => {
      if (!acc[consent.language]) {
        acc[consent.language] = { total: 0, accepted: 0, rejected: 0, partial: 0 }
      }
      acc[consent.language].total++
      acc[consent.language][consent.status]++
      return acc
    }, {} as Record<string, any>)
    
    // Most popular purposes
    const purposeStats = consents.reduce((acc, consent) => {
      consent.acceptedPurposes.forEach(purposeId => {
        if (!acc[purposeId]) {
          acc[purposeId] = 0
        }
        acc[purposeId]++
      })
      return acc
    }, {} as Record<string, number>)
    
    const analytics = {
      overview: {
        totalConsents,
        acceptedConsents,
        rejectedConsents,
        partialConsents,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        totalTemplates: templates.length,
        activeTemplates: templates.filter(t => t.status === 'active').length
      },
      templateStats,
      dailyStats,
      platformStats: Object.entries(platformStats).map(([platform, stats]) => ({
        platform,
        ...stats
      })),
      languageStats: Object.entries(languageStats).map(([language, stats]) => ({
        language,
        ...stats
      })),
      purposeStats: Object.entries(purposeStats)
        .map(([purposeId, count]) => ({ purposeId, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 purposes
    }
    
    return NextResponse.json({
      success: true,
      data: analytics,
      filters: {
        templateId,
        startDate,
        endDate,
        status
      }
    })
    
  } catch (error) {
    console.error('[Analytics API] Error fetching consent analytics:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch consent analytics'
      },
      { status: 500 }
    )
  }
}