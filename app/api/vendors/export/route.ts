import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'

// GET /api/vendors/export - Export vendor data as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const includeAccessLogs = searchParams.get('include_logs') === 'true'
    
    const vendors = await database.getAllVendors()
    
    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Vendor ID',
        'Vendor Name', 
        'Category',
        'Contact Name',
        'Contact Email',
        'DPA Status',
        'Risk Level',
        'Data Access',
        'Allowed Purposes',
        'Allowed Data Types',
        'DPA Signed On',
        'DPA Valid Till',
        'Created At',
        'Updated At'
      ]
      
      if (includeAccessLogs) {
        headers.push('Recent Access Attempts', 'Last Access Date')
      }
      
      let csvContent = headers.join(',') + '\n'
      
      for (const vendor of vendors) {
        const row = [
          vendor.vendor_id,
          `"${vendor.vendor_name}"`,
          vendor.category,
          `"${vendor.contact_name}"`,
          vendor.contact_email,
          vendor.dpa_status,
          vendor.risk_level,
          vendor.dpa_status === 'APPROVED' ? 'Yes' : 'No',
          `"${vendor.allowed_purposes.join('; ')}"`,
          `"${vendor.allowed_data_types.join('; ')}"`,
          vendor.dpa_signed_on ? new Date(vendor.dpa_signed_on).toISOString().split('T')[0] : '',
          vendor.dpa_valid_till ? new Date(vendor.dpa_valid_till).toISOString().split('T')[0] : '',
          new Date(vendor.created_at).toISOString().split('T')[0],
          new Date(vendor.updated_at).toISOString().split('T')[0]
        ]
        
        if (includeAccessLogs) {
          // Simplified - no access logs for now
          row.push('0', '')
        }
        
        csvContent += row.join(',') + '\n'
      }
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="vendors_export_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    // JSON format
    const exportData = {
      exported_at: new Date().toISOString(),
      total_vendors: vendors.length,
      vendors: vendors.map(vendor => ({
        ...vendor,
        access_logs: includeAccessLogs ? [] : undefined
      }))
    }
    
    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="vendors_export_${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Failed to export vendor data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to export vendor data' },
      { status: 500 }
    )
  }
}