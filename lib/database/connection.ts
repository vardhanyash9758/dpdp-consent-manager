import { Pool, PoolClient } from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Database connection configuration
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// Create connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Prisma.io hosted databases
  },
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  query_timeout: 30000, // Query timeout
  statement_timeout: 30000, // Statement timeout
})

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

// Database connection wrapper
export class DatabaseConnection {
  private static instance: DatabaseConnection
  private pool: Pool

  private constructor() {
    this.pool = pool
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection()
    }
    return DatabaseConnection.instance
  }

  // Get a client from the pool
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect()
  }

  // Execute a query with automatic client management
  async query(text: string, params?: any[]): Promise<any> {
    const client = await this.getClient()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  // Execute a transaction
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient()
    try {
      await client.query('BEGIN')
      const result = await callback(client)
      await client.query('COMMIT')
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.query('SELECT NOW() as current_time')
      console.log('✅ Database connection successful:', result.rows[0].current_time)
      return true
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      return false
    }
  }

  // Close all connections
  async close(): Promise<void> {
    await this.pool.end()
  }
}

// Export singleton instance
export const db = DatabaseConnection.getInstance()

// Helper function for raw queries
export async function executeQuery(query: string, params?: any[]) {
  return await db.query(query, params)
}

// Helper function for transactions
export async function executeTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  return await db.transaction(callback)
}