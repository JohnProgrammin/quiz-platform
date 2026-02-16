/**
 * Supabase PostgreSQL Database Configuration
 * Uses Supabase's managed PostgreSQL with built-in Auth and Row-Level Security
 * Perfect for serverless and production environments
 *
 * Advantages:
 * - Built-in authentication and RLS
 * - Automatic connection pooling
 * - REST API and real-time subscriptions
 * - Integrated storage
 * - Zero DevOps overhead
 *
 * Usage:
 * const { supabase } = require('./database.serverless');
 * const { data, error } = await supabase.from('users').select('*').eq('id', userId);
 */

const { supabase } = require('./supabase');
require('dotenv').config();

/**
 * Test database connection
 * @returns {boolean} Connection status
 */
const testConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) throw error;
    console.log('✅ Database connection successful (Supabase PostgreSQL)');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);

    // Provide helpful error messages
    if (error.message.includes('Failed to fetch')) {
      console.error('   Possible causes:');
      console.error('   1. Supabase endpoint is unreachable');
      console.error('   2. SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is incorrect');
      console.error('   3. Network connectivity issue');
    }

    return false;
  }
};

/**
 * Helper function to get single row from Supabase query
 * @param {Promise} query - Supabase query promise
 * @returns {object} Single row or null
 */
const getOne = async (query) => {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

/**
 * Helper function to get all rows from Supabase query
 * @param {Promise} query - Supabase query promise
 * @returns {array} Array of rows
 */
const getAll = async (query) => {
  try {
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

/**
 * Execute raw SQL query (for complex queries)
 * Uses Supabase's rpc() function to execute custom PostgreSQL functions
 * @param {string} functionName - Name of PostgreSQL function
 * @param {object} params - Function parameters
 * @returns {Promise} Query result
 */
const executeFunction = async (functionName, params = {}) => {
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Database function error:', error.message);
    throw error;
  }
};

module.exports = {
  supabase,
  testConnection,
  getOne,
  getAll,
  executeFunction,
};
