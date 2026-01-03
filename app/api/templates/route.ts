import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/connection'

// GET /api/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Starting templates API...')
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const organizationId = searchParams.get('organizationId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Validate status if provided
    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status',
        message: 'Status must be active, inactive, or draft'
      }, { status: 400 })
    }
    
    // Build query with filters
    let query = 'SELECT * FROM consent_templates WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1
    
    if (status) {
      query += ` AND status = $${paramIndex++}`
      params.push(status)
    }
    
    if (organizationId) {
      query += ` AND organization_id = $${paramIndex++}`
      params.push(organizationId)
    }
    
    query += ' ORDER BY updated_at DESC'
    
    // Add pagination
    const offset = (page - 1) * limit
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`
    params.push(limit, offset)
    
    console.log('🔄 Executing templates query:', query)
    const result = await db.query(query, params)
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM consent_templates WHERE 1=1'
    const countParams: any[] = []
    let countParamIndex = 1
    
    if (status) {
      countQuery += ` AND status = $${countParamIndex++}`
      countParams.push(status)
    }
    
    if (organizationId) {
      countQuery += ` AND organization_id = $${countParamIndex++}`
      countParams.push(organizationId)
    }
    
    const countResult = await db.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)
    
    // Map results
    const templates = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      bannerConfig: row.banner_config,
      purposes: [], // Will be populated separately if needed
      translations: row.translations || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      organizationId: row.organization_id
    }))
    
    console.log('✅ Templates query successful, rows:', templates.length)
    
    return NextResponse.json({
      success: true,
      data: templates,
      total,
      page,
      limit
    })
    
  } catch (error) {
    console.error('❌ Templates API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch templates'
    }, { status: 500 })
  }
}

// POST /api/templates - Create new template
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting create template API...')
    const body = await request.json()
    
    // Basic validation
    if (!body.name || !body.bannerConfig || !body.createdBy || !body.organizationId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        message: 'name, bannerConfig, createdBy, and organizationId are required'
      }, { status: 400 })
    }
    
    // Create template
    const id = `template_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const query = `
      INSERT INTO consent_templates (
        id, name, description, status, banner_config, 
        translations, created_by, organization_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    
    const values = [
      id,
      body.name,
      body.description || null,
      body.status || 'draft',
      JSON.stringify(body.bannerConfig),
      JSON.stringify(body.translations || {}),
      body.createdBy,
      body.organizationId
    ]
    
    console.log('🔄 Executing template insert...')
    const result = await db.query(query, values)
    const row = result.rows[0]
    
    const template = {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      bannerConfig: row.banner_config,
      purposes: body.purposes || [],
      translations: row.translations || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      organizationId: row.organization_id
    }
    
    console.log('✅ Template created:', template.id)
    
    return NextResponse.json({
      success: true,
      message: 'Template created successfully',
      data: template
    }, { status: 201 })
    
  } catch (error) {
    console.error('❌ Template creation error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to create template'
    }, { status: 500 })
  }
}