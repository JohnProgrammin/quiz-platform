import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getQuiz, submitQuiz, getPreQuizSummary } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { soundService } from '../services/sound.service';
import { Loader, X, BookOpen, Clock, ArrowRight, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Quiz({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showTeaching, setShowTeaching] = useState(true);
  const [teaching, setTeaching] = useState(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const response = await getQuiz(id);
      // API returns { data: { ...quiz, questions: [...] } }
      const quizData = response.data.data || response.data;
      setQuiz(quizData);

      // Load teaching summary for Pro+ users
      if (tier !== 'free' && quizData?.note_id) {
        try {
          const teachingRes = await getPreQuizSummary(quizData.note_id);
          setTeaching(teachingRes.data);
        } catch (err) {
          console.warn('Failed to load teaching summary:', err);
        }
      } else {
        setShowTeaching(false);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionIndex, optionIndex) => {
    setAnswers({ ...answers, [questionIndex]: optionIndex });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setError('');

    const answeredCount = Object.keys(answers).length;
    if (answeredCount < quiz.questions.length) {
      const confirmSubmit = window.confirm(
        `You've only answered ${answeredCount} of ${quiz.questions.length} questions. Submit anyway?`
      );
      if (!confirmSubmit) {
        return;
      }
    }

    setSubmitting(true);
    try {
      const answersArray = quiz.questions.map((_, index) => answers[index] ?? -1);
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
      console.log('Submitting quiz with answers:', answersArray, 'Time spent:', timeSpentSeconds, 'seconds');
      const response = await submitQuiz(id, answersArray, timeSpentSeconds);
      console.log('Submit response:', response);

      if (response && response.data) {
        navigate(`/quiz/${id}/results`, {
          state: {
            gamification: response.data.gamification,
          },
        });
      } else {
        setError('Failed to submit quiz: Invalid response from server');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit quiz';
      setError(`Error: ${errorMessage}`);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>

        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-slate font-bold mt-4">{t('quiz.loadingQuiz') || 'Loading quiz...'}</p>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div>

        <div className="flex flex-col items-center justify-center h-96">
          <X className="w-16 h-16 text-danger mb-4" />
          <p className="text-ink font-black text-2xl">{t('quiz.notFound') || 'Quiz not found or has no questions'}</p>
        </div>
      </div>
    );
  }

  // Show teaching modal for Pro+ users
  if (showTeaching && teaching && tier !== 'free') {
    return (
      <div>

        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-10 max-h-[80vh] overflow-y-auto border border-gray-300 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-brand-500" />
              </div>
              <h2 className="text-3xl font-black text-ink">{t('quiz.preQuizTeaching') || 'Pre-Quiz Teaching'}</h2>
            </div>

            <div className="mb-10">
              <p className="text-lg font-semibold text-ink mb-6 leading-relaxed">{teaching.data?.summary}</p>

              {teaching.data?.keyPoints && (
                <div className="bg-green-50 p-6 rounded-lg border border-green-300">
                  <h3 className="font-black text-ink mb-4 text-lg">{t('quiz.keyConcepts') || 'Key Concepts:'}</h3>
                  <ul className="space-y-3">
                    {teaching.data.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-brand-500 font-black text-lg flex-shrink-0">{idx + 1}.</span>
                        <span className="text-slate font-semibold">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowTeaching(false)}
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-brand-500 text-white font-black rounded-lg hover:bg-brand-600 transition-colors"
            >
              {t('quiz.startQuiz') || 'Start Quiz'} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  // Show progress based on current position rather than just answered count so bar is always visible
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Error Message */}
      {error && (
        <div className="mb-8 p-5 bg-red-50 border border-red-300 rounded-lg shadow-sm">
          <p className="text-danger font-bold">{error}</p>
        </div>
      )}

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="mb-8"
        >
          <div className="bg-white border-2 border-border rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-400 to-fuchsia-500" />
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-violet-100 text-violet-600 font-black text-sm">
                {currentQuestion + 1}
              </span>
              <span className="text-sm font-black tracking-widest text-slate uppercase">
                {t('quiz.question', { current: currentQuestion + 1, total: quiz.questions.length }) || `OF ${quiz.questions.length}`}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-ink leading-tight">
              {question.question || question.text || question.q}
            </h2>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Options - MCQ */}
      {question.type === 'mcq' && (
        <div className="space-y-3 mb-10">
          {question.options.map((option, index) => {
            const isSelected = answers[currentQuestion] === index;
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.01, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleSelectAnswer(currentQuestion, index);
                  soundService.play('bubble');
                }}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 sm:border-b-4 transition-all font-semibold flex items-center gap-4 group ${isSelected
                  ? 'border-violet-500 bg-violet-50 text-violet-700 shadow-sm'
                  : 'border-border bg-white text-ink hover:border-violet-300 hover:bg-violet-50/30'
                  }`}
              >
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 transition-colors ${isSelected
                  ? 'bg-violet-500 text-white shadow-inner'
                  : 'bg-surface text-slate border-2 border-border group-hover:border-violet-300 group-hover:text-violet-500'
                  }`}>
                  {optionLabels[index]}
                </span>
                <span className="text-base sm:text-lg leading-relaxed flex-1">{option}</span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-violet-500 bg-violet-500' : 'border-border'
                  }`}>
                  {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Free-Text Answer */}
      {question.type === 'text' && (
        <div className="mb-8">
          <textarea
            value={answers[currentQuestion] || ''}
            onChange={(e) => handleSelectAnswer(currentQuestion, e.target.value)}
            placeholder={t('quiz.typeAnswerHere') || 'Type your answer here...'}
            className="w-full h-40 p-6 border-2 border-border rounded-2xl resize-none focus:border-violet-500 focus:outline-none transition-colors font-semibold text-lg"
          />
          <p className="text-sm font-semibold text-slate mt-3 text-right">{(answers[currentQuestion]?.length || 0).toLocaleString()} characters</p>
        </div>
      )}

      {/* Progress Section (Moved to Bottom) */}
      <div className="mb-10">
        <div className="flex items-end justify-between mb-3">
          <span className="text-xs font-black text-slate uppercase tracking-widest flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-violet-500" />
            {t('landing.demo.questionProgress') || 'Progress'}
          </span>
          <span className="text-sm font-black text-violet-600">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-surface rounded-full h-3 sm:h-4 overflow-hidden shadow-inner border border-white/50">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-400 to-fuchsia-500 rounded-full relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', stiffness: 50, damping: 15 }}
          >
            <div className="absolute inset-0 w-full animate-shimmer opacity-20" style={{ backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }} />
          </motion.div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 mb-12">
        {currentQuestion > 0 && (
          <button
            onClick={handlePrevious}
            className="btn-secondary flex-1 sm:flex-none"
          >
            {t('quiz.previousQuestion') || 'Back'}
          </button>
        )}

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={() => {
              soundService.play('success');
              handleSubmit();
            }}
            disabled={submitting}
            className="btn-primary flex-1 bg-gradient-to-r from-brand-500 to-green-500 hover:from-brand-600 hover:to-green-600 border-none group"
            style={{ boxShadow: '0 4px 0 #166534' }}
          >
            {submitting ? (
              <><Loader className="w-5 h-5 animate-spin" /> {t('common.loading') || 'Submitting...'}</>
            ) : (
              <><CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" /> {t('quiz.submitQuiz') || 'Submit Quiz'}</>
            )}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn-primary flex-1 group"
          >
            {t('quiz.nextQuestion') || 'Continue'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* Question Navigator */}
      <div className="bg-white border-2 border-border border-b-4 rounded-2xl p-6 sm:p-8 shadow-sm">
        <p className="text-sm font-black text-slate mb-4 uppercase tracking-widest">{t('quiz.jumpToQuestion') || 'Jump to Question'}</p>
        <div className="flex flex-wrap gap-2.5">
          {quiz.questions.map((_, index) => {
            const isCurrent = currentQuestion === index;
            const isAnswered = answers[index] !== undefined;
            return (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentQuestion(index)}
                className={`w-12 h-12 rounded-xl text-base font-black transition-all border-2 flex items-center justify-center ${isCurrent
                  ? 'bg-violet-500 text-white border-violet-600 shadow-md ring-4 ring-violet-100'
                  : isAnswered
                    ? 'bg-violet-100 text-violet-700 border-violet-200 hover:border-violet-300'
                    : 'bg-surface text-slate border-border hover:border-violet-300 hover:bg-white shadow-sm'
                  }`}
              >
                {index + 1}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Quiz;
