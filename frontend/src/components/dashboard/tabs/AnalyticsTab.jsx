import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PerformanceChart from '../analytics/PerformanceChart';
import WeakTopicsCard from '../analytics/WeakTopicsCard';
import StudyInsights from '../analytics/StudyInsights';
import useSound from '../../../hooks/useSound';

/**
 * Analytics Tab - Performance charts and insights
 * Shows trends, weak areas, and study patterns
 * Pro+ feature (gated for Free users)
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

  // Generate performance data from recent attempts
  const performanceData = recentAttempts.length > 0
    ? recentAttempts.slice(0, 7).reverse().map(attempt => ({
        date: new Date(attempt.completedAt || attempt.completed_at).toLocaleDateString(),
        score: attempt.percentage || 0
      }))
    : [
        { date: '2026-02-15', score: 75 },
        { date: '2026-02-16', score: 82 },
        { date: '2026-02-17', score: 78 },
        { date: '2026-02-18', score: 90 },
        { date: '2026-02-19', score: 85 },
        { date: '2026-02-20', score: 88 },
        { date: '2026-02-21', score: 92 },
      ];

  const weakTopics = [
    { topic: 'Algebra', strength: 45, quizzesTaken: 8 },
    { topic: 'Calculus', strength: 72, quizzesTaken: 5 },
    { topic: 'Geometry', strength: 88, quizzesTaken: 3 },
  ];

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
            <PerformanceChart data={performanceData} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleUpgrade}
              className="btn-primary flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Upgrade to Pro for Analytics
            </motion.button>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          variants={itemVariants}
          className="bg-violet-50 rounded-xl sm:rounded-2xl border-2 border-violet-200 p-6 sm:p-8 text-center"
        >
          <h3 className="text-xl sm:text-2xl font-black text-violet-900 mb-3">Analytics Coming Soon</h3>
          <p className="text-sm sm:text-base text-violet-700 font-bold mb-6">
            Unlock detailed performance charts, weak area analysis, and study insights with Pro
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpgrade}
            className="btn-primary"
          >
            See Pro Features
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Pro/Premium view with full analytics
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Performance Chart */}
      <motion.div variants={itemVariants}>
        <PerformanceChart data={performanceData} />
      </motion.div>

      {/* Study Insights Grid */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-black text-ink mb-4">Study Insights</h2>
        <StudyInsights />
      </motion.div>

      {/* Weak Topics */}
      <motion.div variants={itemVariants}>
        <WeakTopicsCard topics={weakTopics} />
      </motion.div>

      {/* Additional Stats */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
      >
        {/* Consistency Stats */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-black text-ink mb-4">Learning Consistency</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate">This Week</span>
              <span className="font-black text-brand-500">5/7 days</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-400 to-brand-500"
                initial={{ width: 0 }}
                animate={{ width: '71%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-slate font-bold">Keep it up! 🔥</p>
          </div>
        </div>

        {/* Time Investment */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-black text-ink mb-4">Time Investment</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate">This Month</span>
              <span className="font-black text-gold">23h 45m</span>
            </div>
            <div className="text-4xl font-black text-gold mb-2">📈</div>
            <p className="text-xs text-slate font-bold">+18% from last month</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyticsTab;
