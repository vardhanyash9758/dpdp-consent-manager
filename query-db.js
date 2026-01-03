const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function queryDatabase() {
  const args = process.argv.slice(2)
  const query = args.join(' ')
  
  if (!query) {
    console.log('Usage: node query-db.js "SELECT * FROM table_name"')
    console.log('\nAvailable tables:')
    console.log('- consent_templates')
    console.log('- consent_purposes') 
    console.log('- consent_records')
    console.log('- vendors')
    console.log('- audit_logs')
    console.log('- email_events')
    console.log('\nExample queries:')
    console.log('node query-db.js "SELECT * FROM consent_purposes"')
    console.log('node query-db.js "SELECT COUNT(*) FROM consent_records"')
    console.log('node query-db.js "SELECT name, status FROM consent_templates"')
    return
  }
  
  try {
    console.log('🔍 Executing query:', query)
    console.log('─'.repeat(50))
    
    const result = await pool.query(query)
    
    if (result.rows.length === 0) {
      console.log('📭 No results found')
    } else {
      console.log(`📊 Found ${result.rows.length} row(s):`)
      console.log('')
      
      // Pretty print results
      console.table(result.rows)
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error.message)
  } finally {
    await pool.end()
  }
}

queryDatabase()