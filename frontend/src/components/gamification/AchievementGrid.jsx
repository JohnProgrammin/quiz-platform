import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

/**
 * Achievement Grid Component
 * Displays locked/unlocked achievements with hover animations
 */
export const AchievementGrid = ({ achievements = [], limit = 9 }) => {
  const displayAchievements = achievements.slice(0, limit);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      className="bg-white rounded-xl p-6 border border-gray-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900">Achievements</h3>
        <p className="text-sm text-gray-600">
          {achievements.filter((a) => a.unlocked).length} of {achievements.length} unlocked
        </p>
      </div>

      <motion.div
        className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {displayAchievements.map((achievement) => (
          <Tooltip key={achievement.id} content={achievement.unlocked ? achievement.name : 'Locked'}>
            <motion.div
              variants={itemVariants}
              whileHover={achievement.unlocked ? { scale: 1.1, rotate: 5 } : {}}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg cursor-help transition-colors ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-brand-50 to-brand-50 border-2 border-brand-200'
                  : 'bg-gray-100 border-2 border-gray-200'
              }`}
            >
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  achievement.unlocked
                    ? `bg-gradient-to-br ${achievement.color || 'from-brand-400 to-brand-400'}`
                    : 'bg-gray-400'
                }`}
                animate={achievement.unlocked ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                {achievement.unlocked ? (
                  <Trophy className="w-6 h-6 text-white" fill="currentColor" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-600" />
                )}
              </motion.div>

              <span
                className={`text-xs font-semibold text-center ${
                  achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
                }`}
              >
                {achievement.unlocked ? achievement.name : '?'}
              </span>

              {achievement.unlocked && achievement.xpReward && (
                <motion.span
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-brand-600 font-bold"
                >
                  +{achievement.xpReward} XP
                </motion.span>
              )}
            </motion.div>
          </Tooltip>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default AchievementGrid;
