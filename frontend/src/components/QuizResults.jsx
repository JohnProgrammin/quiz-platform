import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuiz } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTranslation } from 'react-i18next';
import {
  Trophy, TrendingUp, Target, ArrowRight, Home, RotateCcw,
  Flame, Zap, CheckCircle2, XCircle, Loader2, BookOpen, AlertCircle, Award
} from 'lucide-react';

/**
 * Quiz Results Component - Celebratory & Guiding Learning Experience
 * Features:
 * - Celebratory score display with confetti
 * - Performance breakdown stats
 * - Learning path recommendations
 * - Wrong answer reviews
 * - Level-up modal
 * - Next action buttons
 */
function QuizResults({ user, gamificationStats }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { tier } = useSubscription();

  // State
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedWrongQuestion, setSelectedWrongQuestion] = useState(null);

  useEffect(() => {
    loadResults();
  }, [id, location]);

  const loadResults = async () => {
    try {
      setLoading(true);
      // Get quiz data
      const response = await getQuiz(id);
      const quizData = response.data.data || response.data;
      setQuiz(quizData);

      // CRITICAL FIX: Only use location.state if:
      // 1. fromQuiz flag is set (meaning we just came from Quiz.jsx submission)
      // 2. gamification data exists
      if (location.state?.fromQuiz && location.state?.gamification) {
        setAttempt({
          ...location.state.gamification,
          data: location.state.data || {},
        });

        // Show level-up modal if applicable
        if (location.state.gamification?.leveledUp) {
          setTimeout(() => setShowLevelUp(true), 1500);
        }

        // Trigger confetti
        setTimeout(() => triggerConfetti(), 300);
        setError('');
      } else {
        // If no valid location state, this is an error - user shouldn't be here
        setError('Invalid access. Please start the quiz first.');
      }
    } catch (err) {
      console.error('Error loading results:', err);
      setError('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#58CC02', '#4ade80', '#22c55e', '#16a34a', '#fbbf24', '#f59e0b'],
      zIndex: 999,
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.5 },
        colors: ['#58CC02', '#fbbf24'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.5 },
        colors: ['#58CC02', '#fbbf24'],
      });
    }, 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-slate font-bold">{t('common.loading') || 'Loading results...'}</p>
        </div>
      </div>
    );
  }

  if (error || !quiz || !attempt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-ink mb-2">Oops!</h2>
          <p className="text-slate font-bold mb-6">{error || 'Results not found'}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const percentage = attempt.data?.percentage || 0;
  const score = attempt.data?.score || 0;
  const total = attempt.data?.total || quiz.questions?.length || 0;
  const xpAwarded = attempt.xpAwarded || 0;
  const newLevel = attempt.newLevel || gamificationStats?.level || 1;
  const leveledUp = attempt.leveledUp || false;
  const answers = attempt.data?.gradedAnswers || [];
  const wrongAnswers = answers.filter((ans) => !ans.isCorrect);

  // Score messaging
  const getScoreMessage = () => {
    if (percentage === 100) return { emoji: '👑', message: "Perfect! You're a master!", color: 'text-amber-600' };
    if (percentage >= 90) return { emoji: '💪', message: 'Excellent! You crushed it!', color: 'text-green-600' };
    if (percentage >= 80) return { emoji: '⭐', message: 'Great job! Keep it up!', color: 'text-blue-600' };
    if (percentage >= 70) return { emoji: '📚', message: 'Good effort! Practice makes perfect!', color: 'text-purple-600' };
    return { emoji: '🔥', message: "Don't worry, you're improving!", color: 'text-orange-600' };
  };

  const scoreMsg = getScoreMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 py-8 px-4 sm:px-6">
      {/* LEVEL-UP MODAL */}
      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="bg-white rounded-3xl p-8 max-w-sm text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="mb-6"
              >
                <Trophy className="w-20 h-20 text-amber-500 mx-auto" />
              </motion.div>
              <h2 className="text-4xl font-black text-ink mb-2">LEVEL UP!</h2>
              <p className="text-3xl font-black text-brand-500 mb-6">
                Level {newLevel}
              </p>
              <p className="text-slate font-bold mb-8">
                You've unlocked new achievements and rewards!
              </p>
              <button
                onClick={() => setShowLevelUp(false)}
                className="btn-primary w-full"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        {/* CELEBRATORY SCORE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl border-2 border-border p-8 sm:p-10 mb-8 shadow-lg"
        >
          {/* Score Circle */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
              className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-brand-100 to-brand-50 border-4 border-brand-500 flex items-center justify-center mb-6 relative"
            >
              <div className="text-center">
                <p className="text-7xl font-black text-brand-600">{percentage}%</p>
                <p className="text-lg font-bold text-brand-500 mt-2">
                  {score}/{total} Correct
                </p>
              </div>

              {/* Floating XP Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
                className="absolute -top-4 -right-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-full p-3 shadow-lg flex items-center gap-1"
              >
                <Zap className="w-5 h-5 fill-white" />
                <span className="font-black text-sm">+{xpAwarded}</span>
              </motion.div>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <p className="text-5xl mb-3">{scoreMsg.emoji}</p>
              <h2 className={`text-3xl font-black ${scoreMsg.color} mb-2`}>
                {scoreMsg.message}
              </h2>
              {leveledUp && (
                <p className="text-lg font-bold text-amber-600 flex items-center justify-center gap-2 mt-3">
                  <Trophy className="w-5 h-5" />
                  Level {newLevel}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* PERFORMANCE BREAKDOWN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {/* Correct */}
          <div className="bg-white rounded-2xl border-2 border-border p-4 text-center">
            <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-ink">{score}</p>
            <p className="text-xs font-bold text-muted uppercase">Correct</p>
          </div>

          {/* Incorrect */}
          <div className="bg-white rounded-2xl border-2 border-border p-4 text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-ink">{total - score}</p>
            <p className="text-xs font-bold text-muted uppercase">Incorrect</p>
          </div>

          {/* Accuracy % */}
          <div className="bg-white rounded-2xl border-2 border-border p-4 text-center">
            <Target className="w-6 h-6 text-brand-500 mx-auto mb-2" />
            <p className="text-2xl font-black text-brand-600">{percentage}%</p>
            <p className="text-xs font-bold text-muted uppercase">Accuracy</p>
          </div>
        </motion.div>

        {/* LEARNING PATH */}
        {wrongAnswers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-2xl border-2 border-blue-200 p-6 mb-8"
          >
            <div className="flex items-start gap-3 mb-4">
              <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-black text-ink text-lg">📚 What to Study Next</h3>
                <p className="text-sm font-bold text-slate mt-1">
                  Review your {wrongAnswers.length} incorrect answer{wrongAnswers.length !== 1 ? 's' : ''} below to improve faster
                </p>
              </div>
            </div>

            <div className="space-y-2">
              {wrongAnswers.slice(0, 3).map((ans, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedWrongQuestion(idx)}
                  whileHover={{ scale: 1.02 }}
                  className="w-full p-3 bg-white rounded-lg border-2 border-blue-200 text-left hover:border-blue-400 transition-all"
                >
                  <p className="font-bold text-sm text-ink">
                    Question {answers.indexOf(ans) + 1}
                  </p>
                  <p className="text-xs text-slate font-bold mt-1 line-clamp-2">
                    {ans.questionText}
                  </p>
                </motion.button>
              ))}
              {wrongAnswers.length > 3 && (
                <p className="text-xs font-bold text-blue-600 text-center">
                  +{wrongAnswers.length - 3} more to review
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* WRONG ANSWER DETAIL VIEW */}
        <AnimatePresence>
          {selectedWrongQuestion !== null && wrongAnswers[selectedWrongQuestion] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border-2 border-red-200 p-6 mb-8"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <h4 className="font-black text-ink">Question Review</h4>
                <button
                  onClick={() => setSelectedWrongQuestion(null)}
                  className="text-muted hover:text-ink transition-colors text-xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Question */}
                <div>
                  <p className="text-sm font-bold text-muted mb-2">Your Question</p>
                  <p className="font-black text-ink">
                    {wrongAnswers[selectedWrongQuestion].questionText}
                  </p>
                </div>

                {/* Your Answer */}
                <div>
                  <p className="text-sm font-bold text-red-600 mb-1">❌ Your Answer</p>
                  <p className="text-sm font-bold text-ink bg-red-50 p-3 rounded-lg">
                    {wrongAnswers[selectedWrongQuestion].userAnswer !== undefined
                      ? quiz.questions?.[0]?.options?.[wrongAnswers[selectedWrongQuestion].userAnswer] || 'Not answered'
                      : 'Not answered'}
                  </p>
                </div>

                {/* Correct Answer */}
                <div>
                  <p className="text-sm font-bold text-green-600 mb-1">✓ Correct Answer</p>
                  <p className="text-sm font-bold text-ink bg-green-50 p-3 rounded-lg">
                    {quiz.questions?.[0]?.options?.[wrongAnswers[selectedWrongQuestion].correctAnswer] || 'Not found'}
                  </p>
                </div>

                {/* Explanation */}
                <div>
                  <p className="text-sm font-bold text-slate mb-2">💡 Keep Learning!</p>
                  <p className="text-sm text-slate leading-relaxed">
                    Review your notes on this topic and take another quiz to master it. Every mistake is a learning opportunity!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
        >
          {/* Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-border rounded-xl font-black text-sm hover:border-brand-400 hover:bg-brand-50 transition-all"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>

          {/* Retake Quiz */}
          <motion.button
            onClick={() => navigate(`/quiz/${id}`)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-black text-sm shadow-md hover:shadow-lg transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Quiz
          </motion.button>

          {/* New Quiz */}
          <button
            onClick={() => navigate('/notes')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-border rounded-xl font-black text-sm hover:border-brand-400 hover:bg-brand-50 transition-all"
          >
            <ArrowRight className="w-5 h-5" />
            New Quiz
          </button>
        </motion.div>

        {/* STREAK REMINDER */}
        {gamificationStats?.currentStreak > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="p-4 bg-gradient-to-r from-flame/10 to-gold/10 border-2 border-flame/30 rounded-xl text-center"
          >
            <p className="font-black text-ink">
              🔥 Keep your {gamificationStats.currentStreak}-day streak alive!
            </p>
            <p className="text-sm font-bold text-slate mt-1">
              Come back tomorrow for another quiz
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default QuizResults;
