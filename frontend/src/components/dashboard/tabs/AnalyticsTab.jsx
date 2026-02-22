import { motion } from 'framer-motion';
import { Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PerformanceChart from '../analytics/PerformanceChart';
import WeakTopicsCard from '../analytics/WeakTopicsCard';
import StudyInsights from '../analytics/StudyInsights';
import useSound from '../../../hooks/useSound';

/**
 * Analytics Tab - Performance charts and insights
 * Shows trends, weak areas, and study patterns
 * Pro+ feature (gated for Free users)
 * USES REAL DATA ONLY
 */
export const AnalyticsTab = ({ tier = 'free', recentAttempts = [], quizzes = [], notes = [] }) => {
  const navigate = useNavigate();
  const { playClickSound } = useSound();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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

  // Generate performance data from REAL quiz attempts
  const performanceData = recentAttempts.length > 0
    ? recentAttempts.slice(0, 7).reverse().map(attempt => ({
        date: new Date(attempt.completedAt || attempt.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: attempt.percentage || 0
      }))
    : [];

  // Calculate real stats from quiz history
  const avgScore = recentAttempts.length > 0
    ? Math.round(recentAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / recentAttempts.length)
    : 0;

  const totalStudyTime = recentAttempts.length > 0
    ? Math.round(recentAttempts.reduce((sum, a) => sum + (a.timeSpent || 0), 0) / 60)
    : 0;

  const handleUpgrade = () => {
    playClickSound();
    navigate('/pricing');
  };

  const isFree = tier === 'free';

  if (isFree) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Blurred Preview */}
        <motion.div variants={itemVariants} className="relative">
          <div className="blur-sm pointer-events-none opacity-50">
            {performanceData.length > 0 && <PerformanceChart data={performanceData} />}
            {performanceData.length === 0 && (
              <div className="h-80 bg-white rounded-xl border-2 border-border flex items-center justify-center">
                <p className="text-slate">No quiz data yet</p>
              </div>
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgrade}
              className="px-6 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-white font-black rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Upgrade to Pro for Analytics
            </motion.button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          variants={itemVariants}
          className="bg-brand-50 rounded-xl sm:rounded-2xl border-2 border-brand-200 p-6 sm:p-8 text-center"
        >
          <h3 className="text-xl sm:text-2xl font-black text-brand-900 mb-3">Analytics Coming Soon</h3>
          <p className="text-sm sm:text-base text-brand-700 font-bold mb-6">
            Unlock detailed performance charts, weak area analysis, and study insights with Pro
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpgrade}
            className="px-6 py-3 bg-gradient-to-r from-brand-400 to-brand-500 text-white font-black rounded-xl hover:from-brand-500 hover:to-brand-600 transition-all"
          >
            See Pro Features
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Pro/Premium view with REAL data
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8"
    >
      {/* Performance Chart - only show if has data */}
      {performanceData.length > 0 && (
        <motion.div variants={itemVariants}>
          <PerformanceChart data={performanceData} />
        </motion.div>
      )}

      {/* No Data State */}
      {performanceData.length === 0 && (
        <motion.div variants={itemVariants} className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-xl font-black text-ink mb-2">No Quiz Data Yet</h3>
          <p className="text-slate font-bold">Complete some quizzes to see your performance analytics</p>
        </motion.div>
      )}

      {/* Study Stats */}
      {recentAttempts.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-black text-ink mb-4">Average Score</h3>
            <div className="text-4xl font-black text-brand-500 mb-2">{avgScore}%</div>
            <p className="text-sm text-slate font-bold">From {recentAttempts.length} quizzes</p>
          </div>

          <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-black text-ink mb-4">Total Study Time</h3>
            <div className="text-4xl font-black text-gold mb-2">{totalStudyTime}m</div>
            <p className="text-sm text-slate font-bold">Across all quizzes</p>
          </div>
        </motion.div>
      )}

      {/* Study Insights */}
      {recentAttempts.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-xl sm:text-2xl font-black text-ink mb-4">Study Insights</h2>
          <StudyInsights />
        </motion.div>
      )}
    </motion.div>
  );
};

export default AnalyticsTab;
