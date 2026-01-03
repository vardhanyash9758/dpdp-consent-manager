import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'
import { initializeDatabase } from '@/lib/database/init'

// GET /api/purposes/[id] - Get specific purpose
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    const purpose = await database.getPurpose((await params).id)
    
    if (!purpose) {
      return NextResponse.json(
        { success: false, error: 'Purpose not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: purpose
    })
  } catch (error) {
    console.error('Failed to fetch purpose:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purpose' },
      { status: 500 }
    )
  }
}

// PUT /api/purposes/[id] - Update purpose
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    const body = await request.json()
    
    const purpose = await database.updatePurpose((await params).id, {
      name: body.name,
      description: body.description,
      required: body.required,
      category: body.category,
      isActive: body.isActive
    })
    
    if (!purpose) {
      return NextResponse.json(
        { success: false, error: 'Purpose not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: purpose
    })
  } catch (error) {
    console.error('Failed to update purpose:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update purpose' },
      { status: 500 }
    )
  }
}

// DELETE /api/purposes/[id] - Delete purpose
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    const deleted = await database.deletePurpose((await params).id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Purpose not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Purpose deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete purpose:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete purpose' },
      { status: 500 }
    )
  }
}