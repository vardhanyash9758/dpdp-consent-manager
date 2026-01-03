import { NextResponse } from 'next/server'
import { db } from '@/lib/database/repository'

export async function GET() {
  try {
    // Test database connectivity
    const { templates } = await db.getTemplates({ limit: 1 })
    
    return NextResponse.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'connected',
        api: 'operational'
      }
    })
  } catch (error) {
    console.error('[Health Check] Error:', error)
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: 'error',
        api: 'degraded'
      },
      error: 'Database connectivity issue'
    }, { status: 503 })
  }
}