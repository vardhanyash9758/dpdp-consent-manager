import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'
import { CreateVendorRequest } from '@/lib/types/vendor'

// GET /api/vendors - List all vendors
export async function GET() {
  try {
    const vendors = await database.getAllVendors()
    const stats = await database.getVendorStats()
    
    return NextResponse.json({
      success: true,
      data: vendors,
      stats
    })
  } catch (error) {
    console.error('Failed to fetch vendors:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vendors' },
      { status: 500 }
    )
  }
}

// POST /api/vendors - Create new vendor
export async function POST(request: NextRequest) {
  try {
    const body: CreateVendorRequest = await request.json()
    
    // Validation
    if (!body.vendor_name || !body.category || !body.contact_name || !body.contact_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const vendor = await database.createVendor({
      vendor_name: body.vendor_name,
      category: body.category,
      contact_name: body.contact_name,
      contact_email: body.contact_email,
      notes: body.notes,
      allowed_purposes: [],
      allowed_data_types: [],
      is_active: true
    })
    
    return NextResponse.json({
      success: true,
      data: vendor
    })
  } catch (error) {
    console.error('Failed to create vendor:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create vendor' },
      { status: 500 }
    )
  }
}