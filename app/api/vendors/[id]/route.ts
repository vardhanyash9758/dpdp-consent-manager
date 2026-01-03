import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'
import { UpdateVendorRequest } from '@/lib/types/vendor'

// GET /api/vendors/[id] - Get vendor by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const vendor = await database.getVendor((await params).id)
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Failed to fetch vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendor' },
      { status: 500 }
    )
  }
}

// PUT /api/vendors/[id] - Update vendor
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body: UpdateVendorRequest = await request.json()
    
    const vendor = await database.updateVendor((await params).id, body)
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Failed to update vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update vendor' },
      { status: 500 }
    )
  }
}

// DELETE /api/vendors/[id] - Delete vendor
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const deleted = await database.deleteVendor((await params).id)
    
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Vendor deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete vendor' },
      { status: 500 }
    )
  }
}