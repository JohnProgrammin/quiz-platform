/**
 * Gamification Controller
 * Handles user stats, leaderboard, and achievement endpoints
 */

const gamificationService = require('../services/gamification.service');

/**
 * GET /api/v1/gamification/stats
 * Get current user's gamification stats
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await gamificationService.getUserStats(userId);

    if (!stats) {
      return res.status(404).json({
        error: 'User gamification stats not found',
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      error: 'Failed to fetch gamification stats',
    });
  }
};

/**
 * GET /api/v1/gamification/leaderboard
 * Get global leaderboard (top 100 users)
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const leaderboard = await gamificationService.getLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      error: 'Failed to fetch leaderboard',
    });
  }
};

/**
 * GET /api/v1/gamification/achievements
 * Get all available achievements
 */
exports.getAchievements = async (req, res) => {
  try {
    const sql = require('../db');

    const achievements = await sql`
      SELECT
        id,
        key,
        name,
        description,
        icon,
        tier,
        xp_reward
      FROM achievements
      ORDER BY tier ASC, xp_reward DESC
    `;

    res.json({
      success: true,
      data: achievements || [],
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({
      error: 'Failed to fetch achievements',
    });
  }
};
