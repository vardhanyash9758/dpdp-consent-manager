const { db } = require('../lib/database/connection.ts');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    const migrationPath = path.join(__dirname, '../lib/database/migrations/002_app_settings.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Running app settings migration...');
    await db.query(migration);
    console.log('✅ App settings migration completed successfully');
    
    // Test the settings API
    const testResult = await db.query('SELECT * FROM app_settings LIMIT 1');
    console.log('✅ Settings table created with default values:', testResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();