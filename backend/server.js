/**
 * FloraQuiz - Production-Ready Backend Server
 * Modular Express.js application with services, middleware, and routes
 *
 * Architecture:
 * Middleware → Routes → Controllers → Services → Database
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// ============================================
// IMPORTS - Configuration
// ============================================

const { supabase, testConnection: testDbConnection } = require('./config/database.serverless');
const { pricingPlans } = require('./config/stripe.config');
const cacheService = require('./services/cache.service');
const storageService = require('./services/storage.service');
const currencyService = require('./services/currency.service');
const gamificationService = require('./services/gamification.service');

// ============================================
// IMPORTS - Middleware
// ============================================

const {
  helmetConfig,
  globalLimiter,
  authLimiter,
  sanitizeInput,
  validateJson,
  preventParameterPollution,
  tierBasedRateLimit,
} = require('./middleware/security');

const {
  authenticateToken,
  checkSubscriptionTier,
  checkFeatureAccess,
  optionalAuth,
} = require('./middleware/auth');

// ============================================
// APP CONFIGURATION
// ============================================

// ============================================
// ENVIRONMENT VALIDATION
// ============================================
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'GROQ_API_KEY',
  'PAYSTACK_SECRET_KEY',
];

const optionalEnvVars = [
  'REDIS_URL',      // Optional - graceful fallback if missing
  'R2_ACCOUNT_ID',  // Optional - graceful fallback if missing
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
];

const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
  console.error('🔴 CRITICAL: Missing required environment variables:');
  missingVars.forEach(v => console.error(`   - ${v}`));
  process.exit(1);
}

// Warn about missing optional vars
const missingOptional = optionalEnvVars.filter(v => !process.env[v]);
if (missingOptional.length > 0) {
  console.warn('⚠️  Optional services disabled (missing env vars):');
  missingOptional.forEach(v => console.warn(`   - ${v}`));
}

const app = express();
const PORT = process.env.PORT || 3001;

// ============================================
// GLOBAL MIDDLEWARE STACK
// ============================================

// Trust proxy (important for Render, which uses reverse proxy)
// This allows rate limiting to work correctly with X-Forwarded-For header
app.set('trust proxy', 1);

// Security
app.use(helmetConfig);
app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map(u => u.trim()),
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));

// Parsing & Validation
// Preserve raw body for webhook signature verification
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook signature verification
    if (req.originalUrl && req.originalUrl.includes('/webhooks/')) {
      req.rawBody = buf.toString('utf8');
    }
  },
}));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(validateJson);
app.use(sanitizeInput);
app.use(preventParameterPollution);

// Rate Limiting
app.use(globalLimiter);

// Static Files (SEO: robots.txt, sitemap.xml)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Database connection is now imported directly in controllers using Neon serverless
// No need to inject into app.locals

// Request Logging (optional - can add Pino later)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// PUBLIC ROUTES (No Authentication)
// ============================================

/**
 * Root Endpoint
 * Returns API status and welcome message
 */
app.get('/', (req, res) => {
  res.json({
    message: 'FloraQuiz API Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      pricing: '/api/v1/subscription/plans',
      auth: '/api/v1/auth/*',
      quizzes: '/api/v1/quiz/*',
    },
  });
});

/**
 * Health Check Endpoint
 * Used by: Vercel, monitoring systems, load balancers
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Pricing Plans Endpoint (Multi-Currency)
 * Auto-detects user's currency from IP address
 * Returns pricing in user's local currency
 */
app.get('/api/v1/subscription/plans', async (req, res) => {
  try {
    // Get user's IP address (works on all platforms)
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    // Check if currency is explicitly requested
    const requestedCurrency = req.query.currency?.toUpperCase();

    let currency = requestedCurrency;

    // If no currency requested, detect from IP
    if (!currency) {
      const geoData = await currencyService.detectCountryFromIP(clientIP);
      currency = geoData.currency || 'USD';
    }

    // Validate currency is supported
    const supported = currencyService.getSupportedCurrencies();
    if (!supported[currency]) {
      currency = 'USD';
    }

    // Get pricing plans in user's currency
    const plans = currencyService.getPricingPlans(currency);

    // Add metadata
    res.json({
      ...plans,
      clientIP: clientIP.substring(0, 10) + '***', // Privacy: mask IP
      detected: !requestedCurrency,
    });
  } catch (error) {
    console.error('Pricing endpoint error:', error);
    // Fallback to USD if any error
    res.json(currencyService.getPricingPlans('USD'));
  }
});

