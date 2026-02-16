import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import Tooltip from '../ui/Tooltip';

/**
 * Streak Indicator Component
 * Shows current streak with animated flame and statistics
 */
export const StreakIndicator = ({ currentStreak = 0, longestStreak = 0, lastActivityDate }) => {
  const hasActiveStreak = currentStreak > 0;

  // Flame animation: bigger and more intense for higher streaks
  const flameVariants = {
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20,
      },
    },
  };

  const flameHover = {
    scale: hasActiveStreak ? [1, 1.2, 1] : 1,
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 2,
    },
  };

  return (
    <Tooltip content={`Current streak: ${currentStreak} days | Longest: ${longestStreak} days`}>
      <motion.div
        className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-100 cursor-help"
        whileHover={{ boxShadow: '0 4px 12px rgba(249, 115, 22, 0.2)' }}
      >
        {/* Flame Icon */}
        <motion.div
          variants={flameVariants}
          initial="initial"
          animate="animate"
          whileHover={flameHover}
          className="relative"
        >
          <Flame
            className={`w-8 h-8 ${
              hasActiveStreak ? 'text-orange-500 drop-shadow-lg' : 'text-gray-300'
            }`}
            fill={hasActiveStreak ? 'currentColor' : 'none'}
          />
          {currentStreak >= 7 && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="absolute inset-0 border-2 border-orange-500 rounded-full opacity-20"
            />
          )}
        </motion.div>

        {/* Text Content */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{currentStreak}</span>
            <span className="text-sm font-medium text-gray-600">day streak</span>
          </div>
          {currentStreak > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-gray-500 mt-1"
            >
              🎉 Keep it going!
            </motion.p>
          )}
        </div>
      </motion.div>
    </Tooltip>
  );
};

export default StreakIndicator;
