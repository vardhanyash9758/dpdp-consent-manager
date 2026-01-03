import { db } from './connection'
import { migrator } from './migrate'

let isInitialized = false

export async function initializeDatabase(): Promise<void> {
  if (isInitialized) {
    return
  }

  try {
    console.log('🔄 Initializing database connection...')
    
    // Test database connection
    const isConnected = await db.testConnection()
    if (!isConnected) {
      throw new Error('Failed to connect to database')
    }

    // Run migrations automatically
    await migrator.runMigrations()
    
    isInitialized = true
    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  initializeDatabase().catch(console.error)
}