/**
 * Environment Variable Validation
 * Validates all required environment variables on startup
 * Prevents runtime errors from missing configuration
 */

const REQUIRED_VARS = {
  // Database
  DATABASE_URL: { type: 'string', description: 'PostgreSQL connection string (Neon)' },

  // Auth & Security
  JWT_SECRET: { type: 'string', description: 'JWT signing secret for tokens' },

  // API Keys
  GROQ_API_KEY: { type: 'string', description: 'Groq API key for AI quiz generation' },

  // Payment (Stripe)
  STRIPE_SECRET_KEY: { type: 'string', description: 'Stripe secret API key' },
  STRIPE_WEBHOOK_SECRET: { type: 'string', description: 'Stripe webhook signing secret' },

  // Storage (R2)
  R2_ACCOUNT_ID: { type: 'string', description: 'Cloudflare R2 Account ID' },
  R2_ACCESS_KEY_ID: { type: 'string', description: 'Cloudflare R2 Access Key ID' },
  R2_SECRET_ACCESS_KEY: { type: 'string', description: 'Cloudflare R2 Secret Access Key' },
  R2_BUCKET_NAME: { type: 'string', description: 'Cloudflare R2 Bucket Name' },

  // URLs
  FRONTEND_URL: { type: 'string', description: 'Frontend application URL' },
  BACKEND_URL: { type: 'string', description: 'Backend API URL' },
};

const OPTIONAL_VARS = {
  // Cache
  REDIS_URL: { type: 'string', description: 'Redis/Upstash connection string', default: null },

  // Email
  SENDGRID_API_KEY: { type: 'string', description: 'SendGrid API key', default: null },

  // Monitoring
  SENTRY_DSN: { type: 'string', description: 'Sentry error tracking DSN', default: null },

  // Server
  PORT: { type: 'number', description: 'Server port', default: 3001 },
  NODE_ENV: { type: 'string', description: 'Node environment', default: 'development' },
};

/**
 * Validates all environment variables
 * @throws {Error} If required variables are missing or invalid
 */
function validateEnvironment() {
  const errors = [];
  const warnings = [];

  // Check required variables
  for (const [key, config] of Object.entries(REQUIRED_VARS)) {
    const value = process.env[key];

    if (!value) {
      errors.push(`Missing required env var: ${key} - ${config.description}`);
    } else if (config.type === 'number' && isNaN(Number(value))) {
      errors.push(`Invalid ${key}: expected number, got "${value}"`);
    } else if (config.type === 'string' && typeof value !== 'string') {
      errors.push(`Invalid ${key}: expected string`);
    }
  }

  // Check optional variables with warnings
  for (const [key, config] of Object.entries(OPTIONAL_VARS)) {
    const value = process.env[key];

    if (value && config.type === 'number' && isNaN(Number(value))) {
      warnings.push(`Invalid ${key}: expected number, got "${value}"`);
    }
  }

  // Report errors
  if (errors.length > 0) {
    console.error('\n❌ ENVIRONMENT VALIDATION FAILED\n');
    console.error('Required environment variables missing or invalid:\n');
    errors.forEach(err => console.error(`  • ${err}`));
    console.error('\n📋 Required variables:\n');
    Object.entries(REQUIRED_VARS).forEach(([key, config]) => {
      const status = process.env[key] ? '✓' : '✗';
      console.error(`  [${status}] ${key}: ${config.description}`);
    });
    console.error('\n💡 Create a .env file in the backend directory with these variables.\n');
    process.exit(1);
  }

  // Report warnings
  if (warnings.length > 0 && process.env.NODE_ENV !== 'production') {
    console.warn('\n⚠️  ENVIRONMENT VALIDATION WARNINGS\n');
    warnings.forEach(warn => console.warn(`  • ${warn}`));
  }

  // Log validation success
  console.log('\n✅ Environment validation passed');
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Database: ${process.env.DATABASE_URL ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   JWT: ${process.env.JWT_SECRET ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   Groq AI: ${process.env.GROQ_API_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   Stripe: ${process.env.STRIPE_SECRET_KEY ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   R2 Storage: ${process.env.R2_ACCOUNT_ID ? '✓ Configured' : '✗ Missing'}`);
  console.log(`   Redis Cache: ${process.env.REDIS_URL ? '✓ Configured' : '○ Optional'}`);
  console.log(`   Sentry: ${process.env.SENTRY_DSN ? '✓ Configured' : '○ Optional'}\n`);
}

/**
 * Gets a required environment variable with error handling
 */
function getRequired(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable missing: ${key}`);
  }
  return value;
}

/**
 * Gets an optional environment variable
 */
function getOptional(key, defaultValue = null) {
  return process.env[key] || defaultValue;
}

module.exports = {
  validateEnvironment,
  getRequired,
  getOptional,
  REQUIRED_VARS,
  OPTIONAL_VARS,
};
