import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import UpgradePrompt from './UpgradePrompt';
import { SkeletonDashboard } from './Skeleton';
import XPBar from './XPBar';
import StreakIndicator from './StreakIndicator';
import { getQuizHistory, getQuizzes, getNotes, getUserStats } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  FileText, BookOpen, Target, Trophy, ArrowRight,
  Flame, Zap, Sparkles, Plus
} from 'lucide-react';

function Dashboard({ user, onLogout }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gamificationStats, setGamificationStats] = useState(null);
  const navigate = useNavigate();
  const { isFree } = useSubscription();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [attemptsRes, quizzesRes, notesRes, gamificationRes] = await Promise.all([
        getQuizHistory(),
        getQuizzes(),
        getNotes(),
        getUserStats().catch(() => ({ data: null })),
      ]);

      const attempts = Array.isArray(attemptsRes.data) ? attemptsRes.data : (attemptsRes.data?.data || []);
      const notes = Array.isArray(notesRes.data) ? notesRes.data : (notesRes.data?.data || []);
      const quizzes = Array.isArray(quizzesRes.data) ? quizzesRes.data : (quizzesRes.data?.data || []);

      const validAttempts = attempts.filter(a =>
        typeof a.percentage === 'number' &&
        !isNaN(a.percentage) &&
        a.percentage !== null &&
        a.percentage !== undefined
      );

      const avgScore = validAttempts.length > 0
        ? Math.round(validAttempts.reduce((sum, a) => sum + a.percentage, 0) / validAttempts.length)
        : 0;

      setStats({
        totalNotes: notes.length,
        totalQuizzes: quizzes.length,
        totalAttempts: attempts.length,
        averageScore: avgScore,
      });

      setRecentAttempts(attempts.slice(0, 5));

      if (gamificationRes?.data) {
        setGamificationStats(gamificationRes.data);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <SkeletonDashboard />
      </div>
    );
  }

  const statCards = [
    {
      label: t('dashboard.stats.notes'),
      value: stats.totalNotes,
      icon: <FileText className="w-6 h-6" />,
      gradient: 'from-blue-400 to-ice',
      bg: 'bg-blue-50'
    },
    {
      label: t('dashboard.stats.quizzes'),
      value: stats.totalQuizzes,
      icon: <BookOpen className="w-6 h-6" />,
      gradient: 'from-brand-400 to-brand-300',
      bg: 'bg-brand-50'
    },
    {
      label: t('quiz.quiz'),
      value: stats.totalAttempts,
      icon: <Target className="w-6 h-6" />,
      gradient: 'from-purple to-purple/70',
      bg: 'bg-purple-50'
    },
    {
      label: t('dashboard.stats.averageScore'),
      value: `${stats.averageScore}%`,
      icon: <Trophy className="w-6 h-6" />,
      gradient: 'from-gold to-flame',
      bg: 'bg-amber-50'
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Hero Greeting ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="bg-white rounded-3xl border-2 border-border p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-ink leading-tight">
              {t('dashboard.welcome', { name: user.fullName || user.username })} 👋
            </h1>
            <p className="text-lg text-slate font-bold mt-1">{t('dashboard.statistics')}</p>
          </div>

          {/* Quick Action */}
          <button
            onClick={() => navigate('/notes')}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            {t('common.submit').toUpperCase()}
          </button>
        </div>
      </motion.div>

      {/* Upgrade Prompt */}
      {isFree && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <UpgradePrompt feature="unlimited_quizzes" />
        </motion.div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="bg-white rounded-2xl border-2 border-border p-5 hover:border-brand-400 transition-all duration-200 group cursor-default"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 text-white group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <div className="text-3xl font-black text-ink">{stat.value}</div>
            <div className="text-sm font-bold text-slate mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Gamification Row ── */}
      {gamificationStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <XPBar
            level={gamificationStats.level}
            totalXP={gamificationStats.totalXP}
            nextLevelXP={gamificationStats.nextLevelXP}
            progressToNextLevel={gamificationStats.progressToNextLevel}
          />
          <StreakIndicator
            currentStreak={gamificationStats.currentStreak}
            longestStreak={gamificationStats.longestStreak}
          />
        </motion.div>
      )}

      {/* ── Recent Activity ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl border-2 border-border overflow-hidden"
      >
        <div className="px-6 py-5 border-b-2 border-border flex items-center justify-between">
          <h2 className="text-xl font-black text-ink flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-flame to-gold flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            {t('dashboard.recentActivity')}
          </h2>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-5 border-2 border-border">
              <BookOpen className="w-10 h-10 text-muted" />
            </div>
            <h3 className="text-xl font-black text-ink mb-2">{t('quiz.noQuizzes')}</h3>
            <p className="text-slate font-bold mb-6 max-w-sm mx-auto">
              {t('notes.dragDropFile')}
            </p>
            <button
              onClick={() => navigate('/notes')}
              className="btn-primary"
            >
              {t('common.submit').toUpperCase()}
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
                className="px-6 py-5 hover:bg-brand-50/50 cursor-pointer transition-all duration-200 flex items-center justify-between group"
                onClick={() => navigate(`/quiz/${attempt.quizId}/results`)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-ink text-lg group-hover:text-brand-500 transition-colors truncate">
                    {attempt.quizTitle}
                  </h3>
                  <p className="text-sm font-bold text-slate mt-1">
                    {new Date(attempt.completedAt).toLocaleDateString()} &middot; {attempt.score}/{attempt.totalQuestions} {t('results.correctAnswers').toLowerCase()}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <div className={`text-lg font-black px-3 py-1.5 rounded-xl border-2 ${getScoreBg(attempt.percentage)} ${getScoreColor(attempt.percentage)}`}>
                    {attempt.percentage}%
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted group-hover:text-brand-500 transition-all transform group-hover:translate-x-1" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default Dashboard;
