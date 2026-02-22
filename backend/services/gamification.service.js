/**
 * Gamification Service
 * Handles XP awards, level progression, streaks, and achievements
 */

const { supabase } = require('../config/database.serverless');

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
    // 1. Get current stats first to increment correctly
    const { data: currentStats } = await supabase
      .from('user_gamification')
      .select('total_xp, level')
      .eq('user_id', userId)
      .single();

    let newTotalXP = amount;
    let oldLevel = 1;

    if (currentStats) {
      newTotalXP = (currentStats.total_xp || 0) + amount;
      oldLevel = currentStats.level;

      // Update existing
      const { error: updateError } = await supabase
        .from('user_gamification')
        .update({
          total_xp: newTotalXP,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw new Error(updateError.message);
    } else {
      // Insert new
      const { error: insertError } = await supabase
        .from('user_gamification')
        .insert({
          user_id: userId,
          total_xp: amount,
          level: 1
        });

      if (insertError) throw new Error(insertError.message);
    }

    // Log transaction
    await supabase
      .from('xp_transactions')
      .insert([{
        user_id: userId,
        amount: amount,
        reason: reason,
        metadata: JSON.stringify(metadata)
      }]);

    // Recalculate level
    const newLevel = calculateLevelFromXP(newTotalXP);
    const leveledUp = newLevel > oldLevel;

    // Update level if leveled up
    if (leveledUp) {
      await supabase
        .from('user_gamification')
        .update({ level: newLevel })
        .eq('user_id', userId);

      // Check achievements
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
    // Don't throw, just return partial info so quiz doesn't fail
    return {
      xpAwarded: amount,
      leveledUp: false,
      newLevel: 1,
      totalXP: amount,
      nextLevelXP: 0,
      currentProgress: 0,
      error: error.message
    };
  }
};

// NOTE: This function is defined again below with better implementation
// Keeping this here as placeholder for reference

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
    const { data: result, error: selectError } = await supabase
      .from('user_gamification')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .single();

    if (selectError || !result) {
      // If user has no record, create one with streak 1
      await exports.awardXP(userId, 0, 'Streak Initialization');
      return 1;
    }

    const { current_streak: oldStreak, longest_streak: longestStreak, last_activity_date: lastDate } = result;
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
    const { error: updateError } = await supabase
      .from('user_gamification')
      .update({
        current_streak: newStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today.toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error(updateError.message);
    }

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
      const { data: achievementResult, error: achieveError } = await supabase
        .from('achievements')
        .select('id')
        .eq('key', key)
        .single();

      if (achieveError || !achievementResult) continue;

      const achievementId = achievementResult.id;

      // Check if already unlocked
      const { data: existing, error: existError } = await supabase
        .from('user_achievements')
        .select('id')
        .eq('user_id', userId)
        .eq('achievement_id', achievementId)
        .single();

      if (!existError && existing) continue; // Already unlocked

      // Unlock achievement
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert([{
          user_id: userId,
          achievement_id: achievementId
        }]);

      if (insertError) {
        console.warn('Failed to insert achievement:', insertError);
      }
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
    const { data: achievementResult, error: achieveError } = await supabase
      .from('achievements')
      .select('id, xp_reward')
      .eq('key', achievementKey)
      .single();

    if (achieveError || !achievementResult) {
      return null; // Achievement doesn't exist
    }

    const { id: achievementId, xp_reward: xpReward } = achievementResult;

    // Check if already unlocked
    const { data: existing, error: existError } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (!existError && existing) {
      return null; // Already unlocked
    }

    // Unlock achievement
    const { error: insertError } = await supabase
      .from('user_achievements')
      .insert([{
        user_id: userId,
        achievement_id: achievementId
      }]);

    if (insertError) {
      throw new Error(insertError.message);
    }

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
    const { data: gameResult, error: gameError } = await supabase
      .from('user_gamification')
      .select('total_xp, level, current_streak, longest_streak, last_activity_date, created_at')
      .eq('user_id', userId)
      .single();

    if (gameError || !gameResult) {
      return null;
    }

    const stats = gameResult;
    const nextLevelXP = calculateXpForLevel(stats.level + 1);
    const progress = getProgressToNextLevel(stats.total_xp, stats.level);

    // Get achievements
    const { data: achievementsResult, error: achieveError } = await supabase
      .from('user_achievements')
      .select('achievements(key, name, description, icon, tier, xp_reward), unlocked_at')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (achieveError) {
      console.error('Error fetching achievements:', achieveError);
    }

    return {
      totalXP: stats.total_xp,
      level: stats.level,
      currentStreak: stats.current_streak,
      longestStreak: stats.longest_streak,
      lastActivityDate: stats.last_activity_date,
      createdAt: stats.created_at,
      nextLevelXP,
      progressToNextLevel: progress,
      achievements: (achievementsResult || []).map(ua => ({
        ...ua.achievements,
        unlocked_at: ua.unlocked_at
      })),
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
    const { data: result, error } = await supabase
      .from('user_gamification')
      .select(`
        user_id,
        level,
        total_xp,
        current_streak,
        longest_streak,
        users(id, username),
        user_achievements(id)
      `)
      .order('level', { ascending: false })
      .order('total_xp', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    // Transform the result to match expected format
    return (result || []).map(row => ({
      id: row.users?.id,
      username: row.users?.username,
      level: row.level,
      total_xp: row.total_xp,
      current_streak: row.current_streak,
      longest_streak: row.longest_streak,
      achievement_count: (row.user_achievements || []).length
    }));
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
    const { data: result, error } = await supabase
      .from('user_gamification')
      .insert([{
        user_id: userId
      }], { onConflict: 'user_id' })
      .select('id');

    if (error && !error.message.includes('duplicate')) {
      throw new Error(error.message);
    }

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
