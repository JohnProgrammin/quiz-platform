import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  XPBar,
  StreakIndicator,
  DailyGoalWidget,
  AchievementGrid,
  PageTransition,
} from '../components';
import { staggerContainer, staggerItem } from '../lib/animations';
import { BookOpen, Zap, TrendingUp } from 'lucide-react';

/**
 * Enhanced Dashboard Page (Duolingo Style)
 * Shows user's gamification progress, recent activity, and recommendations
 */
export const Dashboard = () => {
  const [userStats, setUserStats] = useState({
    level: 5,
    currentXP: 1250,
    xpForNextLevel: 2000,
    currentStreak: 7,
    longestStreak: 21,
    dailyQuizzesCompleted: 2,
    dailyQuizzesGoal: 3,
    achievements: [
      {
        id: 1,
        name: 'First Quiz',
        unlocked: true,
        color: 'from-blue-400 to-blue-600',
        xpReward: 10,
      },
      {
        id: 2,
        name: '7-Day Streak',
        unlocked: true,
        color: 'from-orange-400 to-orange-600',
        xpReward: 50,
      },
      {
        id: 3,
        name: 'Perfect Score',
        unlocked: true,
        color: 'from-purple-400 to-purple-600',
        xpReward: 75,
      },
      {
        id: 4,
        name: 'Quiz Master',
        unlocked: false,
        color: 'from-gray-400 to-gray-600',
      },
      {
        id: 5,
        name: 'Lightning Fast',
        unlocked: false,
        color: 'from-gray-400 to-gray-600',
      },
    ],
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, type: 'quiz_completed', score: 92, quizName: 'Biology Basics', time: '2 hours ago' },
    { id: 2, type: 'achievement', name: '7-Day Streak', time: '1 day ago' },
    { id: 3, type: 'level_up', level: 5, time: '3 days ago' },
  ]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-8">
        {/* Header Section */}
        <motion.div
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back! 👋</h1>
            <p className="text-gray-600">Keep up that amazing streak and keep learning!</p>
          </motion.div>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* XP Bar */}
          <motion.div variants={staggerItem}>
            <XPBar
              currentXP={userStats.currentXP}
              xpForNextLevel={userStats.xpForNextLevel}
              level={userStats.level}
            />
          </motion.div>

          {/* Streak Indicator */}
          <motion.div variants={staggerItem}>
            <StreakIndicator
              currentStreak={userStats.currentStreak}
              longestStreak={userStats.longestStreak}
            />
          </motion.div>

          {/* Daily Goal */}
          <motion.div variants={staggerItem}>
            <DailyGoalWidget
              goalType="quizzes"
              current={userStats.dailyQuizzesCompleted}
              goal={userStats.dailyQuizzesGoal}
              isCompleted={userStats.dailyQuizzesCompleted >= userStats.dailyQuizzesGoal}
            />
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={staggerItem}
            className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">42</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total XP Earned</p>
                    <p className="text-2xl font-bold text-gray-900">3,250</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">87%</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={staggerItem}>
            <AchievementGrid achievements={userStats.achievements} limit={9} />
          </motion.div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem} className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <motion.div
                  key={activity.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <div className="flex-1">
                    {activity.type === 'quiz_completed' && (
                      <p className="text-sm font-medium text-gray-900">
                        Completed <span className="text-purple-600">{activity.quizName}</span> with{' '}
                        <span className="text-green-600 font-bold">{activity.score}%</span>
                      </p>
                    )}
                    {activity.type === 'achievement' && (
                      <p className="text-sm font-medium text-gray-900">
                        Unlocked achievement: <span className="text-purple-600">{activity.name}</span>
                      </p>
                    )}
                    {activity.type === 'level_up' && (
                      <p className="text-sm font-medium text-gray-900">
                        Reached <span className="text-pink-600 font-bold">Level {activity.level}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
