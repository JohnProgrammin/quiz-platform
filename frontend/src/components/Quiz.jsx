import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getQuiz, submitQuiz } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useSound } from '../hooks/useSound';
import { useTranslation } from 'react-i18next';
import {
  Flame, Zap, Award, ArrowLeft, ArrowRight, Check, X, Loader2, ChevronDown
} from 'lucide-react';

/**
 * Quiz Component - Gamified & Polished Quiz-Taking Experience
 * Features:
 * - Header bar with streak/level/XP display
 * - Progress bar
 * - Per-question animations and feedback
 * - XP popups
 * - Sound effects
 * - MCQ-only (removed free-text)
 */
function Quiz({ user, gamificationStats }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { tier } = useSubscription();
  const { playClickSound } = useSound();

  // State Management
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [startTime] = useState(Date.now());
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [xpPopups, setXpPopups] = useState([]);
  const [streak, setStreak] = useState(gamificationStats?.currentStreak || 0);
  const [level, setLevel] = useState(gamificationStats?.level || 1);
  const [todayXP, setTodayXP] = useState(0);

  // Load Quiz
  useEffect(() => {
    // CRITICAL: Reset ALL state when quiz ID changes to prevent stale state
    setQuiz(null);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption(null);
    setShowFeedback(false);
    setXpPopups([]);
    setTodayXP(0);
    setError('');
    setLoading(true);

    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await getQuiz(id);
      const quizData = response.data.data || response.data;

      // Verify quiz data is valid
      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        throw new Error('Invalid quiz data - no questions found');
      }

      setQuiz(quizData);
      setError('');
    } catch (error) {
      console.error('Error loading quiz:', error);
      setError('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-brand-500 animate-spin mx-auto mb-4" />
          <p className="text-slate font-bold">{t('common.loading') || 'Loading quiz...'}</p>
        </motion.div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-black text-ink mb-2">Oops!</h2>
          <p className="text-slate font-bold mb-6">{error || 'Quiz not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;
  const progress = Math.round(((currentQuestion + 1) / quiz.questions.length) * 100);
  const hasAnswer = answers[currentQuestion] !== undefined;

  // Handle Answer Selection
  const handleSelectAnswer = (optionIndex) => {
    if (selectedOption !== null) return; // Prevent changing answer after selection

    playClickSound();
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === question.correctAnswer;

    // Show feedback for 1.5 seconds
    setTimeout(() => {
      setShowFeedback(true);
      if (isCorrect) {
        // Play success sound
        playClickSound(); // Could be replaced with success-specific sound
        // Show XP popup
        const xpReward = 10;
        setXpPopups([...xpPopups, { id: Math.random(), amount: xpReward }]);
        setTodayXP(todayXP + xpReward);

        // Remove popup after animation
        setTimeout(() => {
          setXpPopups(prev => prev.slice(1));
        }, 1500);
      }
    }, 300);

    // Store answer
    setAnswers({ ...answers, [currentQuestion]: optionIndex });
  };

  // Navigation
  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setSelectedOption(null);
      setShowFeedback(false);
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setSelectedOption(null);
      setShowFeedback(false);
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit Quiz
  const handleSubmit = async () => {
    setError('');

    if (answeredCount < quiz.questions.length) {
      const confirmSubmit = window.confirm(
        `You've only answered ${answeredCount} of ${quiz.questions.length} questions. Submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    setSubmitting(true);
    try {
      const answersArray = quiz.questions.map((_, index) => answers[index] ?? -1);
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);

      const response = await submitQuiz(id, answersArray, timeSpentSeconds);

      if (response && response.data) {
        navigate(`/quiz/${id}/results`, {
          state: {
            gamification: response.data.gamification,
            fromQuiz: true,
          },
        });
      } else {
        setError('Failed to submit quiz');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  // Jump to Question Navigator
  const handleJumpToQuestion = (questionIndex) => {
    setSelectedOption(null);
    setShowFeedback(false);
    setCurrentQuestion(questionIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-50">
      {/* HEADER BAR */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 bg-white border-b-2 border-border shadow-sm"
      >
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3">
          {/* Back Button & Streak */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-brand-50 rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-ink" />
            </button>

            {/* Streak Counter */}
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-flame/10 to-gold/10 rounded-lg border border-gold/30"
              >
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-flame fill-flame" />
                </motion.div>
                <span className="text-xs sm:text-sm font-black text-ink">{streak}</span>
              </motion.div>
            )}
          </div>

          {/* Center: Question Progress */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center flex-shrink-0"
          >
            <p className="text-xs sm:text-sm font-black text-ink">
              Question {currentQuestion + 1} / {quiz.questions.length}
            </p>
          </motion.div>

          {/* Right: Level + Today's XP */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto min-w-0">
            {/* Level Badge */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-brand-100 to-brand-50 rounded-lg border border-brand-200 flex-shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-brand-600" />
              <span className="text-xs sm:text-sm font-black text-brand-700 hidden sm:inline">{level}</span>
            </div>

            {/* Today's XP */}
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-brand-50 to-white rounded-lg border border-brand-200 flex-shrink-0">
              <Zap className="w-4 h-4 text-brand-500 fill-brand-500" />
              <span className="text-xs sm:text-sm font-black text-brand-600">{todayXP}</span>
            </div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="h-2 bg-brand-100">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <motion.div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* QUESTION CARD */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border-2 border-border p-6 sm:p-8 shadow-sm mb-6"
          >
            {/* Question Text */}
            <h2 className="text-2xl sm:text-3xl font-black text-ink mb-8 leading-tight">
              {question.text || question.question}
            </h2>

            {/* MCQ OPTIONS */}
            <div className="space-y-3 mb-8">
              {question.options && question.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = index === question.correctAnswer;
                const showCorrect = showFeedback && isCorrect;
                const showIncorrect = showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    onClick={() => !showFeedback && handleSelectAnswer(index)}
                    disabled={showFeedback}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    className={`w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 text-left font-bold transition-all duration-200 flex items-start gap-3 ${
                      showCorrect
                        ? 'bg-green-50 border-green-400 text-green-700'
                        : showIncorrect
                        ? 'bg-red-50 border-red-400 text-red-700'
                        : isSelected && !showFeedback
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-white border-border text-ink hover:border-brand-400 hover:bg-brand-50/30'
                    }`}
                  >
                    {/* Letter Badge */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm ${
                        showCorrect
                          ? 'bg-green-200 text-green-700'
                          : showIncorrect
                          ? 'bg-red-200 text-red-700'
                          : isSelected && !showFeedback
                          ? 'bg-brand-200 text-brand-700'
                          : 'bg-border text-slate'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>

                    {/* Option Text */}
                    <span className="flex-1 text-sm sm:text-base">{option}</span>

                    {/* Checkmark/X Icon */}
                    {showCorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      </motion.div>
                    )}
                    {showIncorrect && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                        <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* FEEDBACK MESSAGE */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-4 rounded-xl mb-6 ${
                    selectedOption === question.correctAnswer
                      ? 'bg-green-50 border-2 border-green-200'
                      : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <p
                    className={`font-black text-sm sm:text-base ${
                      selectedOption === question.correctAnswer
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {selectedOption === question.correctAnswer ? '✓ CORRECT!' : '✗ INCORRECT'}
                  </p>
                  {selectedOption !== question.correctAnswer && (
                    <p className="text-xs sm:text-sm text-red-600 font-bold mt-1">
                      The correct answer is: {question.options[question.correctAnswer]}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* XP NOTIFICATION */}
        <AnimatePresence>
          {xpPopups.map((popup) => (
            <motion.div
              key={popup.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -40, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="fixed pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translateX(-50%) translateY(-50%)',
              }}
            >
              <div className="text-3xl font-black text-brand-500">+{popup.amount} XP</div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* NAVIGATION & SUBMIT BUTTONS */}
        <div className="flex gap-3 items-center justify-between mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || submitting}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-sm transition-all ${
              currentQuestion === 0 || submitting
                ? 'opacity-50 cursor-not-allowed bg-border text-muted'
                : 'bg-white border-2 border-border text-ink hover:border-brand-400 hover:bg-brand-50'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          {/* Question Navigator */}
          <div className="flex-1 flex flex-wrap gap-1.5 justify-center max-h-10 overflow-hidden">
            {quiz.questions.slice(0, 8).map((_, idx) => (
              <motion.button
                key={idx}
                onClick={() => handleJumpToQuestion(idx)}
                whileHover={{ scale: 1.1 }}
                className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${
                  idx === currentQuestion
                    ? 'bg-brand-500 text-white shadow-md'
                    : answers[idx] !== undefined
                    ? 'bg-brand-200 text-brand-700'
                    : 'bg-border text-slate'
                }`}
              >
                {idx + 1}
              </motion.button>
            ))}
            {quiz.questions.length > 8 && (
              <motion.div className="w-8 h-8 rounded-lg bg-border text-muted flex items-center justify-center text-xs font-black">
                +{quiz.questions.length - 8}
              </motion.div>
            )}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={!submitting ? { scale: 1.05 } : {}}
              whileTap={!submitting ? { scale: 0.95 } : {}}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-lg font-black text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <Check className="w-4 h-4" />
                </>
              )}
            </motion.button>
          ) : (
            <motion.button
              onClick={handleNext}
              disabled={!hasAnswer || submitting}
              whileHover={hasAnswer && !submitting ? { scale: 1.05 } : {}}
              whileTap={hasAnswer && !submitting ? { scale: 0.95 } : {}}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-black text-sm transition-all ${
                hasAnswer && !submitting
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md hover:shadow-lg'
                  : 'opacity-50 cursor-not-allowed bg-border text-muted'
              }`}
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* PROGRESS TEXT */}
        <motion.p className="text-center text-xs sm:text-sm text-slate font-bold mt-6">
          {answeredCount} of {quiz.questions.length} questions answered
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Quiz;
