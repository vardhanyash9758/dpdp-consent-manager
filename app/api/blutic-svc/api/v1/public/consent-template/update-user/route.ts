import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/connection'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting consent collection API...')
    const body = await request.json()
    
    // Basic validation
    if (!body.templateId || !body.userReferenceId || !body.status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'templateId, userReferenceId, and status are required'
      }, { status: 400 })
    }
    
    // Verify template exists and is active
    const templateQuery = 'SELECT * FROM consent_templates WHERE id = $1'
    const templateResult = await db.query(templateQuery, [body.templateId])
    
    if (templateResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
        message: `Template ${body.templateId} does not exist`
      }, { status: 404 })
    }
    
    const template = templateResult.rows[0]
    if (template.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: 'Template not active',
        message: 'Cannot collect consent for inactive template'
      }, { status: 400 })
    }

    // Get client metadata for audit trail
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Check if user already has consent record for this template
    const existingQuery = `
      SELECT * FROM consent_records 
      WHERE user_reference_id = $1 AND template_id = $2 
      ORDER BY created_at DESC LIMIT 1
    `
    const existingResult = await db.query(existingQuery, [body.userReferenceId, body.templateId])

    let consentRecord
    
    if (existingResult.rows.length > 0) {
      // Update existing consent
      const existingId = existingResult.rows[0].id
      const updateQuery = `
        UPDATE consent_records 
        SET status = $1, accepted_purposes = $2, platform = $3, language = $4,
            user_agent = $5, ip_address = $6, consent_timestamp = $7, 
            updated_at = CURRENT_TIMESTAMP, version = version + 1
        WHERE id = $8
        RETURNING *
      `
      
      const updateValues = [
        body.status,
        JSON.stringify(body.purposes || []),
        body.platform || 'web',
        body.language || 'en',
        userAgent,
        clientIP,
        new Date(body.timestamp || Date.now()),
        existingId
      ]
      
      console.log('🔄 Updating existing consent record...')
      const updateResult = await db.query(updateQuery, updateValues)
      consentRecord = updateResult.rows[0]
    } else {
      // Create new consent record
      const id = `consent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      
      const insertQuery = `
        INSERT INTO consent_records (
          id, template_id, user_reference_id, status, accepted_purposes,
          platform, language, user_agent, ip_address, consent_timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `
      
      const insertValues = [
        id,
        body.templateId,
        body.userReferenceId,
        body.status,
        JSON.stringify(body.purposes || []),
        body.platform || 'web',
        body.language || 'en',
        userAgent,
        clientIP,
        new Date(body.timestamp || Date.now())
      ]
      
      console.log('🔄 Creating new consent record...')
      const insertResult = await db.query(insertQuery, insertValues)
      consentRecord = insertResult.rows[0]
    }

    // Log for audit (no PII)
    console.log('✅ Consent saved:', {
      id: consentRecord.id,
      templateId: body.templateId,
      status: consentRecord.status,
      purposeCount: (consentRecord.accepted_purposes || []).length,
      platform: consentRecord.platform,
      language: consentRecord.language
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Consent saved successfully',
      data: {
        id: consentRecord.id,
        templateId: consentRecord.template_id,
        userReferenceId: consentRecord.user_reference_id,
        status: consentRecord.status,
        purposes: consentRecord.accepted_purposes || [],
        timestamp: new Date(consentRecord.consent_timestamp).getTime(),
        platform: consentRecord.platform,
        language: consentRecord.language
      }
    })

  } catch (error) {
    console.error('❌ Consent collection error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save consent record'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve consent records (for admin purposes only)
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Getting consent records...')
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')
    const userReferenceId = searchParams.get('userReferenceId')

    // Require at least one filter for privacy
    if (!templateId && !userReferenceId) {
      return NextResponse.json({
        success: false,
        error: 'Filter required',
        message: 'Please provide templateId or userReferenceId parameter'
      }, { status: 400 })
    }

    let query = 'SELECT * FROM consent_records WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (templateId) {
      query += ` AND template_id = $${paramIndex++}`
      params.push(templateId)
    }

    if (userReferenceId) {
      query += ` AND user_reference_id = $${paramIndex++}`
      params.push(userReferenceId)
    }

    query += ' ORDER BY consent_timestamp DESC'

    console.log('🔄 Executing consent query:', query)
    const result = await db.query(query, params)

    const records = result.rows.map((row: any) => ({
      id: row.id,
      templateId: row.template_id,
      userReferenceId: row.user_reference_id,
      status: row.status,
      acceptedPurposes: row.accepted_purposes || [],
      platform: row.platform,
      language: row.language,
      userAgent: row.user_agent,
      ipAddress: row.ip_address,
      consentTimestamp: new Date(row.consent_timestamp),
      expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
      version: row.version,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }))

    console.log('✅ Consent records retrieved:', records.length)

    return NextResponse.json({
      success: true,
      data: records,
      total: records.length
    })

  } catch (error) {
    console.error('❌ Consent retrieval error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve consent records'
    }, { status: 500 })
  }
}