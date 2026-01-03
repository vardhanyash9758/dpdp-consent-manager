import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'

// POST /api/vendors/[id]/approve - Approve vendor DPA
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { dpa_signed_on, dpa_valid_till, dpa_file_url } = body
    
    const vendor = await database.updateVendor((await params).id, {
      dpa_status: 'APPROVED',
      dpa_signed_on: dpa_signed_on ? new Date(dpa_signed_on) : new Date(),
      dpa_valid_till: dpa_valid_till ? new Date(dpa_valid_till) : undefined,
      dpa_file_url
    })
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: vendor,
      message: 'Vendor DPA approved successfully'
    })
  } catch (error) {
    console.error('Failed to approve vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to approve vendor' },
      { status: 500 }
    )
  }
}

// POST /api/vendors/[id]/reject - Reject vendor DPA
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const vendor = await database.updateVendor((await params).id, {
      dpa_status: 'REJECTED'
    })
    
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: vendor,
      message: 'Vendor DPA rejected'
    })
  } catch (error) {
    console.error('Failed to reject vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reject vendor' },
      { status: 500 }
    )
  }
}