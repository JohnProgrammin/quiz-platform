/**
 * Gamification Controller
 * Handles user stats, leaderboard, and achievement endpoints
 */

const { supabase } = require('../config/database.serverless');
const gamificationService = require('../services/gamification.service');

/**
 * GET /api/v1/gamification/stats
 * Get current user's gamification stats
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Try to get existing stats
    let stats = await gamificationService.getUserStats(userId);

    // If user doesn't exist yet, initialize them
    if (!stats) {
      await gamificationService.initializeUser(userId);
      stats = await gamificationService.getUserStats(userId);
    }

    // Return stats with defaults if still null
    const defaultStats = {
      level: 1,
      totalXP: 0,
      currentStreak: 0,
      longestStreak: 0,
      nextLevelXP: 100,
      progressToNextLevel: 0,
      achievements: [],
    };

    res.json({
      success: true,
      data: stats || defaultStats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    // Return defaults on error instead of 500
    res.json({
      success: true,
      data: {
        level: 1,
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        nextLevelXP: 100,
        progressToNextLevel: 0,
        achievements: [],
      },
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
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('id, key, name, description, icon, tier, xp_reward')
      .order('tier', { ascending: true })
      .order('xp_reward', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

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
