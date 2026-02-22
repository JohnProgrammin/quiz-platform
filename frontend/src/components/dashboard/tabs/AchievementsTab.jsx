import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Zap } from 'lucide-react';
import AchievementCard from '../achievements/AchievementCard';
import useSound from '../../../hooks/useSound';

/**
 * Achievements Tab - Badge collection
 * Displays unlocked and locked achievements with filtering
 */
export const AchievementsTab = ({ achievements = [] }) => {
  const { playClickSound } = useSound();
  const [filter, setFilter] = useState('all');

  // Mock achievements if none provided
  const mockAchievements = [
    {
      id: 1,
      name: 'First Steps',
      description: 'Complete your first quiz',
      icon: '🚀',
      tier: 'bronze',
      xpReward: 10,
      unlocked: true,
      unlockedAt: '2026-02-10T10:00:00Z',
    },
    {
      id: 2,
      name: 'Perfect Score',
      description: 'Score 100% on any quiz',
      icon: '💯',
      tier: 'silver',
      xpReward: 50,
      unlocked: true,
      unlockedAt: '2026-02-15T14:30:00Z',
    },
    {
      id: 3,
      name: 'On Fire',
      description: 'Achieve a 7-day streak',
      icon: '🔥',
      tier: 'gold',
      xpReward: 75,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: 4,
      name: 'Quiz Master',
      description: 'Complete 50 quizzes',
      icon: '🎓',
      tier: 'platinum',
      xpReward: 250,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: 5,
      name: 'Speed Demon',
      description: 'Complete a quiz in under 2 minutes',
      icon: '⚡',
      tier: 'silver',
      xpReward: 30,
      unlocked: true,
      unlockedAt: '2026-02-18T09:00:00Z',
    },
    {
      id: 6,
      name: 'Level 5',
      description: 'Reach level 5',
      icon: '⭐',
      tier: 'gold',
      xpReward: 50,
      unlocked: false,
      unlockedAt: null,
    },
    {
      id: 7,
      name: 'Knowledge Seeker',
      description: 'Create 10 quizzes',
      icon: '📚',
      tier: 'bronze',
      xpReward: 20,
      unlocked: true,
      unlockedAt: '2026-02-12T11:00:00Z',
    },
    {
      id: 8,
      name: 'Legend',
      description: 'Reach level 10',
      icon: '👑',
      tier: 'platinum',
      xpReward: 500,
      unlocked: false,
      unlockedAt: null,
    },
  ];

  const allAchievements = achievements.length > 0 ? achievements : mockAchievements;

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length;
  const totalCount = allAchievements.length;

  const filterButtons = [
    { id: 'all', label: 'All', icon: null },
    { id: 'unlocked', label: 'Unlocked', icon: <Trophy className="w-4 h-4" /> },
    { id: 'locked', label: 'Locked', icon: <Lock className="w-4 h-4" /> },
  ];

  const filteredAchievements = allAchievements.filter((ach) => {
    if (filter === 'unlocked') return ach.unlocked;
    if (filter === 'locked') return !ach.unlocked;
    return true;
  });

  const handleFilterClick = (filterId) => {
    playClickSound();
    setFilter(filterId);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 md:space-y-10"
    >
      {/* Header Stats */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-ink mb-2">Achievements</h2>
          <p className="text-xs sm:text-sm text-slate font-bold">
            {unlockedCount}/{totalCount} unlocked ({Math.round((unlockedCount / totalCount) * 100)}%)
          </p>
        </div>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl font-black text-gradient-violet bg-gradient-to-r from-violet-500 to-violet-600 bg-clip-text text-transparent">
            {allAchievements.reduce((sum, a) => sum + (a.unlocked ? a.xpReward : 0), 0)}
          </div>
          <p className="text-xs text-muted font-black uppercase">XP Earned</p>
        </div>
      </motion.div>

      {/* Filter Buttons */}
      <motion.div variants={itemVariants} className="flex gap-2 flex-wrap">
        {filterButtons.map((btn) => (
          <motion.button
            key={btn.id}
            onClick={() => handleFilterClick(btn.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 sm:px-5 py-2 rounded-lg sm:rounded-xl md:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all flex-shrink-0 ${
              filter === btn.id
                ? 'bg-violet-600 text-white shadow-btn-violet'
                : 'bg-white border-2 border-border text-slate hover:bg-surface hover:border-brand-400'
            }`}
          >
            {btn.icon}
            {btn.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Achievement Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
      >
        {filteredAchievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * idx }}
          >
            <AchievementCard {...achievement} />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredAchievements.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center py-16 px-4"
        >
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-black text-ink mb-2">No Achievements Yet</h3>
          <p className="text-slate font-bold text-center max-w-md">
            {filter === 'unlocked'
              ? "You haven't unlocked any achievements yet. Keep taking quizzes!"
              : filter === 'locked'
              ? 'Work towards these achievements by taking quizzes and building streaks!'
              : 'No achievements found.'}
          </p>
        </motion.div>
      )}

      {/* Progress Info */}
      <motion.div
        variants={itemVariants}
        className="bg-violet-50 rounded-xl sm:rounded-2xl border-2 border-violet-200 p-5 sm:p-6"
      >
        <h3 className="text-base sm:text-lg font-black text-violet-900 mb-4">Achievement Progress</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-bold text-violet-700">Completion</span>
            <span className="font-black text-violet-900">{Math.round((unlockedCount / totalCount) * 100)}%</span>
          </div>
          <div className="w-full h-3 bg-violet-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-600"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-sm text-violet-700 font-bold">
            {totalCount - unlockedCount} achievement{totalCount - unlockedCount !== 1 ? 's' : ''} remaining
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AchievementsTab;
