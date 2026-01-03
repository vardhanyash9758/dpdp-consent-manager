import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database/schema'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// POST /api/vendors/[id]/upload-dpa - Upload DPA file
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const formData = await request.formData()
    const file = formData.get('dpa_file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Check if vendor exists
    const vendor = await database.getVendor((await params).id)
    if (!vendor) {
      return NextResponse.json(
        { success: false, error: 'Vendor not found' },
        { status: 404 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'dpa')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedVendorName = vendor.vendor_name.replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `${sanitizedVendorName}_${timestamp}.pdf`
    const filepath = join(uploadsDir, filename)
    const publicUrl = `/uploads/dpa/${filename}`

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update vendor with DPA file URL
    const updatedVendor = await database.updateVendor((await params).id, {
      dpa_file_url: publicUrl,
      updated_at: new Date()
    })

    return NextResponse.json({
      success: true,
      data: {
        vendor: updatedVendor,
        file_url: publicUrl,
        filename: filename
      },
      message: 'DPA file uploaded successfully'
    })
  } catch (error) {
    console.error('Failed to upload DPA file:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload DPA file' },
      { status: 500 }
    )
  }
}