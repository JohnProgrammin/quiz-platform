import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import UpgradePrompt from './UpgradePrompt';
import { SkeletonDashboard } from './Skeleton';
import { getAllAttempts, getQuizzes, getNotes } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FileText, BookOpen, Target, Trophy, ArrowRight, Flame } from 'lucide-react';

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
  const navigate = useNavigate();
  const { isFree } = useSubscription();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [attemptsRes, quizzesRes, notesRes] = await Promise.all([
        getAllAttempts(),
        getQuizzes(),
        getNotes(),
      ]);

      const attempts = attemptsRes.data;
      const avgScore = attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;

      setStats({
        totalNotes: notesRes.data.length,
        totalQuizzes: quizzesRes.data.length,
        totalAttempts: attempts.length,
        averageScore: avgScore,
      });

      setRecentAttempts(attempts.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-brand-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-danger';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-50 border-brand-500';
    if (percentage >= 60) return 'bg-amber-50 border-amber-500';
    return 'bg-red-50 border-danger';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar user={user} onLogout={onLogout} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <SkeletonDashboard />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: t('dashboard.stats.notes'), value: stats.totalNotes, icon: <FileText className="w-7 h-7" />, color: 'text-brand-500' },
    { label: t('dashboard.stats.quizzes'), value: stats.totalQuizzes, icon: <BookOpen className="w-7 h-7" />, color: 'text-brand-500' },
    { label: t('quiz.quiz'), value: stats.totalAttempts, icon: <Target className="w-7 h-7" />, color: 'text-brand-500' },
    { label: t('dashboard.stats.averageScore'), value: `${stats.averageScore}%`, icon: <Trophy className="w-7 h-7" />, color: 'text-brand-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-ink leading-tight mb-2">
            {t('dashboard.welcome', { name: user.fullName || user.username })}
          </h1>
          <p className="text-lg text-slate font-semibold">{t('dashboard.statistics')}</p>
        </div>

        {/* Upgrade Prompt */}
        {isFree && (
          <div className="mb-10">
            <UpgradePrompt feature="unlimited_quizzes" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-2xl border-2 border-gray-200 p-8 hover:shadow-sm hover:border-brand-300 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 rounded-2xl bg-brand-500 flex items-center justify-center mb-4 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-black text-ink mb-2">{stat.value}</div>
              <div className="text-sm font-semibold text-slate">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-8 py-7 border-b-2 border-gray-100 flex items-center justify-between bg-white">
            <h2 className="text-2xl font-black text-ink flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <Flame className="w-6 h-6 text-amber-500" />
              </div>
              {t('dashboard.recentActivity')}
            </h2>
          </div>

          {/* Content */}
          {recentAttempts.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6 border-2 border-gray-200">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-black text-ink mb-3">{t('quiz.noQuizzes')}</h3>
              <p className="text-slate font-semibold mb-8 max-w-md mx-auto">
                {t('notes.dragDropFile')}
              </p>
              <button
                onClick={() => navigate('/notes')}
                className="inline-flex items-center justify-center px-6 py-3 bg-brand-500 text-white font-black rounded-lg hover:shadow-sm hover:-translate-y-1 transition-all duration-300 disabled:opacity-50"
              >
                {t('common.submit').toUpperCase()}
              </button>
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-100">
              {recentAttempts.map((attempt, index) => (
                <div
                  key={attempt.id}
                  className="px-8 py-6 hover:bg-green-50 cursor-pointer transition-all duration-200 flex items-center justify-between group"
                  onClick={() => navigate(`/quiz/${attempt.quizId}/results`)}
                >
                  <div className="flex-1">
                    <h3 className="font-black text-ink text-lg group-hover:text-brand-500 transition-colors">
                      {attempt.quizTitle}
                    </h3>
                    <p className="text-sm font-semibold text-slate mt-2">
                      {new Date(attempt.completedAt).toLocaleDateString()} &middot; {attempt.score}/{attempt.totalQuestions} {t('results.correctAnswers').toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className={`text-xl font-black px-4 py-2 rounded-full border-2 ${getScoreBg(attempt.percentage)} ${getScoreColor(attempt.percentage)}`}>
                      {attempt.percentage}%
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted group-hover:text-brand-500 transition-colors transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
