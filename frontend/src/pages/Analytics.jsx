import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendChart,
  PerformanceChart,
  ScoreDistribution,
  Leaderboard,
  WeeklyReview,
  Tabs,
  PageTransition,
} from '../components';
import { staggerContainer, staggerItem } from '../lib/animations';
import { Download, Share2 } from 'lucide-react';

/**
 * Analytics Page (Complete Data Dashboard)
 * Beautiful analytics with charts, leaderboard, and insights
 */
export const Analytics = () => {
  const [timeRange, setTimeRange] = useState('week');

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Detailed', value: 'detailed' },
    { label: 'Leaderboard', value: 'leaderboard' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
            <p className="text-gray-600">Track your progress, celebrate your wins, and improve faster</p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={staggerItem} className="flex gap-3 mt-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200 transition-colors">
              <Download size={18} />
              Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-pink-100 text-pink-700 font-semibold hover:bg-pink-200 transition-colors">
              <Share2 size={18} />
              Share Progress
            </button>
          </motion.div>
        </motion.div>

        {/* Weekly Review (Top Section) */}
        <motion.div
          className="mb-8"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItem}>
            <WeeklyReview week="Last 7 days" />
          </motion.div>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Tabs
            defaultValue="overview"
            tabs={tabs}
            children={(activeTab) => {
              if (activeTab === 'overview') {
                return (
                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={staggerItem}>
                      <TrendChart />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.div variants={staggerItem}>
                        <ScoreDistribution />
                      </motion.div>

                      <motion.div variants={staggerItem}>
                        <Leaderboard />
                      </motion.div>
                    </div>
                  </motion.div>
                );
              }

              if (activeTab === 'detailed') {
                return (
                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={staggerItem}>
                      <PerformanceChart />
                    </motion.div>

                    <motion.div variants={staggerItem}>
                      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                          Subject Performance
                        </h3>

                        <motion.div
                          className="space-y-3"
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                        >
                          {[
                            { subject: 'Biology', score: 92, color: 'from-green-400 to-green-600' },
                            { subject: 'Chemistry', score: 88, color: 'from-blue-400 to-blue-600' },
                            { subject: 'Physics', score: 85, color: 'from-purple-400 to-purple-600' },
                            { subject: 'History', score: 78, color: 'from-orange-400 to-orange-600' },
                          ].map((item) => (
                            <motion.div key={item.subject} variants={staggerItem}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-gray-900">{item.subject}</span>
                                <span className="text-lg font-bold text-gray-900">{item.score}%</span>
                              </div>
                              <motion.div
                                className={`h-3 rounded-full bg-gradient-to-r ${item.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                transition={{
                                  type: 'spring',
                                  stiffness: 100,
                                  damping: 15,
                                  duration: 0.8,
                                }}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              }

              if (activeTab === 'leaderboard') {
                return (
                  <motion.div
                    className="space-y-6"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.div variants={staggerItem}>
                      <Leaderboard />
                    </motion.div>

                    <motion.div
                      variants={staggerItem}
                      className="bg-white rounded-xl p-6 border border-gray-200"
                    >
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Your Rank</h3>
                      <div className="text-center py-8">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-6xl mb-4"
                        >
                          🥈
                        </motion.div>
                        <p className="text-4xl font-bold text-gray-900 mb-2">Rank #42</p>
                        <p className="text-gray-600">
                          You're in the top 5% of all learners! Keep learning to reach the top!
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                );
              }
            }}
          />
        </motion.div>

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white text-center"
        >
          <h3 className="text-lg font-bold mb-2">Last Updated</h3>
          <p className="text-sm opacity-90">2 hours ago</p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Analytics;
