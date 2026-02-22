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
 * Dashboard Container
 * Main orchestrator for the dashboard with tab navigation
 */
export const DashboardContainer = ({ user }) => {
  const { t } = useTranslation();
  const { isFree, isPro, isPremium, tier } = useSubscription();

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [gamification, setGamification] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [quizHistory, quizzes, notes, userStats] = await Promise.all([
          getQuizHistory(),
          getQuizzes(),
          getNotes(),
          getUserStats(),
        ]);

        // Calculate stats
        const totalNotes = notes?.data?.length || 0;
        const totalQuizzes = quizzes?.data?.length || 0;
        const totalAttempts = quizHistory?.data?.length || 0;

        let averageScore = 0;
        if (totalAttempts > 0) {
          const totalScore = quizHistory.data.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0);
          averageScore = Math.round(totalScore / totalAttempts);
        }

        setStats({
          totalNotes,
          totalQuizzes,
          totalAttempts,
          averageScore,
        });

        // Get recent attempts (last 5)
        setRecentAttempts(quizHistory?.data?.slice(0, 5) || []);

        // Get gamification data
        if (userStats?.data) {
          setGamification(userStats.data);
          if (userStats.data.achievements) {
            setAchievements(userStats.data.achievements);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="min-h-screen bg-surface py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content with Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
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

            {activeTab === 'analytics' && <AnalyticsTab isFree={isFree} />}

            {activeTab === 'achievements' && (
              <AchievementsTab achievements={achievements} />
            )}

            {activeTab === 'profile' && (
              <ProfileTab user={user} tier={tier} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DashboardContainer;
