/**
 * Check which tables exist in Supabase
 * Run with: node scripts/check-supabase-tables.js
 */

require('dotenv').config();
const { supabase } = require('../config/supabase');

const checkTables = async () => {
  console.log('\n📊 Checking Supabase Tables\n');

  try {
    const tables = [
      'users',
      'subscriptions',
      'notes',
      'quizzes',
      'quiz_questions',
      'quiz_attempts',
      'user_gamification',
      'achievements',
      'user_achievements',
      'teaching_sessions',
      'weakness_quizzes',
      'feature_flags',
      'payment_events',
    ];

    let created = 0;
    let missing = 0;

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('id')
          .limit(1);

        if (error && error.code === '404A') {
          console.log(`❌ ${table} - NOT FOUND`);
          missing++;
        } else if (error) {
          console.log(`⚠️  ${table} - Error: ${error.message}`);
        } else {
          console.log(`✅ ${table} - EXISTS`);
          created++;
        }
      } catch (err) {
        console.log(`⚠️  ${table} - Error: ${err.message}`);
      }
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`✅ Created: ${created}/${tables.length}`);
    console.log(`❌ Missing: ${missing}/${tables.length}`);

    if (missing > 0) {
      console.log('\n⚠️  IMPORTANT: Run the migration SQL in Supabase SQL Editor');
      console.log('   File: backend/migrations/003_supabase_migration.sql');
    }

  } catch (error) {
    console.error('Connection error:', error.message);
  }
};

checkTables();