// ============================================
// AUTH ROUTES
// ============================================

const authRouter = express.Router();

/**
 * Sign Up
 * POST /api/v1/auth/signup
 * Body: { username, email, password, fullName }
 */
authRouter.post('/signup', authLimiter, async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database using Supabase
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          email,
          password_hash: hashedPassword,
          full_name: fullName || username,
          subscription_tier: 'free',
        }
      ])
      .select('id, username, email, full_name, subscription_tier, created_at')
      .single();

    if (error) {
      throw error;
    }

    const user = data;

    // Initialize gamification for new user
    try {
      await gamificationService.initializeUser(user.id);
    } catch (gamErr) {
      console.error('⚠️ Error initializing gamification:', gamErr.message);
      // Don't fail signup if gamification init fails
    }

    // Create JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        subscriptionTier: user.subscription_tier,
      },
    });
  } catch (error) {
    console.error('Signup error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      stack: error.stack,
    });

    if (error.code === '23505') {
      // Unique constraint violation
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    if (error.code === '28P01' || error.message?.includes('permission')) {
      // Database permission error
      return res.status(503).json({ error: 'Database service temporarily unavailable' });
    }

    // Generic error - don't expose internal details
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

/**
 * Login
 * POST /api/v1/auth/login
 * Body: { username, password }
 */
authRouter.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Get user from database using Supabase
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, password_hash, subscription_tier')
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = data;

    // Verify password
    const bcrypt = require('bcryptjs');
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date() })
      .eq('id', user.id);

    // Create JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        subscriptionTier: user.subscription_tier,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Send Verification Email
 * POST /api/v1/auth/send-verification-email
 * Body: { email }
 * Sends verification email to user's email address
 */
authRouter.post('/send-verification-email', authLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email using Supabase
    const { data, error } = await supabase
      .from('users')
      .select('id, email_verified')
      .eq('email', email)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = data;

    if (user.email_verified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    // Generate verification token
    const jwt = require('jsonwebtoken');
    const verificationToken = jwt.sign(
      { id: user.id, type: 'email_verification' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Send verification email
    const emailService = require('./services/email.service');
    await emailService.sendVerificationEmail(email, verificationToken);

    res.json({ message: 'Verification email sent. Check your inbox.' });
  } catch (error) {
    console.error('Send verification email error:', error);
    res.status(500).json({ error: 'Failed to send verification email' });
  }
});

/**
 * Verify Email Token
 * POST /api/v1/auth/verify-email
 * Body: { token }
 * Verifies the email token and marks email as verified
 */
authRouter.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    // Verify token
    const jwt = require('jsonwebtoken');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired verification token' });
    }

    if (decoded.type !== 'email_verification') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    // Update user email verification status using Supabase
    const { data, error } = await supabase
      .from('users')
      .update({ email_verified: true })
      .eq('id', decoded.id)
      .select('id, username, email, email_verified')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Email verified successfully',
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        emailVerified: data.email_verified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Email verification failed' });
  }
});

app.use('/api/v1/auth', authRouter);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * Get Current User Profile
 * GET /api/v1/users/me
 */
app.get('/api/v1/users/me', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, full_name, bio, subscription_tier, monthly_quiz_count, monthly_quiz_reset_at, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: data.id,
      username: data.username,
      email: data.email,
      fullName: data.full_name,
      bio: data.bio,
      subscriptionTier: data.subscription_tier,
      monthlyQuizCount: data.monthly_quiz_count,
      createdAt: data.created_at,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * Logout
 * POST /api/v1/auth/logout
 */
app.post('/api/v1/auth/logout', authenticateToken, (req, res) => {
  // JWT is stateless, just confirm logout on client side
  res.json({ message: 'Logged out successfully' });
});

/**
 * Reset Account to Clean Slate
 * POST /api/v1/account/reset
 * Deletes all notes, clears coupon usage, resets to free tier
 */
app.post('/api/v1/account/reset', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete all notes
    await supabase.from('notes').delete().eq('user_id', userId);

    // Delete all quizzes
    await supabase.from('quizzes').delete().eq('user_id', userId);

    // Delete all quiz attempts
    await supabase.from('quiz_attempts').delete().eq('user_id', userId);

    // Clear coupon usage (if table exists)
    try {
      await supabase.from('user_coupon_usage').delete().eq('user_id', userId);
    } catch (e) {
      // Table might not exist, ignore
    }

    // Reset to free tier
    await supabase
      .from('users')
      .update({ subscription_tier: 'free' })
      .eq('id', userId);

    res.json({
      message: 'Account reset successfully. All notes, quizzes, and subscription data cleared.',
      subscription_tier: 'free',
    });
  } catch (error) {
    console.error('❌ Account reset error:', error.message);
    res.status(500).json({
      error: 'Failed to reset account',
      details: error.message,
    });
  }
});

