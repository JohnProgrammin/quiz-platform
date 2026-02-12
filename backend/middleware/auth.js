const jwt = require('jsonwebtoken');
const { sql } = require('../config/database.serverless');
require('dotenv').config();

/**
 * Authentication Middleware
 * Handles JWT token verification and user identity verification
 */

/**
 * Verify JWT token and attach user to request
 * Checks:
 * - Token exists in Authorization header
 * - Token is valid and not expired
 * - User exists in database
 * - User's subscription status is valid
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Validate JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error('CRITICAL: JWT_SECRET environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
      }

      try {
        // Get user from database to verify they still exist and get fresh data
        let users;
        try {
          users = await sql`
            SELECT id, username, email, full_name, subscription_tier, subscription_status,
                   monthly_quiz_count, monthly_quiz_reset_at, created_at
            FROM users WHERE id = ${decoded.id}
          `;
        } catch (dbError) {
          console.error('Database query error in auth:', {
            userId: decoded.id,
            error: dbError.message,
            code: dbError.code,
          });
          // If database fails, return specific error
          return res.status(503).json({
            error: 'Database connection failed. Please try again.',
            details: dbError.message
          });
        }

        const user = users[0] || null;

        if (!user) {
          console.warn('User not found in database:', { userId: decoded.id });
          return res.status(404).json({ error: 'User not found in database' });
        }

        // Check if subscription is valid
        if (user.subscription_status && !['active', 'trialing'].includes(user.subscription_status)) {
          return res.status(403).json({
            error: 'Subscription is not active',
            status: user.subscription_status,
          });
        }

        // Attach user to request for use in controllers
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          subscriptionTier: user.subscription_tier || 'free',
          subscriptionStatus: user.subscription_status || 'active',
          monthlyQuizCount: user.monthly_quiz_count || 0,
          monthlyQuizResetAt: user.monthly_quiz_reset_at,
          createdAt: user.created_at,
        };

        next();
      } catch (error) {
        console.error('Unexpected auth middleware error:', {
          message: error.message,
          stack: error.stack,
        });
        res.status(500).json({ error: 'Authentication error', details: error.message });
      }
    });
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
      // Get feature from database
      const features = await sql`
        SELECT required_tier FROM feature_flags WHERE flag_name = ${featureName} AND enabled = true
      `;
      const feature = features[0] || null;

      if (!feature) {
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
 * Ensures user can only access their own resources
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
      const table = resource.slice(0, -1); // Remove trailing 's' for table name

      // For security, validate table name against known tables
      const validTables = ['quiz', 'note', 'teaching_session', 'weakness_quiz'];
      if (!validTables.includes(table)) {
        return res.status(400).json({ error: 'Invalid resource type' });
      }

      // Query database to check ownership
      // Note: Using separate queries for each table to avoid SQL injection
      let result;
      try {
        if (table === 'quiz') {
          result = await sql`SELECT user_id FROM quizzes WHERE id = ${resourceId}`;
        } else if (table === 'note') {
          result = await sql`SELECT user_id FROM notes WHERE id = ${resourceId}`;
        } else if (table === 'teaching_session') {
          result = await sql`SELECT user_id FROM teaching_sessions WHERE id = ${resourceId}`;
        } else if (table === 'weakness_quiz') {
          result = await sql`SELECT user_id FROM weakness_quizzes WHERE id = ${resourceId}`;
        }
      } catch (error) {
        console.error('Database query error:', error);
        return res.status(500).json({ error: 'Failed to verify ownership' });
      }

      if (!result || result.length === 0) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Verify user owns the resource
      if (result[0].user_id !== req.user.id) {
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
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return next(); // Continue without user
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production', (err, decoded) => {
      if (err) {
        return next(); // Continue without user
      }

      req.user = decoded;
      next();
    });
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
