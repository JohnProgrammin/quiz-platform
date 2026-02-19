import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';

import UpgradePrompt from './UpgradePrompt';
import GamificationDisplay from './GamificationDisplay';
import { getQuiz, getQuizAttempts, getQuizResults, generateWeaknessQuiz } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Home, CheckCircle, XCircle, Loader2, Trophy, Target, TrendingUp, Lock, Sparkles } from 'lucide-react';

import { soundService } from '../services/sound.service';

function QuizResults({ user, onLogout }) {
  const { t } = useTranslation();
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
    if (!loading && selectedAttempt) {
      if (selectedAttempt.percentage >= 70) {
        soundService.playComplete();
        // Confetti animation for good score
        setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
          });
        }, 500);
      } else {
        // Encouraging but lower key sound for lower scores
        soundService.playError();
      }
    }
  }, [loading, selectedAttempt]);

  // ... further down


  const loadResults = async () => {
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        getQuiz(id),
        getQuizAttempts(id),
      ]);

      setQuiz(quizRes.data?.data || quizRes.data);
      const rawData = attemptsRes.data;
      const attemptsList = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
      const attemptsData = attemptsList.filter(a => a && typeof a === 'object');
      setAttempts(attemptsData);
      if (attemptsData.length > 0) {
        setSelectedAttempt(attemptsData[0]);
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
    if (percentage === 100) return t('results.perfectScore');
    if (percentage >= 80) return t('results.great');
    if (percentage >= 60) return t('results.good');
    if (percentage >= 40) return t('results.keepPracticing');
    return t('results.tryAgain');
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
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-slate font-bold mt-4">{t('results.loadingResults')}</p>
        </div>
      </div>
    );
  }

  if (!quiz || attempts.length === 0) {
    return (
      <div>

        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-ink font-bold text-lg mb-4">{t('results.noResults')}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            {t('results.backToDashboard')}
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
  const safeAttempts = Array.isArray(attempts) ? attempts : [];
  const validAttempts = safeAttempts.filter(a => a.percentage !== undefined && a.percentage !== null);
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
            {latestAttempt?.score} out of {latestAttempt?.totalQuestions} correct
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-border">
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-amber-500" />
                <span className="text-xl font-extrabold text-ink">{safeAttempts.length}</span>
              </div>
              <span className="text-xs font-bold text-slate uppercase">{t('results.attempts')}</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-warning" />
                <span className="text-xl font-extrabold text-ink">{bestScore}%</span>
              </div>
              <span className="text-xs font-bold text-slate uppercase">{t('results.best')}</span>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <span className="text-xl font-extrabold text-ink">{avgScore}%</span>
              </div>
              <span className="text-xs font-bold text-slate uppercase">{t('results.average')}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={() => navigate(`/quiz/${id}`)} className="btn-primary">
              <span className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                {t('results.retakeQuiz')}
              </span>
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              <span className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                {t('results.backToDashboard')}
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
                <h2 className="text-lg font-extrabold text-amber-900">{t('results.aiFeatureUpgrade')}</h2>
              </div>
              <p className="text-amber-800 font-semibold mb-4">
                {t('results.aiFeatureDescription')}
              </p>
              <button
                onClick={() => navigate('/pricing')}
                className="btn-primary"
              >
                {t('results.upgradeToProBtn')}
              </button>
            </div>
          </div>
        ) : (
          aiFeedback && (
            <div className="card p-8 mb-8 bg-blue-50 border-2 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-extrabold text-ink">{t('results.feedback')}</h2>
              </div>
              <p className="text-slate font-semibold mb-6">{aiFeedback.feedback}</p>

              {aiFeedback.weakTopics && aiFeedback.weakTopics.length > 0 && (
                <div>
                  <h3 className="font-bold text-ink mb-3">{t('results.areasToMaster')}:</h3>
                  <div className="flex flex-wrap gap-3">
                    {aiFeedback.weakTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleMasterWeakTopic(topic)}
                        disabled={generatingWeakness}
                        className="px-4 py-2 rounded-xl bg-blue-100 text-blue-600 font-bold hover:bg-blue-200 transition-all disabled:opacity-50"
                      >
                        {t('results.masterWeakness', { topic })}
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
            <h2 className="text-lg font-extrabold text-ink">{t('results.questionReview')}</h2>
            {quiz?.questions?.map((question, index) => {
              const answers = selectedAttempt?.answers || [];
              const answerEntry = Array.isArray(answers) ? answers[index] : null;

              let userValue, isCorrect, feedback, score;

              // Handle both new (object) and legacy (value) answer formats
              if (typeof answerEntry === 'object' && answerEntry !== null && answerEntry.userAnswer !== undefined) {
                userValue = answerEntry.userAnswer;
                isCorrect = answerEntry.isCorrect;
                feedback = answerEntry.feedback;
                score = answerEntry.score;
              } else {
                userValue = answerEntry;
                isCorrect = userValue === question.correctAnswer;
              }

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
                    <div className="flex-1">
                      <h3 className="font-bold text-ink leading-relaxed">
                        {index + 1}. {question.question}
                      </h3>
                      {/* Show score if available (mostly for partially correct text answers) */}
                      {score !== undefined && score !== null && score !== 0 && score !== 100 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded">
                          Partial Credit: {score}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Render based on question type */}
                  {question.type === 'text' || question.type === 'free_text' ? (
                    <div className="ml-11 space-y-4">
                      <div className={`p-4 rounded-xl border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Your Answer</p>
                        <p className="font-semibold text-ink">{userValue || '(No answer provided)'}</p>
                      </div>

                      {!isCorrect && (
                        <div className="p-4 rounded-xl border-2 bg-slate-50 border-slate-200">
                          <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Model Answer</p>
                          <p className="font-semibold text-slate">{question.sampleAnswer || question.correctAnswer || 'No model answer available'}</p>
                        </div>
                      )}

                      {feedback && (
                        <div className="p-4 rounded-xl border-2 bg-blue-50 border-blue-200 flex gap-3">
                          <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">AI Feedback</p>
                            <p className="text-blue-900 font-medium">{feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* MCQ Rendering */
                    <div className="space-y-2 ml-11">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = userValue === optIndex;
                        const isCorrectAnswer = question.correctAnswer === optIndex;

                        let classes = 'p-4 rounded-xl border-2 flex items-center gap-3 text-sm font-bold transition-all ';
                        if (isCorrectAnswer) {
                          classes += 'bg-green-50 border-green-500 text-green-700 shadow-sm';
                        } else if (isUserAnswer && !isCorrect) {
                          classes += 'bg-red-50 border-red-500 text-red-700 shadow-sm';
                        } else {
                          classes += 'bg-white border-gray-200 text-slate opacity-60';
                        }

                        return (
                          <div key={optIndex} className={classes}>
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${isCorrectAnswer ? 'bg-brand-500 text-white' : isUserAnswer && !isCorrect ? 'bg-danger text-white' : 'bg-slate-200 text-slate'
                              }`}>
                              {optionLabels[optIndex]}
                            </span>
                            <span className="flex-1">{option}</span>

                            {isCorrectAnswer && (
                              <div className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-lg ml-auto flex-shrink-0">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Correct Answer</span>
                              </div>
                            )}

                            {isUserAnswer && !isCorrect && (
                              <div className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-lg ml-auto flex-shrink-0">
                                <XCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Your Answer</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Attempt History */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-extrabold text-ink mb-4">{t('results.attemptHistory')}</h2>
            <div className="card">
              <div className="p-4 space-y-2">
                {attempts.map((attempt, index) => (
                  <button
                    key={attempt.id}
                    onClick={() => setSelectedAttempt(attempt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedAttempt?.id === attempt.id
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-border hover:border-muted hover:bg-surface'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-slate">
                        {t('results.attemptNumber', { number: safeAttempts.length - index })}
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
