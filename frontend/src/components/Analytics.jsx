import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { SkeletonAnalytics } from './Skeleton';
import { getQuizHistory, getQuizzes, getProfile } from '../api';
import { BarChart3, TrendingUp, Target, Zap, Calendar, Award, Clock } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';
import UpgradeQuotaModal from './UpgradeQuotaModal'; // Fixed import

function Analytics({ user, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tier } = useSubscription(); // Get user tier
  const [attempts, setAttempts] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  if (tier === 'free') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-ink mb-2">{t('analytics.title')}</h1>
          <p className="text-slate font-semibold">Track your learning progress and insights</p>
        </div>

        <div className="flex flex-col items-center justify-center p-12 bg-surface rounded-2xl border-2 border-border text-center">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mb-6">
            <BarChart3 className="w-10 h-10 text-brand-500" />
          </div>
          <h2 className="text-2xl font-black text-ink mb-3">Unlock Advanced Analytics</h2>
          <p className="text-slate font-semibold mb-8 max-w-md">
            Get detailed insights into your learning patterns, identifying weak spots, and tracking your improvement over time with Pro.
          </p>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-primary px-8 py-3 text-lg"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    totalTime: 0,
    streakDays: 0,
  });
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    if (tier !== 'free') {
      loadAnalytics();
    }
  }, [tier]);

  const loadAnalytics = async () => {
    try {
      const [attemptsRes, quizzesRes] = await Promise.all([
        getQuizHistory(),
        getQuizzes(),
      ]);

      const allAttempts = attemptsRes.data || [];
      const allQuizzes = quizzesRes.data || [];

      setAttempts(allAttempts);
      setQuizzes(allQuizzes);

      // Calculate statistics
      if (allAttempts.length > 0) {
        const scores = allAttempts.map((a) => a.percentage || 0);
        const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        const bestScore = Math.max(...scores, 0);

        setStats({
          totalQuizzes: allQuizzes.length,
          totalAttempts: allAttempts.length,
          averageScore: avgScore,
          bestScore: bestScore,
          totalTime: Math.round(allAttempts.reduce((acc, a) => acc + (a.timeSpent || 0), 0) / 60), // minutes
          streakDays: calculateStreak(allAttempts),
        });

        // Generate trend data (last 7 days)
        setTrendData(generateTrendData(allAttempts));
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (attempts) => {
    if (attempts.length === 0) return 0;
    const sortedByDate = attempts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const attempt of sortedByDate) {
      const attemptDate = new Date(attempt.createdAt);
      attemptDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((currentDate - attemptDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (daysDiff > streak) {
        break;
      }
    }

    return streak;
  };

  const generateTrendData = (attempts) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dayAttempts = attempts.filter((a) => {
        const aDate = new Date(a.createdAt);
        aDate.setHours(0, 0, 0, 0);
        return aDate.getTime() === date.getTime();
      });

      const avgScore = dayAttempts.length > 0
        ? Math.round(dayAttempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / dayAttempts.length)
        : 0;

      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score: avgScore,
        attempts: dayAttempts.length,
      });
    }
    return last7Days;
  };

  const getPerformanceLevel = (score) => {
    if (score >= 90) return { label: t('analytics.performanceRatings.excellent'), color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-500' };
    if (score >= 80) return { label: t('analytics.performanceRatings.great'), color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-500' };
    if (score >= 70) return { label: t('analytics.performanceRatings.good'), color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-500' };
    if (score >= 60) return { label: t('analytics.performanceRatings.fair'), color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-500' };
    return { label: t('analytics.performanceRatings.needsWork'), color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-500' };
  };

  if (loading) {
    return (
      <div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <SkeletonAnalytics />
        </div>
      </div>
    );
  }

  const perfLevel = getPerformanceLevel(stats.averageScore);

  return (
    <div>


      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink">{t('analytics.title')}</h1>
          <p className="text-slate font-semibold mt-2">{t('analytics.subtitle')}</p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Average Score */}
          <div className={`card p-6 border-2 ${perfLevel.border}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate mb-1">{t('analytics.averageScore')}</p>
                <p className={`text-4xl font-black ${perfLevel.color}`}>{stats.averageScore}%</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${perfLevel.bg} flex items-center justify-center`}>
                <Target className={`w-6 h-6 ${perfLevel.color}`} />
              </div>
            </div>
            <p className={`text-xs font-bold ${perfLevel.color}`}>{perfLevel.label}</p>
          </div>

          {/* Best Score */}
          <div className="card p-6 border-2 border-green-500 bg-green-50/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate mb-1">{t('analytics.bestScore')}</p>
                <p className="text-4xl font-black text-green-500">{stats.bestScore}%</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                <Award className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <p className="text-xs font-semibold text-green-600">{t('analytics.bestScore')}</p>
          </div>

          {/* Streak */}
          <div className="card p-6 border-2 border-orange-500 bg-orange-50/30">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate mb-1">{t('analytics.currentStreak')}</p>
                <p className="text-4xl font-black text-orange-500">{stats.streakDays}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-xs font-semibold text-orange-600">{stats.streakDays === 1 ? t('analytics.day') : t('analytics.days')} in a row</p>
          </div>

          {/* Total Attempts */}
          <div className="card p-6 border-2 border-brand-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate mb-1">{t('analytics.quizzesTaken')}</p>
                <p className="text-4xl font-black text-brand-500">{stats.totalAttempts}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-brand-500" />
              </div>
            </div>
            <p className="text-xs font-semibold text-brand-600">{t('analytics.quizAttempts')}</p>
          </div>

          {/* Total Quizzes */}
          <div className="card p-6 border-2 border-brand-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate mb-1">{t('analytics.quizzesCreated')}</p>
                <p className="text-4xl font-black text-brand-500">{stats.totalQuizzes}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-brand-500" />
              </div>
            </div>
            <p className="text-xs font-semibold text-brand-600">{t('analytics.fromNotes')}</p>
          </div>

          {/* Study Time */}
          <div className="card p-6 border-2 border-purple-500">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate mb-1">{t('analytics.studyTime')}</p>
                <p className="text-4xl font-black text-purple-500">{Math.round(stats.totalTime / 60)}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-xs font-semibold text-purple-600">{t('analytics.hours')}</p>
          </div>
        </div>

        {/* Performance Trend */}
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-extrabold text-ink mb-6">{t('analytics.last7DaysTrend')}</h2>
          <div className="flex items-end justify-between h-64 gap-2 mb-4">
            {trendData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-slate-200/50 rounded-t-lg overflow-hidden flex-1 min-h-12 relative">
                  {day.score > 0 && (
                    <div
                      className="w-full bg-brand-500 transition-all duration-500 ease-out"
                      style={{
                        height: `${(day.score / 100) * 100}%`,
                      }}
                      title={`${day.score}% - ${day.attempts} attempt${day.attempts !== 1 ? 's' : ''}`}
                    />
                  )}
                </div>
                <p className="text-xs font-bold text-slate mt-2">{day.date}</p>
                {day.score > 0 && (
                  <p className="text-xs font-bold text-brand-500 mt-1">{day.score}%</p>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <p className="text-sm font-semibold text-slate">{t('analytics.average')}: {Math.round(trendData.reduce((sum, d) => sum + d.score, 0) / trendData.length)}%</p>
            <p className="text-sm font-semibold text-slate">{t('analytics.total')} this week: {trendData.reduce((sum, d) => sum + d.attempts, 0)} quizzes</p>
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="card p-8">
          <h2 className="text-2xl font-extrabold text-ink mb-6">{t('analytics.recentQuizAttempts')}</h2>
          {attempts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-4 font-bold text-slate text-sm">{t('quiz.quiz')}</th>
                    <th className="text-center py-3 px-4 font-bold text-slate text-sm">{t('results.yourScore')}</th>
                    <th className="text-center py-3 px-4 font-bold text-slate text-sm">{t('quiz.timeLimit', { time: '' }).replace('Time: ', '')}</th>
                    <th className="text-left py-3 px-4 font-bold text-slate text-sm">{t('analytics.day')}</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.slice(0, 10).map((attempt, i) => {
                    const level = getPerformanceLevel(attempt.percentage || 0);
                    return (
                      <tr key={i} className="border-b border-border/50 hover:bg-surface transition-colors">
                        <td className="py-4 px-4 font-semibold text-ink">Quiz #{attempt.quizId}</td>
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${level.color} ${level.bg} border-2 ${level.border}`}>
                            {attempt.percentage || 0}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-slate font-semibold">{attempt.timeSpent || 0}s</td>
                        <td className="py-4 px-4 text-slate font-semibold">
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate font-semibold">{t('analytics.noQuizAttemptsYet')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
