const { Pool } = require('pg');
require('dotenv').config();

/**
 * PostgreSQL Connection Pool
 * Uses connection pooling for efficient database resource management
 *
 * Environment Variables:
 * - DATABASE_URL: Full PostgreSQL connection string from Neon
 *
 * Example: postgresql://user:password@neon.tech:5432/floraquiz
 */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Timeout for connecting to database
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Query helper function
 * Simplifies database queries with automatic error handling
 */
const query = (text, params) => {
  return pool.query(text, params);
};

/**
 * Get single row from query result
 */
const getOne = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows[0];
};

/**
 * Get all rows from query result
 */
const getAll = async (text, params) => {
  const result = await pool.query(text, params);
  return result.rows;
};

/**
 * Test database connection
 */
const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  query,
  getOne,
  getAll,
  testConnection,
};
