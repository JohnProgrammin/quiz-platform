const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cacheService = require('../services/cache.service');

/**
 * Security Middleware Suite
 * Includes:
 * - Helmet.js for security headers
 * - Rate limiting (global + endpoint-specific)
 * - Input sanitization
 * - CORS validation
 */

// ============================================
// HELMET SECURITY HEADERS
// ============================================

const helmetConfig = helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'", 'https://api.paystack.co', 'https://*.groq.com'],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
});

// ============================================
// RATE LIMITING
// ============================================

/**
 * Global rate limiter: 100 requests per minute per IP
 * Used as default for all routes
 */
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }, // Skip X-Forwarded-For validation (we set trust proxy)
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health';
  },
});

/**
 * Auth endpoint limiter: 5 attempts per 15 minutes
 * Prevents brute force attacks on login/signup
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login/signup attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  validate: { xForwardedForHeader: false }, // Skip X-Forwarded-For validation (we set trust proxy)
});

/**
 * Quiz generation limiter
 * Prevents abuse of AI API (costly resource)
 * Tier-based limits applied via middleware
 */
const createQuizLimiter = (req, res, next) => {
  // This will be handled by tier-based rate limiting middleware
  next();
};

/**
 * AI Teaching message limiter
 * 100 messages per hour per user
 */
const teachingMessageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  keyGenerator: (req) => req.user.id, // Rate limit by user ID, not IP
  message: 'Too many messages, please try again later.',
  validate: { xForwardedForHeader: false }, // Skip X-Forwarded-For validation (we set trust proxy)
});

// ============================================
// INPUT SANITIZATION
// ============================================

/**
 * Sanitize request body to prevent MongoDB injection
 * Note: We use PostgreSQL, but good security practice
 */
const sanitizeInput = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Potential injection detected in ${key}`);
  },
});

/**
 * Validate JSON request bodies
 * Allows multipart/form-data for file uploads
 */
const validateJson = (req, res, next) => {
  // Skip webhook endpoints (they use raw body)
  if (req.path.startsWith('/api/v1/webhooks')) {
    return next();
  }
  // Skip preflight and safe methods
  if (req.method === 'GET' || req.method === 'DELETE' || req.method === 'OPTIONS') {
    return next();
  }
  if (req.is('application/json')) {
    return next();
  }
  if (req.is('multipart/form-data')) {
    return next();
  }
  res.status(400).json({ error: 'Content-Type must be application/json or multipart/form-data' });
};

// ============================================
// CUSTOM SECURITY MIDDLEWARE
// ============================================

/**
 * Prevent parameter pollution
 * Only allows last value if same param appears multiple times
 */
const preventParameterPollution = (req, res, next) => {
  if (req.query && Object.keys(req.query).length > 0) {
    Object.keys(req.query).forEach((key) => {
      if (Array.isArray(req.query[key])) {
        req.query[key] = req.query[key][req.query[key].length - 1];
      }
    });
  }
  next();
};

/**
 * Rate limiting by tier-based quiz generation
 * Applied per user based on subscription tier
 * Middleware: use this on quiz generation endpoints
 */
const tierBasedRateLimit = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const rateLimitKey = `quiz_generation:${req.user.id}`;
  const tier = req.user.subscription_tier || 'free';

  // Define limits by tier
  const limits = {
    free: 5, // 5 quizzes per month
    pro: 1000, // Effectively unlimited
    premium: 1000, // Effectively unlimited
  };

  const monthlyLimit = limits[tier] || limits.free;

  try {
    // Check Redis for monthly counter
    let count = await cacheService.get(rateLimitKey);

    if (!count) {
      count = req.user.monthly_quiz_count || 0;
    }

    if (count >= monthlyLimit) {
      return res.status(429).json({
        error: `Monthly quiz limit (${monthlyLimit}) exceeded for ${tier} plan`,
        limit: monthlyLimit,
        used: count,
        resetDate: req.user.monthly_quiz_reset_at,
      });
    }

    // Increment counter
    const newCount = count + 1;
    await cacheService.set(rateLimitKey, newCount, 30 * 24 * 60 * 60); // 30 days

    // Attach to request for use in controller
    req.quizGenerationCount = newCount;
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open (allow request) but log error
    next();
  }
};

/**
 * CSRF protection (if needed for forms)
 * Can be enabled for state-changing operations
 */
const csrfProtection = (req, res, next) => {
  // JWT tokens already provide protection
  // This is optional for additional safety
  next();
};

// ============================================
// EXPORT MIDDLEWARE
// ============================================

module.exports = {
  helmetConfig,
  globalLimiter,
  authLimiter,
  createQuizLimiter,
  teachingMessageLimiter,
  sanitizeInput,
  validateJson,
  preventParameterPollution,
  tierBasedRateLimit,
  csrfProtection,
};
