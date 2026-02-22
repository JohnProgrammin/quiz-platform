import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../../contexts/SubscriptionContext';
import DashboardTabs from './DashboardTabs';
import OverviewTab from './tabs/OverviewTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import AchievementsTab from './tabs/AchievementsTab';
import ProfileTab from './tabs/ProfileTab';
import { SkeletonDashboard } from '../Skeleton';
import { getQuizHistory, getQuizzes, getNotes, getUserStats } from '../../api';
import { useTranslation } from 'react-i18next';

/**
 * Dashboard Container - Main orchestrator for the dashboard
 * Handles: tab navigation, data fetching, state management
 */
export const DashboardContainer = ({ user }) => {
  const { t } = useTranslation();
  const { isFree, isPro, isPremium, tier } = useSubscription();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [gamification, setGamification] = useState({
    level: 1,
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    progressToNextLevel: 0,
    nextLevelXP: 1000,
  });
  const [achievements, setAchievements] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [quizHistoryRes, quizzesRes, notesRes, userStatsRes] = await Promise.all([
          getQuizHistory().catch(() => ({ data: [] })),
          getQuizzes().catch(() => ({ data: [] })),
          getNotes().catch(() => ({ data: [] })),
          getUserStats().catch(() => ({ data: {} })),
        ]);

        const quizHistory = quizHistoryRes?.data || [];
        const quizzesData = quizzesRes?.data || [];
        const notesData = notesRes?.data || [];
        const statsData = userStatsRes?.data || {};

        // Calculate stats
        const totalNotes = notesData.length;
        const totalQuizzes = quizzesData.length;
        const totalAttempts = quizHistory.length;

        let averageScore = 0;
        if (totalAttempts > 0) {
          const totalScore = quizHistory.reduce((sum, attempt) => sum + (attempt.percentage || attempt.score || 0), 0);
          averageScore = Math.round(totalScore / totalAttempts);
        }

        setStats({
          totalNotes,
          totalQuizzes,
          totalAttempts,
          averageScore,
        });

        setRecentAttempts(quizHistory.slice(0, 5));
        setQuizzes(quizzesData);
        setNotes(notesData);

        // Set gamification data with fallbacks
        if (statsData) {
          setGamification({
            level: statsData.level || 1,
            totalXP: statsData.total_xp || statsData.totalXP || 0,
            currentStreak: statsData.current_streak || statsData.currentStreak || 0,
            longestStreak: statsData.longest_streak || statsData.longestStreak || 0,
            progressToNextLevel: statsData.progress_to_next_level || statsData.progressToNextLevel || 0,
            nextLevelXP: statsData.next_level_xp || statsData.nextLevelXP || 1000,
          });

          if (statsData.achievements) {
            setAchievements(Array.isArray(statsData.achievements) ? statsData.achievements : []);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-cloud to-surface">
      {/* Container with max-width and proper padding */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 sm:p-5 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm sm:text-base font-bold"
          >
            {error}
          </motion.div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {/* Tab Content with Smooth Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {activeTab === 'overview' && (
              <OverviewTab
                stats={stats}
                gamification={gamification}
                recentAttempts={recentAttempts}
                user={user}
                tier={tier}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab
                tier={tier}
                recentAttempts={recentAttempts}
                quizzes={quizzes}
                notes={notes}
              />
            )}

            {activeTab === 'achievements' && (
              <AchievementsTab achievements={achievements} />
            )}

            {activeTab === 'profile' && (
              <ProfileTab user={user} tier={tier} level={gamification.level} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardContainer;
