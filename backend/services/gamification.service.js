/**
 * Gamification Service
 * Handles XP awards, level progression, streaks, and achievements
 */

const sql = require('../db');

// XP reward constants
const XP_REWARDS = {
  QUIZ_COMPLETE: 10,
  GOOD_SCORE: 15, // 80-99%
  PERFECT_SCORE: 25, // 100%
  SPEED_DEMON: 20, // Complete in <2 minutes
  DAILY_STREAK_BONUS: 5,
};

// Level progression: XP needed to reach next level (exponential)
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 250 XP, etc.
const calculateXpForLevel = (level) => {
  if (level <= 1) return 0;
  return Math.floor(level * level * 100 - 100);
};

/**
 * Calculate level from total XP
 */
const calculateLevelFromXP = (totalXP) => {
  let level = 1;
  while (calculateXpForLevel(level + 1) <= totalXP) {
    level++;
  }
  return level;
};

/**
 * Calculate XP progress to next level (0-100%)
 */
const getProgressToNextLevel = (totalXP, currentLevel) => {
  const currentLevelXP = calculateXpForLevel(currentLevel);
  const nextLevelXP = calculateXpForLevel(currentLevel + 1);

  const xpInCurrentLevel = totalXP - currentLevelXP;
  const xpNeededForLevel = nextLevelXP - currentLevelXP;

  return Math.min(100, Math.max(0, Math.floor((xpInCurrentLevel / xpNeededForLevel) * 100)));
};

/**
 * Award XP to user and check for level up
 * Returns: { xpAwarded, leveledUp, newLevel, totalXP }
 */
