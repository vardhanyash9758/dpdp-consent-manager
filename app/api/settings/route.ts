import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/connection'

// GET /api/settings - Get application settings
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Getting application settings...')
    
    const query = 'SELECT * FROM app_settings ORDER BY updated_at DESC LIMIT 1'
    const result = await db.query(query)
    
    let settings = {
      allowPurposeCreationInBanner: true,
      requirePurposeApproval: false,
      defaultPurposeValidity: 12, // months
      enableAdvancedPurposeFields: true
    }
    
    if (result.rows.length > 0) {
      const row = result.rows[0]
      settings = {
        allowPurposeCreationInBanner: row.allow_purpose_creation_in_banner,
        requirePurposeApproval: row.require_purpose_approval,
        defaultPurposeValidity: row.default_purpose_validity,
        enableAdvancedPurposeFields: row.enable_advanced_purpose_fields
      }
    }
    
    console.log('✅ Settings retrieved:', settings)
    
    return NextResponse.json({
      success: true,
      data: settings
    })
    
  } catch (error) {
    console.error('❌ Settings API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch settings'
    }, { status: 500 })
  }
}

// PUT /api/settings - Update application settings
export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Updating application settings...')
    const body = await request.json()
    
    const {
      allowPurposeCreationInBanner,
      requirePurposeApproval,
      defaultPurposeValidity,
      enableAdvancedPurposeFields
    } = body
    
    // Check if settings exist
    const checkQuery = 'SELECT id FROM app_settings LIMIT 1'
    const checkResult = await db.query(checkQuery)
    
    let query: string
    let values: any[]
    
    if (checkResult.rows.length > 0) {
      // Update existing settings
      query = `
        UPDATE app_settings 
        SET 
          allow_purpose_creation_in_banner = $1,
          require_purpose_approval = $2,
          default_purpose_validity = $3,
          enable_advanced_purpose_fields = $4,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *
      `
      values = [
        allowPurposeCreationInBanner,
        requirePurposeApproval,
        defaultPurposeValidity,
        enableAdvancedPurposeFields,
        checkResult.rows[0].id
      ]
    } else {
      // Insert new settings
      query = `
        INSERT INTO app_settings (
          allow_purpose_creation_in_banner,
          require_purpose_approval,
          default_purpose_validity,
          enable_advanced_purpose_fields
        ) VALUES ($1, $2, $3, $4)
        RETURNING *
      `
      values = [
        allowPurposeCreationInBanner,
        requirePurposeApproval,
        defaultPurposeValidity,
        enableAdvancedPurposeFields
      ]
    }
    
    const result = await db.query(query, values)
    const row = result.rows[0]
    
    const updatedSettings = {
      allowPurposeCreationInBanner: row.allow_purpose_creation_in_banner,
      requirePurposeApproval: row.require_purpose_approval,
      defaultPurposeValidity: row.default_purpose_validity,
      enableAdvancedPurposeFields: row.enable_advanced_purpose_fields
    }
    
    console.log('✅ Settings updated:', updatedSettings)
    
    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      data: updatedSettings
    })
    
  } catch (error) {
    console.error('❌ Settings update error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to update settings'
    }, { status: 500 })
  }
}