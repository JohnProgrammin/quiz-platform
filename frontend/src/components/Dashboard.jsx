import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import UpgradePrompt from './UpgradePrompt';
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
      <div className="min-h-screen bg-surface">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="w-12 h-12 rounded-full bg-brand-500 flex items-center justify-center animate-bounce">
            <span className="text-xl font-black text-white">Q</span>
          </div>
          <p className="text-slate font-bold mt-4">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: t('dashboard.stats.notes'), value: stats.totalNotes, icon: <FileText className="w-6 h-6" />, color: 'text-brand-500', bg: 'bg-brand-50' },
    { label: t('dashboard.stats.quizzes'), value: stats.totalQuizzes, icon: <BookOpen className="w-6 h-6" />, color: 'text-violet-500', bg: 'bg-violet-50' },
    { label: t('quiz.quiz'), value: stats.totalAttempts, icon: <Target className="w-6 h-6" />, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: t('dashboard.stats.averageScore'), value: `${stats.averageScore}%`, icon: <Trophy className="w-6 h-6" />, color: 'text-brand-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-ink">
            {t('dashboard.welcome', { name: user.fullName || user.username })}
          </h1>
          <p className="text-slate font-semibold mt-1">{t('dashboard.statistics')}</p>
        </div>

        {isFree && (
          <div className="mb-8">
            <UpgradePrompt feature="unlimited_quizzes" />
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-extrabold text-ink">{stat.value}</div>
              <div className="text-sm font-bold text-slate">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="px-6 py-4 border-b-2 border-border flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              {t('dashboard.recentActivity')}
            </h2>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-10 h-10 text-muted" />
              </div>
              <h3 className="text-lg font-extrabold text-ink mb-2">{t('quiz.noQuizzes')}</h3>
              <p className="text-slate font-semibold mb-6">
                {t('notes.dragDropFile')}
              </p>
              <button onClick={() => navigate('/notes')} className="btn-primary">
                {t('common.submit').toUpperCase()}
              </button>
            </div>
          ) : (
            <div>
              {recentAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="px-6 py-4 border-b-2 border-border last:border-0 hover:bg-surface cursor-pointer transition-colors flex items-center justify-between"
                  onClick={() => navigate(`/quiz/${attempt.quizId}/results`)}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-ink">{attempt.quizTitle}</h3>
                    <p className="text-sm font-semibold text-slate mt-1">
                      {new Date(attempt.completedAt).toLocaleDateString()} &middot; {attempt.score}/{attempt.totalQuestions} {t('results.correctAnswers').toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-extrabold px-3 py-1 rounded-xl border-2 ${getScoreBg(attempt.percentage)} ${getScoreColor(attempt.percentage)}`}>
                      {attempt.percentage}%
                    </span>
                    <ArrowRight className="w-5 h-5 text-muted" />
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
