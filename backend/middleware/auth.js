const jwt = require('jsonwebtoken');
const { supabase } = require('../config/database.serverless');
require('dotenv').config();

/**
 * Authentication Middleware
 * Uses jsonwebtoken to verify JWTs created by signup/login endpoints
 */

/**
 * Verify JWT token and attach user to request
 * Checks:
 * - Token exists in Authorization header
 * - Token is valid JWT signed with JWT_SECRET
 * - User profile exists in public.users table
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token with jsonwebtoken
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.warn('Auth verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    try {
      // Get user profile from public.users table (includes subscription info)
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.id)
        .single();

      if (profileError || !userProfile) {
        console.error('Profile lookup error:', profileError?.message);
        return res.status(404).json({ error: 'User profile not found' });
      }

      // Check subscription status if subscription exists
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', decoded.id)
        .single();

      // Attach user to request for use in controllers
      req.user = {
        id: decoded.id,
        email: userProfile.email,
        username: userProfile.username || decoded.username,
        fullName: userProfile.full_name,
        avatarUrl: userProfile.avatar_url,
        subscriptionTier: subscription?.tier || userProfile.subscription_tier || 'free',
        subscription_tier: subscription?.tier || userProfile.subscription_tier || 'free',
        subscriptionStatus: subscription?.status || 'active',
        createdAt: userProfile.created_at,
        monthly_quiz_count: userProfile.monthly_quiz_count,
        monthly_quiz_reset_at: userProfile.monthly_quiz_reset_at,
      };

      // Check if subscription is valid
      if (subscription && !['active', 'trialing'].includes(subscription.status)) {
        return res.status(403).json({
          error: 'Subscription is not active',
          status: subscription.status,
        });
      }

      next();
    } catch (error) {
      console.error('Unexpected auth middleware error:', {
        message: error.message,
        userId: decoded.id,
      });
      res.status(500).json({ error: 'Authentication error' });
    }
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Check if user has required subscription tier
 * Usage: checkSubscriptionTier('pro') - only allows pro and premium
 *
 * Tier hierarchy: free < pro < premium
 */
const checkSubscriptionTier = (requiredTier) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const tierHierarchy = { free: 0, pro: 1, premium: 2 };
    const userTierValue = tierHierarchy[req.user.subscriptionTier] || 0;
    const requiredTierValue = tierHierarchy[requiredTier] || 0;

    if (userTierValue < requiredTierValue) {
      return res.status(403).json({
        error: `${requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)} subscription required`,
        requiredTier,
        currentTier: req.user.subscriptionTier,
      });
    }

    next();
  };
};

/**
 * Check if user has access to a specific feature
 * Features are mapped to tiers via database feature_flags table
 */
const checkFeatureAccess = (featureName) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      // Get feature from Supabase
      const { data: feature, error } = await supabase
        .from('feature_flags')
        .select('*')
        .eq('flag_name', featureName)
        .eq('enabled', true)
        .single();

      if (error || !feature) {
        return res.status(404).json({ error: 'Feature not found' });
      }

      // If feature requires a tier, check user has it
      if (feature.required_tier) {
        const tierHierarchy = { free: 0, pro: 1, premium: 2 };
        const userTierValue = tierHierarchy[req.user.subscriptionTier] || 0;
        const requiredTierValue = tierHierarchy[feature.required_tier] || 0;

        if (userTierValue < requiredTierValue) {
          return res.status(403).json({
            error: `Feature '${featureName}' requires ${feature.required_tier} subscription`,
            requiredTier: feature.required_tier,
            currentTier: req.user.subscriptionTier,
          });
        }
      }

      req.feature = feature;
      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({ error: 'Failed to check feature access' });
    }
  };
};

/**
 * Verify ownership of a resource
 * This middleware provides explicit ownership checks when needed
 */
const verifyOwnership = (resourceField = 'user_id') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For routes like /api/quizzes/:id, extract the resource ID
    const resourceId = req.params.id;
    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID required' });
    }

    try {
      // Determine table name from route
      const path = req.path.split('/');
      const resource = path[path.length - 2]; // e.g., 'quizzes' from /api/quizzes/:id
      const tableName = resource; // e.g., 'quizzes'

      // For security, validate table name against known tables
      const validTables = ['quizzes', 'notes', 'teaching_sessions', 'weakness_quizzes', 'quiz_attempts'];
      if (!validTables.includes(tableName)) {
        return res.status(400).json({ error: 'Invalid resource type' });
      }

      // Query Supabase to check ownership
      const { data: result, error } = await supabase
        .from(tableName)
        .select('user_id')
        .eq('id', resourceId)
        .single();

      if (error || !result) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Verify user owns the resource
      if (result.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized: You do not own this resource' });
      }

      next();
    } catch (error) {
      console.error('Ownership verification error:', error);
      res.status(500).json({ error: 'Failed to verify ownership' });
    }
  };
};

/**
 * Optional authentication (allows both authenticated and unauthenticated users)
 * Populates req.user if token exists, otherwise continues
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without user
    }

    // Verify token with jsonwebtoken
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(); // Continue without user
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.id)
      .single();

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', decoded.id)
      .single();

    req.user = {
      id: decoded.id,
      email: userProfile?.email,
      username: userProfile?.username || decoded.username,
      fullName: userProfile?.full_name,
      avatarUrl: userProfile?.avatar_url,
      subscriptionTier: subscription?.tier || userProfile?.subscription_tier || 'free',
      subscription_tier: subscription?.tier || userProfile?.subscription_tier || 'free',
      subscriptionStatus: subscription?.status || 'active',
    };

    next();
  } catch (error) {
    // Silently continue
    next();
  }
};

module.exports = {
  authenticateToken,
  checkSubscriptionTier,
  checkFeatureAccess,
  verifyOwnership,
  optionalAuth,
};
