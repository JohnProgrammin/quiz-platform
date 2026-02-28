const express = require('express');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');
const { checkFeatureAccess } = require('../middleware/featureGate');
const teachingController = require('../controllers/teaching.controller');

const router = express.Router();

/**
 * Teaching Routes
 * Base: /api/v1/teaching
 */

// Rate limiters
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 messages per minute per user
  message: { error: 'Too many messages. Please wait before sending more.' },
  keyGenerator: (req) => req.user?.id || req.ip,
  standardHeaders: true,
  legacyHeaders: false,
});

const sessionRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 20, // 20 sessions per day per user
  message: { error: 'Session limit reached. Try again tomorrow.' },
  keyGenerator: (req) => req.user?.id || req.ip,
});

// ==================== AI Teaching Chat routes (Premium only) ====================

// Create new teaching session (Premium)
router.post(
  '/sessions',
  authenticateToken,
  checkFeatureAccess('ai_teaching_chat'),
  sessionRateLimiter,
  teachingController.createSession
);

// List all user's teaching sessions (Premium)
router.get(
  '/sessions',
  authenticateToken,
  checkFeatureAccess('ai_teaching_chat'),
  teachingController.listSessions
);

// Get specific session with full conversation history (Premium)
router.get(
  '/sessions/:id',
  authenticateToken,
  checkFeatureAccess('ai_teaching_chat'),
  teachingController.getSession
);

// Send message in a session (Premium) - CRITICAL ENDPOINT
router.post(
  '/sessions/:id/messages',
  authenticateToken,
  checkFeatureAccess('ai_teaching_chat'),
  chatRateLimiter,
  teachingController.sendMessage
);

// Update session status (Premium)
router.patch(
  '/sessions/:id/status',
  authenticateToken,
  checkFeatureAccess('ai_teaching_chat'),
  teachingController.updateSessionStatus
);

module.exports = router;