exports.awardXP = async (userId, amount, reason, metadata = {}) => {
  try {
    // Award XP
    await sql`
      UPDATE user_gamification
      SET total_xp = total_xp + ${amount}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;

    // Log transaction
    await sql`
      INSERT INTO xp_transactions (user_id, amount, reason, metadata)
      VALUES (${userId}, ${amount}, ${reason}, ${JSON.stringify(metadata)})
    `;

    // Get updated stats
    const result = await sql`
      SELECT total_xp, level FROM user_gamification WHERE user_id = ${userId}
    `;

    if (!result || result.length === 0) {
      throw new Error('User gamification record not found');
    }

    const { total_xp: newTotalXP } = result[0];
    const newLevel = calculateLevelFromXP(newTotalXP);
    const oldLevel = result[0].level;
    const leveledUp = newLevel > oldLevel;

    // Update level if leveled up
    if (leveledUp) {
      await sql`
        UPDATE user_gamification
        SET level = ${newLevel}, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ${userId}
      `;

      // Unlock "level_X" achievements
      await checkAchievements(userId, [
        { key: 'level_5', condition: newLevel >= 5 },
        { key: 'level_10', condition: newLevel >= 10 },
        { key: 'level_25', condition: newLevel >= 25 },
      ]);
    }

    return {
      xpAwarded: amount,
      leveledUp,
      newLevel,
      totalXP: newTotalXP,
      nextLevelXP: calculateXpForLevel(newLevel + 1),
      currentProgress: getProgressToNextLevel(newTotalXP, newLevel),
    };
  } catch (error) {
    console.error('Error awarding XP:', error);
    throw error;
  }
};

/**
 * Update user's daily streak
 * Increments streak if they completed a quiz today
 * Resets if last activity was >1 day ago
 */
exports.updateStreak = async (userId) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get current streak info
    const result = await sql`
      SELECT current_streak, longest_streak, last_activity_date
      FROM user_gamification
      WHERE user_id = ${userId}
    `;

    if (!result || result.length === 0) {
      throw new Error('User gamification record not found');
    }

    const { current_streak: oldStreak, longest_streak: longestStreak, last_activity_date: lastDate } = result[0];
    let newStreak = oldStreak;
    let newLongestStreak = longestStreak;

    if (!lastDate) {
      // First activity
      newStreak = 1;
      newLongestStreak = 1;
    } else {
      const lastActivity = new Date(lastDate);
      const lastActivityDay = new Date(lastActivity.getFullYear(), lastActivity.getMonth(), lastActivity.getDate());
      const daysDiff = Math.floor((today - lastActivityDay) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        // Same day, don't increment
        newStreak = oldStreak;
      } else if (daysDiff === 1) {
        // Consecutive day, increment
        newStreak = oldStreak + 1;
        newLongestStreak = Math.max(newStreak, longestStreak);
      } else {
        // Gap in activity, reset streak
        newStreak = 1;
      }
    }

    // Update database
    await sql`
      UPDATE user_gamification
      SET
        current_streak = ${newStreak},
        longest_streak = ${newLongestStreak},
        last_activity_date = ${today.toISOString().split('T')[0]},
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;

    // Check streak achievements
    await checkAchievements(userId, [
      { key: 'quiz_streak_3', condition: newStreak >= 3 },
      { key: 'quiz_streak_7', condition: newStreak >= 7 },
      { key: 'quiz_streak_30', condition: newStreak >= 30 },
      { key: 'consistency', condition: newStreak >= 7 },
    ]);

    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

/**
 * Check and unlock specific achievements
 * Internal helper function
 */
const checkAchievements = async (userId, achievements) => {
  try {
    for (const { key, condition } of achievements) {
      if (!condition) continue;

      // Get achievement ID
      const achievementResult = await sql`
        SELECT id FROM achievements WHERE key = ${key}
      `;

      if (!achievementResult || achievementResult.length === 0) continue;

      const achievementId = achievementResult[0].id;

      // Check if already unlocked
      const existing = await sql`
        SELECT id FROM user_achievements
        WHERE user_id = ${userId} AND achievement_id = ${achievementId}
      `;

      if (existing && existing.length > 0) continue; // Already unlocked

      // Unlock achievement
      await sql`
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (${userId}, ${achievementId})
      `;
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
    // Don't throw, just log - achievements are bonus
  }
};

/**
 * Check and unlock achievement by key
 * Public method called after quiz completion
 */
exports.checkAchievement = async (userId, achievementKey, metadata = {}) => {
  try {
    // Get achievement details
    const achievementResult = await sql`
      SELECT id, xp_reward FROM achievements WHERE key = ${achievementKey}
    `;

    if (!achievementResult || achievementResult.length === 0) {
      return null; // Achievement doesn't exist
    }

    const { id: achievementId, xp_reward: xpReward } = achievementResult[0];

    // Check if already unlocked
    const existing = await sql`
      SELECT id FROM user_achievements
      WHERE user_id = ${userId} AND achievement_id = ${achievementId}
    `;

    if (existing && existing.length > 0) {
      return null; // Already unlocked
    }

    // Unlock achievement
    await sql`
      INSERT INTO user_achievements (user_id, achievement_id)
      VALUES (${userId}, ${achievementId})
    `;

    // Award XP for achievement
    if (xpReward > 0) {
      await exports.awardXP(userId, xpReward, `Achievement: ${achievementKey}`, metadata);
    }

    return {
      key: achievementKey,
      unlocked: true,
      xpReward,
    };
  } catch (error) {
    console.error('Error checking achievement:', error);
    throw error;
  }
};

/**
 * Get user's complete gamification stats
 */
exports.getUserStats = async (userId) => {
  try {
    const gameResult = await sql`
      SELECT
        total_xp,
        level,
        current_streak,
        longest_streak,
        last_activity_date,
        created_at
      FROM user_gamification
      WHERE user_id = ${userId}
    `;

    if (!gameResult || gameResult.length === 0) {
      return null;
    }

    const stats = gameResult[0];
    const nextLevelXP = calculateXpForLevel(stats.level + 1);
    const progress = getProgressToNextLevel(stats.total_xp, stats.level);

    // Get achievements
    const achievementsResult = await sql`
      SELECT a.key, a.name, a.description, a.icon, a.tier, a.xp_reward, ua.unlocked_at
      FROM user_achievements ua
      JOIN achievements a ON ua.achievement_id = a.id
      WHERE ua.user_id = ${userId}
      ORDER BY ua.unlocked_at DESC
    `;

    return {
      totalXP: stats.total_xp,
      level: stats.level,
      currentStreak: stats.current_streak,
      longestStreak: stats.longest_streak,
      lastActivityDate: stats.last_activity_date,
      createdAt: stats.created_at,
      nextLevelXP,
      progressToNextLevel: progress,
      achievements: achievementsResult || [],
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

/**
 * Get leaderboard (top 100 users by level/XP)
 */
exports.getLeaderboard = async (limit = 100) => {
  try {
    const result = await sql`
      SELECT
        u.id,
        u.username,
        ug.level,
        ug.total_xp,
        ug.current_streak,
        ug.longest_streak,
        COUNT(DISTINCT ua.id) as achievement_count
      FROM user_gamification ug
      JOIN users u ON ug.user_id = u.id
      LEFT JOIN user_achievements ua ON ug.user_id = ua.user_id
      GROUP BY u.id, u.username, ug.level, ug.total_xp, ug.current_streak, ug.longest_streak
      ORDER BY ug.level DESC, ug.total_xp DESC
      LIMIT ${limit}
    `;

    return result || [];
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
};

/**
 * Initialize gamification for new user
 * Called when user signs up
 */
exports.initializeUser = async (userId) => {
  try {
    const result = await sql`
      INSERT INTO user_gamification (user_id)
      VALUES (${userId})
      ON CONFLICT (user_id) DO NOTHING
      RETURNING id
    `;
    return result && result.length > 0;
  } catch (error) {
    console.error('Error initializing user gamification:', error);
    throw error;
  }
};

// Export constants
exports.XP_REWARDS = XP_REWARDS;
exports.calculateXpForLevel = calculateXpForLevel;
exports.calculateLevelFromXP = calculateLevelFromXP;
