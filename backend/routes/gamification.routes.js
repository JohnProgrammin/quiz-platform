const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { rateLimiter } = require('../middleware/rateLimiter');
const gamificationController = require('../controllers/gamification.controller');

const router = express.Router();

/**
 * Gamification Routes
 * Base: /api/v1/gamification
 */

// Get current user's gamification stats (requires auth)
router.get('/stats', authenticateToken, rateLimiter(100), gamificationController.getUserStats);

// Get global leaderboard (public, rate limited)
router.get('/leaderboard', rateLimiter(50), gamificationController.getLeaderboard);

// Get all achievements catalog (public, rate limited)
router.get('/achievements', rateLimiter(50), gamificationController.getAchievements);

module.exports = router;
