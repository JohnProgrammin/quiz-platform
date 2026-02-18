import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';

import UpgradePrompt from './UpgradePrompt';
import GamificationDisplay from './GamificationDisplay';
import { getQuiz, getQuizAttempts, getQuizResults, generateWeaknessQuiz } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { RotateCcw, Home, CheckCircle, XCircle, Loader, Trophy, Target, TrendingUp, Lock, Sparkles } from 'lucide-react';

function QuizResults({ user, onLogout }) {
  const { id } = useParams();
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tier } = useSubscription();
  const [quiz, setQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingWeakness, setGeneratingWeakness] = useState(false);
  const [gamification, setGamification] = useState(null);

  // Get gamification data from navigation state if available
  useEffect(() => {
    if (location?.state?.gamification) {
      setGamification(location.state.gamification);
    }
  }, [location]);

  useEffect(() => {
    loadResults();
  }, [id]);

  // Trigger celebration animation for good scores
  useEffect(() => {
    if (!loading && selectedAttempt && selectedAttempt.percentage >= 70) {
      // Confetti animation for good score
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }, [loading, selectedAttempt]);

  const loadResults = async () => {
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        getQuiz(id),
        getQuizAttempts(id),
      ]);

      setQuiz(quizRes.data);
      setAttempts(attemptsRes.data);
      if (attemptsRes.data.length > 0) {
        setSelectedAttempt(attemptsRes.data[0]);
      }
    } catch (error) {
      console.error('Error loading results:', error);
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
    if (percentage >= 80) return 'bg-green-50';
    if (percentage >= 60) return 'bg-amber-50';
    return 'bg-red-50';
  };

  const getScoreMessage = (percentage) => {
    if (percentage === 100) return 'Perfect score!';
    if (percentage >= 80) return 'Great job!';
    if (percentage >= 60) return 'Good effort!';
    if (percentage >= 40) return 'Keep practicing!';
    return 'Try again!';
  };

  const handleMasterWeakTopic = async (weakTopic) => {
    if (!selectedAttempt) return;

    setGeneratingWeakness(true);
    try {
      const response = await generateWeaknessQuiz(selectedAttempt.id, [weakTopic]);
      navigate(`/quiz/${response.data.id}`);
    } catch (error) {
      console.error('Error generating weakness quiz:', error);
      alert('Failed to generate weakness quiz');
    } finally {
      setGeneratingWeakness(false);
    }
  };

  if (loading) {
    return (
      <div>
        
        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-slate font-bold mt-4">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!quiz || attempts.length === 0) {
    return (
      <div>
        
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-ink font-bold text-lg mb-4">No results found</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            GO TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  const latestAttempt = selectedAttempt || attempts[0];

  // Safely calculate percentage - handle missing or undefined values
  const percentage = latestAttempt?.percentage ?? (latestAttempt?.score && latestAttempt?.total_questions
    ? Math.round((latestAttempt.score / latestAttempt.total_questions) * 100)
    : 0);

  // Filter out attempts without valid percentages
  const validAttempts = attempts.filter(a => a.percentage !== undefined && a.percentage !== null);
  const bestScore = validAttempts.length > 0 ? Math.max(...validAttempts.map(a => a.percentage)) : 0;
  const avgScore = validAttempts.length > 0
    ? Math.round(validAttempts.reduce((sum, a) => sum + a.percentage, 0) / validAttempts.length)
    : 0;

  return (
    <div>
      

      {gamification && (
        <GamificationDisplay
          xpAwarded={gamification.xpAwarded}
          leveledUp={gamification.leveledUp}
          newLevel={gamification.newLevel}
          currentStreak={gamification.currentStreak}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Score Header */}
        <div className="card p-8 mb-8 text-center">
          <div className={`w-24 h-24 rounded-full ${getScoreBg(percentage)} flex items-center justify-center mx-auto mb-4`}>
            <span className={`text-4xl font-black ${getScoreColor(percentage)}`}>{percentage}%</span>
          </div>
          <h1 className={`text-2xl font-extrabold mb-1 ${getScoreColor(percentage)}`}>
            {getScoreMessage(percentage)}
          </h1>
          <p className="text-slate font-bold">
            {latestAttempt.score} out of {latestAttempt.totalQuestions} correct
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-border">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-xl font-extrabold text-ink">{attempts.length}</span>
              </div>
              <span className="text-xs font-bold text-slate uppercase">Attempts</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-warning" />
                <span className="text-xl font-extrabold text-ink">{bestScore}%</span>
              </div>
              <span className="text-xs font-bold text-slate uppercase">Best</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <span className="text-xl font-extrabold text-ink">{avgScore}%</span>
              </div>
              <span className="text-xs font-bold text-slate uppercase">Average</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={() => navigate(`/quiz/${id}`)} className="btn-primary">
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                RETAKE QUIZ
              </span>
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                DASHBOARD
              </span>
            </button>
          </div>
        </div>

        {/* AI Feedback Section (Pro+ only) */}
        {tier === 'free' ? (
          <div className="card p-8 mb-8 bg-amber-50 border-2 border-amber-500 relative overflow-hidden">
            <div className="absolute inset-0 backdrop-blur-sm bg-white/40" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-amber-600" />
                <h2 className="text-lg font-extrabold text-amber-900">AI Feedback (Upgrade to Pro)</h2>
              </div>
              <p className="text-amber-800 font-semibold mb-4">
                Get personalized AI feedback, identify weak topics, and generate focused mastery quizzes.
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        ) : (
          aiFeedback && (
            <div className="card p-8 mb-8 bg-blue-50 border-2 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-extrabold text-ink">AI Feedback</h2>
              </div>
              <p className="text-slate font-semibold mb-6">{aiFeedback.feedback}</p>

              {aiFeedback.weakTopics && aiFeedback.weakTopics.length > 0 && (
                <div>
                  <h3 className="font-bold text-ink mb-3">Areas to Master:</h3>
                  <div className="flex flex-wrap gap-3">
                    {aiFeedback.weakTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMasterWeakTopic(topic)}
                        disabled={generatingWeakness}
                        className="px-4 py-2 rounded-xl bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 transition-all disabled:opacity-50"
                      >
                        Master {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Question Review */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-extrabold text-ink">Question Review</h2>
            {quiz.questions.map((question, index) => {
              const answers = latestAttempt.answers || [];
              const userAnswer = Array.isArray(answers) ? answers[index] : null;
              const isCorrect = userAnswer === question.correctAnswer;
              const optionLabels = ['A', 'B', 'C', 'D'];

              return (
                <div key={index} className="card p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {isCorrect ? (
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-5 h-5 text-brand-500" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <XCircle className="w-5 h-5 text-danger" />
                      </div>
                    )}
                    <h3 className="font-bold text-ink leading-relaxed">
                      {index + 1}. {question.question}
                    </h3>
                  </div>

                  <div className="space-y-2 ml-11">
                    {question.options.map((option, optIndex) => {
                      const isUserAnswer = userAnswer === optIndex;
                      const isCorrectAnswer = question.correctAnswer === optIndex;

                      let classes = 'p-3 rounded-xl border-2 flex items-center gap-3 text-sm font-bold ';
                      if (isCorrectAnswer) {
                        classes += 'bg-green-50 border-brand-500 text-brand-500';
                      } else if (isUserAnswer && !isCorrect) {
                        classes += 'bg-red-50 border-danger text-danger';
                      } else {
                        classes += 'bg-surface border-border text-slate';
                      }

                      return (
                        <div key={optIndex} className={classes}>
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                            isCorrectAnswer ? 'bg-brand-500 text-white' : isUserAnswer && !isCorrect ? 'bg-danger text-white' : 'bg-slate-200 text-slate'
                          }`}>
                            {optionLabels[optIndex]}
                          </span>
                          <span>{option}</span>
                          {isCorrectAnswer && <CheckCircle className="w-4 h-4 ml-auto flex-shrink-0" />}
                          {isUserAnswer && !isCorrect && <XCircle className="w-4 h-4 ml-auto flex-shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Attempt History */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-extrabold text-ink mb-4">Attempt History</h2>
            <div className="card">
              <div className="p-4 space-y-2">
                {attempts.map((attempt, index) => (
                  <button
                    key={attempt.id}
                    onClick={() => setSelectedAttempt(attempt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                      selectedAttempt?.id === attempt.id
                        ? 'border-brand-400 bg-brand-50'
                        : 'border-border hover:border-muted hover:bg-surface'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate">
                        Attempt #{attempts.length - index}
                      </span>
                      <span className={`text-lg font-extrabold ${getScoreColor(attempt.percentage || 0)}`}>
                        {attempt.percentage || (attempt.score && attempt.total_questions ? Math.round((attempt.score / attempt.total_questions) * 100) : 0)}%
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-muted">
                      {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : new Date(attempt.completedAt || Date.now()).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizResults;
