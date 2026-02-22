import { motion } from 'framer-motion';
import { Trophy, Zap, Flame, Target, FileText, BookOpen, TrendingUp } from 'lucide-react';
import { MetricCard } from '../metrics/MetricCard';
import XPBar from '../../XPBar';
import StreakIndicator from '../../StreakIndicator';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Overview Tab - Main dashboard view
 * Displays learning metrics, progress, streak, and recent activity
 */
export const OverviewTab = ({ stats, gamification, recentAttempts, user, tier }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-brand-500';
    if (percentage >= 60) return 'text-gold';
    return 'text-heart';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 80) return 'bg-brand-50 border-brand-400';
    if (percentage >= 60) return 'bg-amber-50 border-gold';
    return 'bg-red-50 border-heart';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 md:space-y-10"
    >
      {/* Learning Metrics Grid - 4 cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <MetricCard
          label="Level"
          value={gamification?.level || 1}
          icon={<Trophy className="w-7 h-7 fill-white" />}
          gradient="from-violet-400 to-violet-300"
          subtitle={`${gamification?.totalXP || 0} XP`}
          showProgress={true}
          progress={gamification?.progressToNextLevel || 0}
        />

        <MetricCard
          label="Total XP"
          value={gamification?.totalXP?.toLocaleString() || '0'}
          icon={<Zap className="w-7 h-7 fill-white" />}
          gradient="from-brand-400 to-brand-300"
          subtitle={`Next: ${gamification?.nextLevelXP || 0} XP`}
        />

        <MetricCard
          label="Streak"
          value={`${gamification?.currentStreak || 0} days`}
          icon={<Flame className="w-7 h-7 fill-white" />}
          gradient="from-flame to-gold"
          subtitle={`Best: ${gamification?.longestStreak || 0} days`}
          animated={gamification?.currentStreak > 0}
        />

        <MetricCard
          label="Daily Goal"
          value="2/3 quizzes"
          icon={<Target className="w-7 h-7" />}
          gradient="from-teal to-cyan-400"
          subtitle="67% complete"
          showProgress={true}
          progress={67}
        />
      </motion.div>

      {/* XP Progress Bar */}
      {gamification && (
        <motion.div variants={itemVariants}>
          <XPBar
            level={gamification.level}
            totalXP={gamification.totalXP}
            nextLevelXP={gamification.nextLevelXP}
            progressToNextLevel={gamification.progressToNextLevel}
          />
        </motion.div>
      )}

      {/* Streak Indicator */}
      {gamification && (
        <motion.div variants={itemVariants}>
          <StreakIndicator
            currentStreak={gamification.currentStreak}
            longestStreak={gamification.longestStreak}
          />
        </motion.div>
      )}

      {/* Quick Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-4 sm:p-5 md:p-6 hover:border-brand-400 transition-all hover:-translate-y-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-ice flex items-center justify-center mb-3 text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-2xl font-black text-ink">{stats.totalNotes}</div>
          <div className="text-xs font-bold text-muted uppercase tracking-wider mt-1">
            Notes
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-4 sm:p-5 md:p-6 hover:border-brand-400 transition-all hover:-translate-y-1">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-400 to-brand-300 flex items-center justify-center mb-2 sm:mb-3 text-white">
            <BookOpen className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-ink">{stats.totalQuizzes}</div>
          <div className="text-xs font-bold text-muted uppercase tracking-wider mt-1">
            Quizzes
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-4 sm:p-5 md:p-6 hover:border-brand-400 transition-all hover:-translate-y-1">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple to-purple/70 flex items-center justify-center mb-2 sm:mb-3 text-white">
            <Target className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-ink">{stats.totalAttempts}</div>
          <div className="text-xs font-bold text-muted uppercase tracking-wider mt-1">
            Attempts
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-4 sm:p-5 md:p-6 hover:border-brand-400 transition-all hover:-translate-y-1">
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-gold to-flame flex items-center justify-center mb-2 sm:mb-3 text-white">
            <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-ink">{stats.averageScore}%</div>
          <div className="text-xs font-bold text-muted uppercase tracking-wider mt-1">
            Avg Score
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl sm:rounded-2xl border-2 border-border overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b-2 border-border flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-ink flex items-center gap-2 sm:gap-3">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-flame to-gold flex items-center justify-center flex-shrink-0">
              <Flame className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
            </div>
            Recent Activity
          </h2>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-5 border-2 border-border">
              <BookOpen className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-black text-ink mb-2">No Quizzes Yet</h3>
            <p className="text-slate font-bold mb-6 max-w-sm mx-auto">
              Upload your first note to generate a quiz and start earning XP!
            </p>
            <button
              onClick={() => navigate('/notes')}
              className="btn-primary"
            >
              Upload Note
            </button>
          </div>
        ) : (
          <div className="divide-y-2 divide-border">
            {recentAttempts.map((attempt, index) => (
              <motion.div
                key={attempt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * index }}
                className="px-3 sm:px-6 py-4 sm:py-5 hover:bg-brand-50/50 cursor-pointer transition-all duration-200 flex items-center justify-between group gap-3"
                onClick={() => navigate(`/quiz/${attempt.quizId}/results`)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-ink text-sm sm:text-lg group-hover:text-brand-500 transition-colors line-clamp-2">
                    {attempt.quizTitle}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-slate mt-1">
                    {new Date(attempt.completedAt || attempt.completed_at).toLocaleDateString()} &middot;{' '}
                    {attempt.score}/{attempt.totalQuestions}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4 flex-shrink-0">
                  <div
                    className={`text-sm sm:text-lg font-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border-2 ${getScoreBg(
                      attempt.percentage
                    )} ${getScoreColor(attempt.percentage)}`}
                  >
                    {attempt.percentage}%
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OverviewTab;
