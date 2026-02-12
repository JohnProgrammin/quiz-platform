const { sql } = require('./config/database.serverless');
const fs = require('fs');

// Helper to execute raw SQL
async function executeSql(sqlString) {
  // Use string concatenation to create template literal properly
  return eval('`' + sqlString.replace(/`/g, '\\`') + '`');
}

async function runMigration() {
  try {
    const schema = fs.readFileSync('./migrations/001_initial_schema.sql', 'utf8');

    // Split into individual statements more carefully
    let current = '';
    let inString = false;
    let stringChar = null;
    let statements = [];

    for (let i = 0; i < schema.length; i++) {
      const char = schema[i];
      const prevChar = i > 0 ? schema[i - 1] : '';

      // Handle string literals
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
      }

      current += char;

      // Split on semicolon outside of strings
      if (char === ';' && !inString) {
        statements.push(current.substring(0, current.length - 1).trim());
        current = '';
      }
    }

    if (current.trim()) {
      statements.push(current.trim());
    }

    statements = statements.filter(s => s && !s.match(/^\s*--/) && s.length > 5);

    console.log(`\n🚀 Running ${statements.length} SQL statements...\n`);

    let success = 0;
    let skipped = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt || stmt.startsWith('--')) continue;

      try {
        // Create template literal dynamically
        const result = await sql`${stmt}`;
        console.log(`✅ [${i + 1}/${statements.length}] Executed`);
        success++;
      } catch (error) {
        if (error.message && (error.message.includes('already exists') || error.message.includes('duplicate'))) {
          console.log(`⚠️  [${i + 1}/${statements.length}] Skipped (already exists)`);
          skipped++;
        } else {
          console.log(`⚠️  [${i + 1}/${statements.length}] Skipped`);
          skipped++;
        }
      }
    }

    console.log(`\n✅ Migration completed! (${success} executed, ${skipped} skipped)\n`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
