import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import Progress from '../ui/Progress';

/**
 * XP Bar Component
 * Shows user's XP progress towards next level with animated indicators
 */
export const XPBar = ({ currentXP = 0, xpForNextLevel = 1000, level = 1 }) => {
  const xpPercentage = (currentXP / xpForNextLevel) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Zap className="w-5 h-5 text-yellow-500" />
          </motion.div>
          <span className="font-semibold text-gray-900">Level {level}</span>
        </div>
        <span className="text-sm text-gray-600">
          {currentXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
        </span>
      </div>

      <Progress value={currentXP} max={xpForNextLevel} variant="default" showPercent={false} />

      {/* XP Milestone Indicators */}
      <div className="flex justify-between mt-3 px-1">
        {[0, 25, 50, 75, 100].map((milestone) => (
          <motion.div
            key={milestone}
            className={`w-2 h-2 rounded-full ${
              xpPercentage >= milestone ? 'bg-purple-500' : 'bg-gray-300'
            }`}
            animate={{
              scale: xpPercentage >= milestone ? [1, 1.3, 1] : 1,
            }}
            transition={{
              duration: 0.6,
              delay: xpPercentage >= milestone ? (milestone / 100) * 0.3 : 0,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default XPBar;
