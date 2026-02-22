import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSubscription } from '../../contexts/SubscriptionContext';
import DashboardTabs from './DashboardTabs';
import OverviewTab from './tabs/OverviewTab';
import AchievementsTab from './tabs/AchievementsTab';
import ProfileTab from './tabs/ProfileTab';
import { SkeletonDashboard } from '../Skeleton';
import { getQuizHistory, getQuizzes, getNotes, getUserStats, getAchievements } from '../../api';

/**
 * Dashboard Container - Main orchestrator for the dashboard
 * Fetches REAL DATA ONLY from backend APIs
 */
export const DashboardContainer = ({ user }) => {
  const { isFree, isPro, isPremium, tier } = useSubscription();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real data from API
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

        // Fetch all data in parallel
        const [quizHistoryRes, quizzesRes, notesRes, userStatsRes, achievementsRes] = await Promise.all([
          getQuizHistory().catch(e => {
            console.error('Quiz history error:', e);
            return { data: [] };
          }),
          getQuizzes().catch(e => {
            console.error('Quizzes error:', e);
            return { data: [] };
          }),
          getNotes().catch(e => {
            console.error('Notes error:', e);
            return { data: [] };
          }),
          getUserStats().catch(e => {
            console.error('User stats error:', e);
            return { data: {} };
          }),
          getAchievements().catch(e => {
            console.error('Achievements error:', e);
            return { data: [] };
          }),
        ]);

        // Extract data - handle both { data: [...] } and direct array formats
        const quizHistory = Array.isArray(quizHistoryRes?.data) ? quizHistoryRes.data : (Array.isArray(quizHistoryRes) ? quizHistoryRes : []);
        const quizzesData = Array.isArray(quizzesRes?.data) ? quizzesRes.data : (Array.isArray(quizzesRes) ? quizzesRes : []);
        const notesData = Array.isArray(notesRes?.data) ? notesRes.data : (Array.isArray(notesRes) ? notesRes : []);
        const statsData = (typeof userStatsRes?.data === 'object' && !Array.isArray(userStatsRes?.data)) ? userStatsRes.data : (typeof userStatsRes === 'object' && !Array.isArray(userStatsRes) ? userStatsRes : {});
        const achievementsData = Array.isArray(achievementsRes?.data) ? achievementsRes.data : (Array.isArray(achievementsRes) ? achievementsRes : []);

        // Calculate stats from real data
        const totalNotes = notesData.length || 0;
        const totalQuizzes = quizzesData.length || 0;
        const totalAttempts = quizHistory.length || 0;

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

        // Set gamification from API response
        if (statsData && Object.keys(statsData).length > 0) {
          setGamification({
            level: statsData.level || 1,
            totalXP: statsData.totalXP || statsData.total_xp || 0,
            currentStreak: statsData.currentStreak || statsData.current_streak || 0,
            longestStreak: statsData.longestStreak || statsData.longest_streak || 0,
            progressToNextLevel: statsData.progressToNextLevel || statsData.progress_to_next_level || 0,
            nextLevelXP: statsData.nextLevelXP || statsData.next_level_xp || 1000,
          });
        }

        // Set achievements from API
        if (Array.isArray(achievementsData)) {
          setAchievements(achievementsData);
        }

        setLoading(false);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard');
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