// ============================================
// SUBSCRIPTION/PAYMENT ROUTES
// ============================================

/**
 * Create Paystack Payment
 * POST /api/v1/subscription/checkout
 * Body: { plan: 'pro' | 'premium' }
 * Automatically detects user's currency and converts price
 */
app.post('/api/v1/subscription/checkout', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !['pro', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Valid plan required (pro or premium)' });
    }

    // Get user using Supabase
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('id', req.user.id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userData;

    // Paystack Plan IDs (Nigeria NGN pricing)
    const paymentPlans = {
      pro: 'PLN_pv67fcbied84ynz',      // ₦5,000/month
      premium: 'PLN_pp48a20xxtez4ot',  // ₦10,000/month
    };

    const planId = paymentPlans[plan];
    if (!planId) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    // Import Paystack config
    const { createTransaction } = require('./config/paystack.config');

    // Extract first URL from possibly comma-separated FRONTEND_URL
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

    // Create Paystack transaction with plan ID
    const transaction = await createTransaction({
      email: user.email,
      planId: planId,  // Use Paystack Plan ID instead of amount
      plan: plan,
      userId: req.user.id,
      callbackUrl: `${frontendUrl}/subscription/callback`,
    });

    // Handle both possible response structures
    const authUrl = transaction.data?.authorization_url || transaction.authorization_url;
    const accessCode = transaction.data?.access_code || transaction.access_code;
    const reference = transaction.data?.reference || transaction.reference;

    if (!authUrl) {
      console.error('❌ No authorization URL in Paystack response:', JSON.stringify(transaction, null, 2));
      return res.status(500).json({ error: 'Failed to create payment session: No authorization URL' });
    }

    res.json({
      authorizationUrl: authUrl,
      accessCode: accessCode,
      reference: reference,
    });
  } catch (error) {
    console.error('❌ Paystack transaction error:', error.message);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      error: 'Failed to initiate payment',
      details: error.message
    });
  }
});

/**
 * Get Current Subscription
 * GET /api/v1/subscription/current
 */
