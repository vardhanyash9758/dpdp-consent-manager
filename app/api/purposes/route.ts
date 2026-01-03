import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database/connection'

// GET /api/purposes - List all purposes
export async function GET() {
  try {
    console.log('🔄 Starting purposes API...')
    
    // Test connection first
    const testResult = await db.query('SELECT 1 as test')
    console.log('✅ Database connection test:', testResult.rows[0])
    
    // Get purposes directly
    const query = 'SELECT * FROM consent_purposes ORDER BY updated_at DESC'
    console.log('🔄 Executing query:', query)
    const result = await db.query(query)
    console.log('✅ Query successful, rows:', result.rows.length)
    
    // Map the results
    const purposes = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      required: row.required,
      category: row.category,
      isActive: row.is_active,
      usageCount: row.usage_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }))
    
    return NextResponse.json({
      success: true,
      data: purposes
    })
  } catch (error) {
    console.error('❌ Failed to fetch purposes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purposes' },
      { status: 500 }
    )
  }
}

// POST /api/purposes - Create new purpose
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting create purpose API...')
    const body = await request.json()
    
    // Validation
    if (!body.name || !body.description || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, category' },
        { status: 400 }
      )
    }
    
    // Create purpose directly
    const id = `purpose_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const query = `
      INSERT INTO consent_purposes (
        id, name, description, required, category, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    
    const values = [
      id,
      body.name,
      body.description,
      body.required || false,
      body.category,
      body.isActive !== undefined ? body.isActive : true
    ]
    
    console.log('🔄 Executing insert query...')
    const result = await db.query(query, values)
    console.log('✅ Insert successful')
    
    const row = result.rows[0]
    const purpose = {
      id: row.id,
      name: row.name,
      description: row.description,
      required: row.required,
      category: row.category,
      isActive: row.is_active,
      usageCount: row.usage_count,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
    
    return NextResponse.json({
      success: true,
      data: purpose
    })
  } catch (error) {
    console.error('❌ Failed to create purpose:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create purpose' },
      { status: 500 }
    )
  }
}