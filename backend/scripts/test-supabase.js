/**
 * Supabase Connection Test Script
 * Verifies that all Supabase services are working correctly
 *
 * Run with: node scripts/test-supabase.js
 */

const { supabase } = require('../config/supabase');
const { testConnection } = require('../config/database.serverless');

const runTests = async () => {
  console.log('\n🧪 FloraQuiz Supabase Connection Tests\n');
  console.log('=====================================\n');

  try {
    // Test 1: Database connection
    console.log('Test 1: Database Connection');
    const dbConnected = await testConnection();
    if (!dbConnected) throw new Error('Database connection failed');
    console.log('✅ PASSED\n');

    // Test 2: Users table exists
    console.log('Test 2: Users Table Access');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (usersError) throw usersError;
    console.log(`✅ PASSED - Users table accessible\n`);

    // Test 3: Subscriptions table exists
    console.log('Test 3: Subscriptions Table Access');
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('id')
      .limit(1);

    if (subsError) throw subsError;
    console.log(`✅ PASSED - Subscriptions table accessible\n`);

    // Test 4: Quizzes table exists
    console.log('Test 4: Quizzes Table Access');
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id')
      .limit(1);

    if (quizzesError) throw quizzesError;
    console.log(`✅ PASSED - Quizzes table accessible\n`);

    // Test 5: Feature flags table
    console.log('Test 5: Feature Flags Table Access');
    const { data: flags, error: flagsError } = await supabase
      .from('feature_flags')
      .select('flag_name')
      .limit(1);

    if (flagsError) throw flagsError;
    console.log(`✅ PASSED - Feature flags table accessible\n`);

    // Test 6: Check Supabase environment variables
    console.log('Test 6: Environment Variables');
    const hasUrl = !!process.env.SUPABASE_URL;
    const hasAnonKey = !!process.env.SUPABASE_ANON_KEY;
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!hasUrl || !hasAnonKey || !hasServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }
    console.log('✅ PASSED - All environment variables set\n');

    console.log('=====================================');
    console.log('✅ ALL TESTS PASSED!\n');
    console.log('Your Supabase connection is working correctly.');
    console.log('Ready to proceed with backend development!\n');

    process.exit(0);
  } catch (error) {
    console.error('=====================================');
    console.error('❌ TEST FAILED\n');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Verify SUPABASE_URL in .env');
    console.error('2. Verify SUPABASE_SERVICE_ROLE_KEY in .env');
    console.error('3. Check that migration SQL was run in Supabase');
    console.error('4. Ensure Supabase project is active\n');

    process.exit(1);
  }
};

runTests();
