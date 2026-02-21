import { motion } from 'framer-motion';
import { TrendingUp, Award, Flame, BookOpen } from 'lucide-react';
import { staggerContainer, staggerItem, celebrate } from '../../lib/animations';

/**
 * Weekly Review Component
 * Summary of the user's weekly performance and highlights
 */
export const WeeklyReview = ({ week = 'This Week' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-gradient-to-br from-brand-50 via-brand-50 to-brand-50 rounded-xl p-6 border-2 border-brand-200 shadow-sm"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-gray-900">Weekly Review</h3>
          <motion.span
            variants={celebrate}
            initial="initial"
            animate="animate"
            className="text-3xl"
          >
            🎯
          </motion.span>
        </div>
        <p className="text-gray-600">{week}</p>
      </div>

      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Quizzes Completed */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-lg p-4 border border-brand-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-between mb-2">
            <BookOpen className="w-5 h-5 text-brand-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">18</p>
          <p className="text-xs text-gray-600 mt-1">Quizzes</p>
        </motion.div>

        {/* XP Earned */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-lg p-4 border border-yellow-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">1,250</p>
          <p className="text-xs text-gray-600 mt-1">XP Gained</p>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-lg p-4 border border-orange-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Flame className="w-5 h-5 text-orange-600" fill="currentColor" />
          </div>
          <p className="text-3xl font-bold text-gray-900">7</p>
          <p className="text-xs text-gray-600 mt-1">Days Streak</p>
        </motion.div>

        {/* Avg Score */}
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-lg p-4 border border-green-200"
          whileHover={{ scale: 1.05 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">88%</p>
          <p className="text-xs text-gray-600 mt-1">Avg Score</p>
        </motion.div>
      </motion.div>

      {/* Highlights */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        <motion.div
          variants={staggerItem}
          className="bg-white rounded-lg p-4 border-l-4 border-l-brand-600"
        >
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <span>🏆</span> Achievement Unlocked
          </p>
          <p className="text-sm text-gray-600 mt-1">
            You achieved a 7-day streak! Keep it up to become a learning legend.
          </p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-lg p-4 border-l-4 border-l-green-600"
        >
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <span>📈</span> Performance Boost
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Your average score improved by 5% compared to last week. You're getting stronger!
          </p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="bg-white rounded-lg p-4 border-l-4 border-l-brand-600"
        >
          <p className="font-semibold text-gray-900 flex items-center gap-2">
            <span>💡</span> Learning Insight
          </p>
          <p className="text-sm text-gray-600 mt-1">
            You perform best in Biology. Consider mastering Science next!
          </p>
        </motion.div>
      </motion.div>

      {/* Motivation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 p-4 rounded-lg bg-gradient-to-r from-brand-100 to-brand-100 text-center"
      >
        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-600">
          Keep the momentum going! You're crushing it! 💪
        </p>
      </motion.div>
    </motion.div>
  );
};

export default WeeklyReview;
