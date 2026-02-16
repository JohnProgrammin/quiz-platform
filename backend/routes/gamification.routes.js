const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const gamificationController = require('../controllers/gamification.controller');

const router = express.Router();

/**
 * Gamification Routes
 * Base: /api/v1/gamification
 */

// Get current user's gamification stats (requires auth)
router.get('/stats', authenticateToken, gamificationController.getUserStats);

// Get global leaderboard (public)
router.get('/leaderboard', gamificationController.getLeaderboard);

// Get all achievements catalog (public)
router.get('/achievements', gamificationController.getAchievements);

module.exports = router;
