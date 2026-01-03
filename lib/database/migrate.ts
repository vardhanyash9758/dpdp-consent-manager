import { readFileSync } from 'fs'
import { join } from 'path'
import { db } from './connection'

export class DatabaseMigrator {
  private migrationsPath = join(process.cwd(), 'lib/database/migrations')

  async runMigrations(): Promise<void> {
    console.log('🚀 Starting database migration...')
    
    try {
      // Test connection first
      const isConnected = await db.testConnection()
      if (!isConnected) {
        throw new Error('Database connection failed')
      }

      // Create migrations tracking table if it doesn't exist
      await this.createMigrationsTable()

      // Get list of applied migrations
      const appliedMigrations = await this.getAppliedMigrations()
      console.log(`📋 Found ${appliedMigrations.length} applied migrations`)

      // Run pending migrations
      const migrationFiles = ['001_initial_schema.sql'] // Add more migration files here as needed
      
      for (const migrationFile of migrationFiles) {
        if (!appliedMigrations.includes(migrationFile)) {
          await this.runMigration(migrationFile)
        } else {
          console.log(`⏭️  Skipping already applied migration: ${migrationFile}`)
        }
      }

      console.log('✅ Database migration completed successfully!')
    } catch (error) {
      console.error('❌ Database migration failed:', error)
      throw error
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await db.query(query)
    console.log('📊 Migrations tracking table ready')
  }

  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const result = await db.query('SELECT migration_name FROM schema_migrations ORDER BY applied_at')
      return result.rows.map((row: any) => row.migration_name)
    } catch (error) {
      console.log('📋 No previous migrations found')
      return []
    }
  }

  private async runMigration(migrationFile: string): Promise<void> {
    console.log(`🔄 Running migration: ${migrationFile}`)
    
    try {
      // Read migration file
      const migrationPath = join(this.migrationsPath, migrationFile)
      const migrationSQL = readFileSync(migrationPath, 'utf8')

      // Execute migration in a transaction
      await db.transaction(async (client) => {
        // Split SQL by semicolons and execute each statement
        const statements = migrationSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

        for (const statement of statements) {
          if (statement.trim()) {
            await client.query(statement)
          }
        }

        // Record migration as applied
        await client.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
          [migrationFile]
        )
      })

      console.log(`✅ Migration completed: ${migrationFile}`)
    } catch (error) {
      console.error(`❌ Migration failed: ${migrationFile}`, error)
      throw error
    }
  }

  async rollbackLastMigration(): Promise<void> {
    console.log('🔄 Rolling back last migration...')
    
    try {
      const result = await db.query(
        'SELECT migration_name FROM schema_migrations ORDER BY applied_at DESC LIMIT 1'
      )

      if (result.rows.length === 0) {
        console.log('📋 No migrations to rollback')
        return
      }

      const lastMigration = result.rows[0].migration_name
      console.log(`🔄 Rolling back: ${lastMigration}`)

      // For now, we'll just remove the migration record
      // In a production system, you'd want proper rollback scripts
      await db.query(
        'DELETE FROM schema_migrations WHERE migration_name = $1',
        [lastMigration]
      )

      console.log(`✅ Rollback completed: ${lastMigration}`)
      console.log('⚠️  Note: This only removes the migration record. Manual cleanup may be required.')
    } catch (error) {
      console.error('❌ Rollback failed:', error)
      throw error
    }
  }

  async getMigrationStatus(): Promise<void> {
    console.log('📊 Migration Status:')
    
    try {
      const result = await db.query(`
        SELECT migration_name, applied_at 
        FROM schema_migrations 
        ORDER BY applied_at DESC
      `)

      if (result.rows.length === 0) {
        console.log('📋 No migrations applied yet')
      } else {
        console.log('📋 Applied migrations:')
        result.rows.forEach((row: any) => {
          console.log(`   ✅ ${row.migration_name} (${new Date(row.applied_at).toLocaleString()})`)
        })
      }
    } catch (error) {
      console.error('❌ Failed to get migration status:', error)
    }
  }
}

// Export singleton instance
export const migrator = new DatabaseMigrator()

// CLI interface for running migrations
if (require.main === module) {
  const command = process.argv[2]
  
  switch (command) {
    case 'up':
      migrator.runMigrations()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
    
    case 'down':
      migrator.rollbackLastMigration()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
    
    case 'status':
      migrator.getMigrationStatus()
        .then(() => process.exit(0))
        .catch(() => process.exit(1))
      break
    
    default:
      console.log('Usage: npm run migrate [up|down|status]')
      console.log('  up     - Run pending migrations')
      console.log('  down   - Rollback last migration')
      console.log('  status - Show migration status')
      process.exit(1)
  }
}