app.get('/api/v1/subscription/current', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('tier, status, current_period_end, cancel_at_period_end')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.json({ subscription: null, tier: 'free' });
    }

    res.json({
      subscription: data,
      tier: data.tier,
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

/**
 * Verify Payment
 * GET /api/v1/subscription/verify-payment
 * Query: reference={paystack_reference}
 * Verifies a Paystack payment and checks subscription status
 */
app.get('/api/v1/subscription/verify-payment', authenticateToken, async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference required' });
    }

    // Import Paystack config
    const { verifyPayment } = require('./config/paystack.config');

    // Verify with Paystack
    const verification = await verifyPayment(reference);

    if (!verification.data || verification.status !== true) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const paystackData = verification.data;

    // Check if payment was already processed using Supabase
    const { data: existingData } = await supabase
      .from('subscriptions')
      .select('id, tier')
      .eq('paystack_reference', reference)
      .limit(1)
      .single();

    if (existingData) {
      // Already processed (by webhook or prior verify call)
      return res.json({
        verified: true,
        tier: existingData.tier,
        subscriptionId: existingData.id,
        message: 'Subscription already active',
      });
    }

    // Get plan from metadata
    const plan = paystackData.metadata?.plan;
    if (!plan || !['pro', 'premium'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan in payment data' });
    }

    // Create subscription (upsert to prevent duplicates from webhook race condition)
    const tier = plan === 'pro' ? 'pro' : 'premium';
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .upsert([{
        user_id: req.user.id,
        paystack_reference: reference,
        tier: tier,
        status: 'active',
        current_period_start: new Date(),
        current_period_end: periodEnd,
      }], { onConflict: 'paystack_reference', ignoreDuplicates: false })
      .select('id')
      .single();

    // Update user tier
    await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        updated_at: new Date(),
      })
      .eq('id', req.user.id);

    // Log payment event (store raw amount in kobo/cents for frontend formatting)
    await supabase
      .from('payment_events')
      .insert([{
        user_id: req.user.id,
        paystack_reference: reference,
        event_type: 'charge.success',
        amount: paystackData.amount,  // Raw kobo/cents from Paystack
        currency: paystackData.currency,
        status: 'succeeded',
        metadata: JSON.stringify({ reference, plan }),
      }]);

    res.json({
      verified: true,
      tier: tier,
      subscriptionId: subscriptionData.id,
      message: `Successfully upgraded to ${tier} plan`,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

/**
 * Update Current User Profile
 * PATCH /api/v1/users/me
 * Body: { fullName, bio }
 */
app.patch('/api/v1/users/me', authenticateToken, async (req, res) => {
  try {
    const { fullName, bio } = req.body;

    const updateData = {};
    if (fullName !== undefined && fullName !== null) updateData.full_name = fullName;
    if (bio !== undefined && bio !== null) updateData.bio = bio;
    updateData.updated_at = new Date();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('id, username, email, full_name, bio, subscription_tier')
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: data.id,
      username: data.username,
      email: data.email,
      fullName: data.full_name,
      bio: data.bio,
      subscriptionTier: data.subscription_tier,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

/**
 * Cancel Subscription
 * POST /api/v1/subscription/cancel
 * Cancels subscription at period end (Paystack)
 */
app.post('/api/v1/subscription/cancel', authenticateToken, async (req, res) => {
  try {
    // Get user's subscription using Supabase
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('id, current_period_end')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !subData) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const subscription = subData;
    const periodEnd = subscription.current_period_end;

    // Update database to mark subscription for cancellation
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date(),
        updated_at: new Date(),
      })
      .eq('id', subscription.id);

    // Update user tier (will revert to free after period end)
    await supabase
      .from('users')
      .update({
        subscription_status: 'pending_cancellation',
        updated_at: new Date(),
      })
      .eq('id', req.user.id);

    res.json({
      success: true,
      message: 'Subscription will cancel at period end',
      periodEnd: new Date(periodEnd),
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

/**
 * Resume Canceled Subscription
 * POST /api/v1/subscription/resume
 * Resumes a subscription that was marked for cancellation (Paystack)
 */
app.post('/api/v1/subscription/resume', authenticateToken, async (req, res) => {
  try {
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('cancel_at_period_end', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subError || !subData) {
      return res.status(404).json({ error: 'No pending cancellation found' });
    }

    const subscriptionId = subData.id;

    // Update database to cancel the pending cancellation
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        canceled_at: null,
        updated_at: new Date(),
      })
      .eq('id', subscriptionId);

    // Update user status
    await supabase
      .from('users')
      .update({
        subscription_status: 'active',
        updated_at: new Date(),
      })
      .eq('id', req.user.id);

    res.json({
      success: true,
      message: 'Subscription resumed successfully'
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

/**
 * Get Subscription Management Info
 * GET /api/v1/subscription/management
 * Returns subscription details and management options for Paystack
 */
app.get('/api/v1/subscription/management', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, tier, status, current_period_start, current_period_end, cancel_at_period_end, paystack_reference')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return res.json({ subscription: null, message: 'No active subscription' });
    }

    const sub = data;

    res.json({
      subscription: {
        id: sub.id,
        tier: sub.tier,
        status: sub.status,
        periodStart: sub.current_period_start,
        periodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        paystackReference: sub.paystack_reference,
      },
      canCancel: sub.status === 'active' && !sub.cancel_at_period_end,
      canResume: sub.cancel_at_period_end,
    });
  } catch (error) {
    console.error('Subscription management error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription management info' });
  }
});

/**
 * Get Billing History
 * GET /api/v1/subscription/history
 * Returns payment events for current user
 */
app.get('/api/v1/subscription/history', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('payment_events')
      .select('id, event_type, amount, currency, status, created_at')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    res.json({ history: data || [] });
  } catch (error) {
    console.error('Billing history error:', error);
    res.status(500).json({ error: 'Failed to fetch billing history' });
  }
});

// ============================================
// PHASE 3: NOTES, QUIZ & TEACHING ROUTES
// ============================================

// Import routes
const notesRoutes = require('./routes/notes.routes');
const quizRoutes = require('./routes/quiz.routes');
const teachingRoutes = require('./routes/teaching.routes');
const gamificationRoutes = require('./routes/gamification.routes');

// Register routes
app.use('/api/v1/notes', notesRoutes);
app.use('/api/v1/quiz', quizRoutes);
app.use('/api/v1/teaching', teachingRoutes);
app.use('/api/v1/gamification', gamificationRoutes);

// ============================================
// WEBHOOK ROUTES
// ============================================

/**
 * Paystack Webhook Handler
 * POST /api/v1/webhooks/paystack
 * Handles payment.success events
 * Note: req.rawBody is set by the JSON parser verify callback above
 */
app.post('/api/v1/webhooks/paystack', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];

    // CRITICAL: Validate signature before processing
    if (!signature) {
      console.error('🔴 SECURITY: Paystack webhook received without signature header');
      return res.status(400).json({ error: 'Signature required' });
    }

    const { verifyWebhookSignature } = require('./config/paystack.config');

    // Use rawBody (preserved by express.json verify callback) for HMAC verification
    const rawBody = req.rawBody;
    if (!rawBody) {
      console.error('🔴 SECURITY: No raw body available for webhook signature verification');
      return res.status(400).json({ error: 'Unable to verify signature' });
    }

    // Verify webhook signature - will throw error if invalid
    let event;
    try {
      event = verifyWebhookSignature(rawBody, signature);
    } catch (signatureError) {
      console.error('🔴 SECURITY: Invalid Paystack webhook signature:', signatureError.message);
      return res.status(401).json({ error: 'Invalid signature' });
    }

    if (event.event !== 'charge.success') {
      console.log(`ℹ️ Unhandled event: ${event.event}`);
      return res.json({ status: 'ok' });
    }

    const charge = event.data;
    const reference = charge.reference;
    const userId = charge.metadata?.userId;
    const plan = charge.metadata?.plan;

    if (!userId || !plan) {
      console.error('🔴 Webhook missing metadata:', { reference, userId, plan });
      return res.status(400).json({ error: 'Missing payment metadata' });
    }

    // Check for duplicate payments by paystack_reference
    const { data: existingData } = await supabase
      .from('payment_events')
      .select('id')
      .eq('paystack_reference', reference)
      .limit(1)
      .single();

    if (existingData) {
      console.log(`✅ Duplicate payment (already processed): ${reference}`);
      return res.json({ status: 'ok' });
    }

    // Upsert subscription (prevents duplicates if verify-payment already created it)
    const tier = plan === 'pro' ? 'pro' : 'premium';
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await supabase
      .from('subscriptions')
      .upsert([{
        user_id: userId,
        paystack_reference: reference,
        tier: tier,
        status: 'active',
        current_period_start: new Date(),
        current_period_end: periodEnd,
      }], { onConflict: 'paystack_reference', ignoreDuplicates: true });

    // Update user tier
    await supabase
      .from('users')
      .update({
        subscription_tier: tier,
        subscription_status: 'active',
        updated_at: new Date(),
      })
      .eq('id', userId);

    // Log payment event (store raw amount in kobo/cents)
    await supabase
      .from('payment_events')
      .insert([{
        user_id: userId,
        paystack_reference: reference,
        event_type: 'charge.success',
        amount: charge.amount,  // Raw kobo/cents from Paystack
        currency: charge.currency,
        status: 'succeeded',
        metadata: JSON.stringify({ reference, plan }),
      }]);

    console.log(`✅ Payment successful for user ${userId}, plan: ${plan}`);
    res.json({ status: 'ok' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(200).json({ status: 'ok', error: error.message });
  }
});

// ============================================
// TEST ENDPOINTS (Development)
// ============================================

if (process.env.NODE_ENV === 'development') {
  /**
   * Test Database Connection
   * GET /api/v1/test/db
   */
  app.get('/api/v1/test/db', async (req, res) => {
    try {
      const { data, error } = await supabase.from('users').select('id').limit(1);
      if (error) throw error;
      res.json({
        status: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  });

  /**
   * Test Redis Connection
   * GET /api/v1/test/redis
   */
  app.get('/api/v1/test/redis', async (req, res) => {
    try {
      const testKey = 'test_' + Date.now();
      await cacheService.set(testKey, { message: 'test' }, 60);
      const value = await cacheService.get(testKey);
      await cacheService.delete(testKey);

      res.json({
        status: 'connected',
        value,
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  });

  /**
   * Test R2 Connection
   * GET /api/v1/test/r2
   */
  app.get('/api/v1/test/r2', async (req, res) => {
    try {
      const connected = await storageService.testConnection();
      res.json({
        status: connected ? 'connected' : 'error',
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  });

  /**
   * Clear Quiz History (Development Testing)
   * POST /api/v1/test/clear-quizzes
   * Clears all quizzes and attempts for the authenticated user
   */
  app.post('/api/v1/test/clear-quizzes', async (req, res) => {
    try {
      // Get user ID from auth header or body
      let userId = req.user?.id;
      if (!userId && req.body?.userId) {
        userId = req.body.userId;
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Delete quiz attempts
      await supabase.from('quiz_attempts').delete().eq('user_id', userId);

      // Delete quizzes
      await supabase.from('quizzes').delete().eq('user_id', userId);

      // Reset monthly quiz count
      await supabase.from('users').update({ monthly_quiz_count: 0, monthly_quiz_reset_at: new Date().toISOString() }).eq('id', userId);

      res.json({
        status: 'success',
        message: 'Quiz history cleared for testing',
        userId,
      });
    } catch (error) {
      console.error('Clear quiz history error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message,
      });
    }
  });

  /**
   * Test Groq API Connection
   * GET /api/v1/test/groq-api
   * Verifies the Groq API key is valid and working
   */
  app.get('/api/v1/test/groq-api', async (req, res) => {
    try {
      console.log('🔍 Testing Groq API connection...');
      console.log(`API Key exists: ${!!process.env.GROQ_API_KEY}`);
      console.log(`API Key starts with: ${process.env.GROQ_API_KEY?.substring(0, 10)}...`);

      const aiService = require('./services/ai.service');

      // Try a simple AI call to test the API key
      const testPrompt = 'Say hello briefly';
      const response = await aiService.groq.chat.completions.create({
        messages: [{ role: 'user', content: testPrompt }],
        model: 'llama-3.3-70b-versatile',
        max_tokens: 50,
      });

      console.log('✅ Groq API test successful!');
      res.json({
        status: 'success',
        message: 'Groq API is working correctly',
        apiKeyValid: true,
        response: response.choices[0]?.message?.content,
      });
    } catch (error) {
      console.error('❌ Groq API test failed:', error.message);
      res.status(500).json({
        status: 'error',
        message: 'Groq API test failed',
        error: error.message,
        apiKeyExists: !!process.env.GROQ_API_KEY,
        suggestion: 'Check if GROQ_API_KEY is valid in Render environment variables',
      });
    }
  });
}

// ============================================
// ERROR HANDLING & 404
// ============================================

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// 404 handler (second-to-last middleware)
app.use(notFoundHandler);

// Error handler (must be last middleware)
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

async function startServer() {
  try {
    console.log('🚀 FloraQuiz Server Starting...\n');

    // Start server immediately
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
      console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });

    // Test connections in background (non-blocking)
    setTimeout(async () => {
      console.log('\n🔍 Running connection tests in background...\n');

      // Test database (critical - must work)
      if (process.env.DATABASE_URL) {
        try {
          const dbResult = await Promise.race([
            testDbConnection(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
          ]);
          console.log('✅ Database: Connected');
        } catch (err) {
          console.warn('⚠️  Database: Connection test failed (will retry on first request)');
        }
      }

      // Test Redis (optional - graceful fallback)
      if (process.env.REDIS_URL) {
        try {
          const redisResult = await Promise.race([
            cacheService.testConnection(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000))
          ]);
          console.log('✅ Redis: Connected');
        } catch (err) {
          console.warn('⚠️  Redis: Not available - caching disabled');
        }
      } else {
        console.log('ℹ️  Redis: Not configured - caching disabled');
      }

      // Skip R2 test (slow and not critical for core functionality)
      if (process.env.R2_ACCOUNT_ID) {
        console.log('ℹ️  R2: Configured - file uploads enabled');
      } else {
        console.log('ℹ️  R2: Not configured - file uploads disabled');
      }

      console.log('\n✨ Server ready to accept requests!\n');
    }, 100);

  } catch (error) {
    console.error('❌ Critical startup error:', error.message);
    // Still try to start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`⚠️  Server started with errors on http://0.0.0.0:${PORT}`);
    });
  }
}

// Start the server
startServer();

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  try {
    await cacheService.disconnect();
  } catch (e) {
    console.warn('Cache disconnect error:', e.message);
  }
  process.exit(0);
});

module.exports = app;
