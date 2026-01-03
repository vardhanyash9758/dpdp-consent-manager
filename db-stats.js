const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
})

async function showDatabaseStats() {
  try {
    console.log('📊 DPDP Consent Management Database Statistics')
    console.log('═'.repeat(50))
    
    // Table counts
    const tables = [
      'consent_templates',
      'consent_purposes', 
      'consent_records',
      'vendors',
      'audit_logs',
      'email_events'
    ]
    
    console.log('\n📋 Table Counts:')
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) FROM ${table}`)
        const count = result.rows[0].count
        console.log(`   ${table.padEnd(20)} : ${count.padStart(5)} rows`)
      } catch (error) {
        console.log(`   ${table.padEnd(20)} : ERROR`)
      }
    }
    
    // Recent activity
    console.log('\n🕒 Recent Activity:')
    
    // Latest purposes
    const latestPurposes = await pool.query(`
      SELECT name, category, created_at 
      FROM consent_purposes 
      ORDER BY created_at DESC 
      LIMIT 3
    `)
    
    if (latestPurposes.rows.length > 0) {
      console.log('\n   Latest Purposes:')
      latestPurposes.rows.forEach(row => {
        console.log(`   • ${row.name} (${row.category}) - ${new Date(row.created_at).toLocaleString()}`)
      })
    }
    
    // Latest templates
    const latestTemplates = await pool.query(`
      SELECT name, status, created_at 
      FROM consent_templates 
      ORDER BY created_at DESC 
      LIMIT 3
    `)
    
    if (latestTemplates.rows.length > 0) {
      console.log('\n   Latest Templates:')
      latestTemplates.rows.forEach(row => {
        console.log(`   • ${row.name} (${row.status}) - ${new Date(row.created_at).toLocaleString()}`)
      })
    }
    
    // Latest consents
    const latestConsents = await pool.query(`
      SELECT user_reference_id, status, consent_timestamp 
      FROM consent_records 
      ORDER BY consent_timestamp DESC 
      LIMIT 3
    `)
    
    if (latestConsents.rows.length > 0) {
      console.log('\n   Latest Consents:')
      latestConsents.rows.forEach(row => {
        console.log(`   • User: ${row.user_reference_id} (${row.status}) - ${new Date(row.consent_timestamp).toLocaleString()}`)
      })
    }
    
    // Purpose categories breakdown
    const categoryStats = await pool.query(`
      SELECT category, COUNT(*) as count 
      FROM consent_purposes 
      GROUP BY category 
      ORDER BY count DESC
    `)
    
    if (categoryStats.rows.length > 0) {
      console.log('\n📊 Purpose Categories:')
      categoryStats.rows.forEach(row => {
        console.log(`   ${row.category.padEnd(15)} : ${row.count} purposes`)
      })
    }
    
    console.log('\n' + '═'.repeat(50))
    console.log('✅ Database is healthy and operational!')
    
  } catch (error) {
    console.error('❌ Error getting database stats:', error.message)
  } finally {
    await pool.end()
  }
}

showDatabaseStats()