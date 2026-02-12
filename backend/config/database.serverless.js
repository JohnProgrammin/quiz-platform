/**
 * Neon Serverless Database Configuration
 * Uses Neon's HTTP-based serverless driver for stateless connections
 * Perfect for Vercel and other serverless environments
 *
 * Advantages over connection pooling:
 * - No connection pool overhead
 * - Stateless (good for serverless)
 * - Automatic scaling
 * - Better for short-lived functions
 *
 * Usage:
 * const { sql } = require('./database.serverless');
 * const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

// Validate DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is not set!');
  console.error('   Please add DATABASE_URL to your .env file');
  process.exit(1);
}

// Initialize Neon SQL client
let sql;
try {
  sql = neon(DATABASE_URL);
  console.log('✅ Neon client initialized');
} catch (error) {
  console.error('❌ Failed to initialize Neon client:', error.message);
  process.exit(1);
}

/**
 * Test database connection
 * @returns {boolean} Connection status
 */
const testConnection = async () => {
  try {
    console.log('Testing database connection...');
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connection successful (Neon Serverless)');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('   DATABASE_URL:', DATABASE_URL?.substring(0, 50) + '...');

    // Provide helpful error messages
    if (error.message.includes('fetch failed')) {
      console.error('   Possible causes:');
      console.error('   1. Neon database endpoint is unreachable');
      console.error('   2. DATABASE_URL is incorrect or expired');
      console.error('   3. Network connectivity issue');
      console.error('   4. Firewall blocking connection');
    }

    return false;
  }
};

/**
 * Helper function to get single row from query result
 * @param {string} query - SQL query using template literal
 * @returns {object} Single row or null
 */
const getOne = async (query) => {
  try {
    const result = await query;
    return result && result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Helper function to get all rows from query result
 * @param {string} query - SQL query using template literal
 * @returns {array} Array of rows
 */
const getAll = async (query) => {
  try {
    const result = await query;
    return result || [];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

module.exports = {
  sql,
  testConnection,
  getOne,
  getAll,
};
