import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/connection'

// GET /api/templates/[id] - Get specific template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔍 Debug - Full params object:', params)
    console.log('🔍 Debug - (await params).id:', (await params).id)
    console.log('🔍 Debug - request URL:', request.url)
    console.log('🔄 Getting template:', (await params).id)
    
    const query = 'SELECT * FROM consent_templates WHERE id = $1'
    const result = await db.query(query, [(await params).id])
    
    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
        message: `Template with ID ${(await params).id} does not exist`
      }, { status: 404 })
    }
    
    const row = result.rows[0]
    const template = {
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
    }
    
    console.log('✅ Template found:', template.id)
    
    return NextResponse.json({
      success: true,
      data: template
    })
    
  } catch (error) {
    console.error('❌ Template fetch error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch template'
    }, { status: 500 })
  }
}

// PUT /api/templates/[id] - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 Updating template:', (await params).id)
    const body = await request.json()
    
    // Check if template exists
    const checkQuery = 'SELECT id FROM consent_templates WHERE id = $1'
    const checkResult = await db.query(checkQuery, [(await params).id])
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
        message: `Template with ID ${(await params).id} does not exist`
      }, { status: 404 })
    }
    
    // Build update query
    const setClause = []
    const values = []
    let paramIndex = 1
    
    if (body.name !== undefined) {
      setClause.push(`name = $${paramIndex++}`)
      values.push(body.name)
    }
    if (body.description !== undefined) {
      setClause.push(`description = $${paramIndex++}`)
      values.push(body.description)
    }
    if (body.status !== undefined) {
      setClause.push(`status = $${paramIndex++}`)
      values.push(body.status)
    }
    if (body.bannerConfig !== undefined) {
      setClause.push(`banner_config = $${paramIndex++}`)
      values.push(JSON.stringify(body.bannerConfig))
    }
    if (body.translations !== undefined) {
      setClause.push(`translations = $${paramIndex++}`)
      values.push(JSON.stringify(body.translations))
    }
    
    if (setClause.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No updates provided',
        message: 'No valid fields to update'
      }, { status: 400 })
    }
    
    values.push((await params).id)
    const updateQuery = `
      UPDATE consent_templates 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING *
    `
    
    console.log('🔄 Executing update query...')
    const result = await db.query(updateQuery, values)
    const row = result.rows[0]
    
    const template = {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      bannerConfig: row.banner_config,
      purposes: [],
      translations: row.translations || {},
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      organizationId: row.organization_id
    }
    
    console.log('✅ Template updated:', template.id)
    
    return NextResponse.json({
      success: true,
      message: 'Template updated successfully',
      data: template
    })
    
  } catch (error) {
    console.error('❌ Template update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update template'
    }, { status: 500 })
  }
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    console.log('🔄 Deleting template:', (await params).id)
    
    // Check if template exists
    const checkQuery = 'SELECT id FROM consent_templates WHERE id = $1'
    const checkResult = await db.query(checkQuery, [(await params).id])
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template not found',
        message: `Template with ID ${(await params).id} does not exist`
      }, { status: 404 })
    }
    
    // Check if template has associated consents
    const consentQuery = 'SELECT COUNT(*) FROM consent_records WHERE template_id = $1'
    const consentResult = await db.query(consentQuery, [(await params).id])
    const consentCount = parseInt(consentResult.rows[0].count)
    
    if (consentCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete template',
        message: `Template has ${consentCount} associated consent records. Please archive instead of deleting.`
      }, { status: 409 })
    }
    
    // Delete template
    const deleteQuery = 'DELETE FROM consent_templates WHERE id = $1'
    await db.query(deleteQuery, [(await params).id])
    
    console.log('✅ Template deleted:', (await params).id)
    
    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    })
    
  } catch (error) {
    console.error('❌ Template delete error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to delete template'
    }, { status: 500 })
  }
}