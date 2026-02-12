#!/usr/bin/env node

/**
 * FloraQuiz Startup Script
 * Initializes database and starts server with proper error handling
 */

require('dotenv').config();
const { sql } = require('./config/database.serverless');

console.log('\n🚀 FLORAQUIZ STARTUP\n');
console.log('════════════════════════════════════════════════════════════');

// Step 1: Check environment
console.log('\n1️⃣  Checking environment variables...');
const requiredVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'GROQ_API_KEY',
  'REDIS_URL',
  'PAYSTACK_SECRET_KEY',
];

const missingVars = requiredVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('❌ Missing environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
}
console.log('✅ All environment variables set');

// Step 2: Test database
console.log('\n2️⃣  Testing database connection...');
(async () => {
  try {
    const dbPromise = sql`SELECT 1 as test`;
    const result = await Promise.race([
      dbPromise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
    console.log('✅ Database connected');
  } catch (err) {
    console.warn('⚠️  Database test failed:', err.message);
    console.warn('   (This may be temporary - server will start anyway)');
  }

  // Step 3: Start server
  console.log('\n3️⃣  Starting server...');
  try {
    const server = require('./server');
    console.log('✅ Server module loaded');
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down...');
  process.exit(0);
});

// Catch unhandled errors
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
});
