import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  XPBar,
  StreakIndicator,
  DailyGoalWidget,
  AchievementGrid,
  PageTransition,
} from '../components';
import { staggerContainer, staggerItem } from '../lib/animations';
import {
  Home,
  BarChart2,
  List,
  Layers,
  PieChart,
  User,
  Settings,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Box,
  Tag,
  Users,
  AlertCircle
} from 'lucide-react';

/**
 * 3-Pane Dashboard Layout (Premium Reference Aesthetic)
 */
export const Dashboard = () => {
  const [activeSegment, setActiveSegment] = useState('Overview');

  // Sidebar Links Data
  const sidebarLinks = [
    { name: 'Overview', icon: BarChart2 },
    { name: 'Analyze', icon: Activity },
    { name: 'All charts', icon: TrendingUp },
    { name: 'All projects', icon: Box },
    { name: 'Explore events', icon: List },
    { name: 'Visual labels', icon: Tag },
    { name: 'Live data feed', icon: Settings },
    { name: 'Manage access', icon: Users },
  ];

  const [userStats] = useState({
    level: 5,
    currentXP: 1250,
    xpForNextLevel: 2000,
    currentStreak: 7,
    longestStreak: 21,
    dailyQuizzesCompleted: 2,
    dailyQuizzesGoal: 3,
    achievements: [
      { id: 1, name: 'First Quiz', unlocked: true, color: 'from-blue-400 to-blue-600', xpReward: 10 },
      { id: 2, name: '7-Day Streak', unlocked: true, color: 'from-orange-400 to-orange-600', xpReward: 50 },
      { id: 3, name: 'Perfect Score', unlocked: true, color: 'from-brand-400 to-brand-600', xpReward: 75 },
    ],
  });

  return (
    <PageTransition>
      <div className="flex h-screen w-full bg-white font-sans overflow-hidden">

        {/* PANE 1: Skinny Dark Sidebar */}
        <div className="w-16 bg-[#1a1c21] flex flex-col items-center py-6 flex-shrink-0 z-20 shadow-2xl">
          {/* Logo Mark */}
          <div className="w-8 h-8 bg-white rounded-md mb-8 flex flex-col justify-center items-center shadow-md">
            <div className="w-4 h-4 rounded-full bg-[#1a1c21]"></div>
          </div>

          {/* Icon Navigation */}
          <div className="flex flex-col gap-6 text-slate-400 mt-4">
            <button className="hover:text-white transition-colors"><Home className="w-5 h-5" /></button>
            <button className="text-white bg-white/10 p-2 rounded-lg transition-colors"><BarChart2 className="w-5 h-5" /></button>
            <button className="hover:text-white transition-colors"><List className="w-5 h-5" /></button>
            <button className="hover:text-white transition-colors"><Layers className="w-5 h-5" /></button>
            <button className="hover:text-white transition-colors"><PieChart className="w-5 h-5" /></button>
            <button className="hover:text-white transition-colors mt-4 pt-4 border-t border-white/10"><User className="w-5 h-5" /></button>
          </div>
        </div>

        {/* PANE 2: Secondary Light Navigation */}
        <div className="w-64 bg-[#f8f9fa] border-r border-slate-200 flex flex-col h-full flex-shrink-0 overflow-y-auto">
          <div className="px-6 py-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg text-slate-800">Dashboards</h2>
              <button className="text-slate-400 hover:text-slate-600">
                <div className="grid grid-cols-2 gap-0.5">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                  <div className="w-1 h-1 bg-current rounded-full" />
                </div>
              </button>
            </div>

            <div className="space-y-1">
              {sidebarLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => setActiveSegment(link.name)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSegment === link.name
                    ? 'bg-white text-slate-900 border border-slate-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                >
                  <link.icon className="w-4 h-4 opacity-70" />
                  {link.name}
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 space-y-1">
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 opacity-70" />
                  Settings
                </div>
              </button>
              <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 opacity-70" />
                  Support
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-50" />
              </button>
            </div>
          </div>
        </div>

        {/* PANE 3: Main White Content Area */}
        <div className="flex-1 bg-white h-full overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8 md:p-12">

            <motion.div
              className="mb-10"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 variants={staggerItem} className="text-2xl font-black text-slate-900 mb-2">
                {activeSegment}
              </motion.h1>
              <motion.p variants={staggerItem} className="text-slate-500 font-medium">
                Manage your details and personal preferences here.
              </motion.p>
            </motion.div>

            {/* In-Page Tabs (Mimicking the reference Settings page structure) */}
            <div className="flex items-center gap-6 border-b border-slate-200 mb-8 pb-3">
              <button className="text-sm font-bold text-slate-900 border-2 border-slate-200 rounded-lg px-4 py-1.5 bg-slate-50">My Profile</button>
              <button className="text-sm font-semibold text-slate-500 hover:text-slate-800">Security</button>
              <button className="text-sm font-semibold text-slate-500 hover:text-slate-800">Billing</button>
              <button className="text-sm font-semibold text-slate-500 hover:text-slate-800">Notifications</button>
            </div>

            {/* Email Verification Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 mb-10">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Please confirm your email to publish your profile</h4>
                <p className="text-sm text-slate-500 mt-1">We sent a 6-digit verification code to hi@florenceshaw.com</p>
              </div>
            </div>

            {/* Content Injection: Gamified Widgets disguised in clean layout */}
            <h3 className="text-lg font-bold text-slate-900 mb-6">Learning Metrics</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <XPBar currentXP={userStats.currentXP} xpForNextLevel={userStats.xpForNextLevel} level={userStats.level} />
              <StreakIndicator currentStreak={userStats.currentStreak} longestStreak={userStats.longestStreak} />
              <DailyGoalWidget goalType="quizzes" current={userStats.dailyQuizzesCompleted} goal={userStats.dailyQuizzesGoal} isCompleted={userStats.dailyQuizzesCompleted >= userStats.dailyQuizzesGoal} />

              <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total XP</span>
                  <TrendingUp className="w-5 h-5 text-brand-500" />
                </div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">3,250</div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-6 border-t border-slate-100 pt-8">Recent Achievements</h3>
            <AchievementGrid achievements={userStats.achievements} limit={3} />

          </div>
        </div>

      </div>
    </PageTransition>
  );
};

export default Dashboard;
