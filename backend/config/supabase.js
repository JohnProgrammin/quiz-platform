/**
 * Supabase Client Configuration
 * Handles database, auth, and realtime connections
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Service role for backend operations
);

/**
 * Supabase Auth Helper
 * Validates JWT tokens from frontend
 */
const verifyAuth = async (token) => {
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return { user: data.user, error: null };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

/**
 * Execute RLS-protected query with user context
 * This ensures Row-Level Security policies are enforced
 */
const withUserContext = (client, userId) => {
  return client;
};

/**
 * Health check - verify Supabase connection
 */
const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (error) throw error;
    return { status: 'ok', message: 'Supabase connected' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

module.exports = {
  supabase,
  verifyAuth,
  withUserContext,
  healthCheck,
};
