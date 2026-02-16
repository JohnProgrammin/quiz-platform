import { motion } from 'framer-motion';
import { Crown, Sparkles } from 'lucide-react';

/**
 * Level Badge Component
 * Shows level with celebration animation (for level-up events)
 */
export const LevelBadge = ({ level = 1, isNew = false, className = '' }) => {
  // Get color based on level
  const getLevelColor = (lvl) => {
    if (lvl < 5) return 'from-blue-400 to-blue-600';
    if (lvl < 10) return 'from-purple-400 to-purple-600';
    if (lvl < 20) return 'from-pink-400 to-pink-600';
    if (lvl < 50) return 'from-orange-400 to-orange-600';
    return 'from-yellow-400 to-yellow-600';
  };

  const getLevelTitle = (lvl) => {
    if (lvl < 5) return 'Beginner';
    if (lvl < 10) return 'Scholar';
    if (lvl < 20) return 'Expert';
    if (lvl < 50) return 'Master';
    return 'Legend';
  };

  return (
    <motion.div
      className={`flex flex-col items-center gap-2 ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Crown Icon (for higher levels) */}
      {level >= 10 && (
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Crown className="w-6 h-6 text-yellow-500" fill="currentColor" />
        </motion.div>
      )}

      {/* Level Badge */}
      <motion.div
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${getLevelColor(
          level
        )} shadow-lg flex items-center justify-center`}
        animate={
          isNew
            ? {
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }
            : {}
        }
        transition={{ duration: 0.6, repeat: isNew ? 3 : 0 }}
      >
        <span className="text-4xl font-bold text-white">{level}</span>

        {/* Sparkles for new level */}
        {isNew && (
          <>
            <motion.div
              className="absolute -top-2 -right-2 text-yellow-300"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={20} />
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-2 text-yellow-300"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles size={20} />
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Level Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-sm font-semibold text-gray-600">{getLevelTitle(level)}</p>
        <p className="text-xs text-gray-500">Level {level}</p>
      </motion.div>

      {/* Celebration text */}
      {isNew && (
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
        >
          🎉 Level Up! 🎉
        </motion.p>
      )}
    </motion.div>
  );
};

export default LevelBadge;
