import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'

// POST /api/vendors/bulk-actions - Perform bulk actions on vendors
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, vendor_ids } = body
    
    if (!action || !vendor_ids || !Array.isArray(vendor_ids)) {
      return NextResponse.json(
        { success: false, error: 'Missing action or vendor_ids' },
        { status: 400 }
      )
    }

    const results = []
    
    switch (action) {
      case 'approve':
        for (const vendorId of vendor_ids) {
          const vendor = await database.updateVendor(vendorId, {
            dpa_status: 'APPROVED',
            dpa_signed_on: new Date(),
            dpa_valid_till: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
          })
          if (vendor) results.push(vendor)
        }
        break
        
      case 'reject':
        for (const vendorId of vendor_ids) {
          const vendor = await database.updateVendor(vendorId, {
            dpa_status: 'REJECTED'
          })
          if (vendor) results.push(vendor)
        }
        break
        
      case 'activate':
        for (const vendorId of vendor_ids) {
          const vendor = await database.updateVendor(vendorId, {
            is_active: true
          })
          if (vendor) results.push(vendor)
        }
        break
        
      case 'deactivate':
        for (const vendorId of vendor_ids) {
          const vendor = await database.updateVendor(vendorId, {
            is_active: false
          })
          if (vendor) results.push(vendor)
        }
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({
      success: true,
      data: results,
      message: `Bulk ${action} completed for ${results.length} vendors`
    })
  } catch (error) {
    console.error('Failed to perform bulk action:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to perform bulk action' },
      { status: 500 }
    )
  }
}