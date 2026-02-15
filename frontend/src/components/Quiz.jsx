import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getQuiz, submitQuiz, getPreQuizSummary } from '../api';
import { useSubscription } from '../contexts/SubscriptionContext';
import { Loader, X, BookOpen } from 'lucide-react';

function Quiz({ user, onLogout }) {
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

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const response = await getQuiz(id);
      setQuiz(response.data);

      // Load teaching summary for Pro+ users
      if (tier !== 'free' && response.data.note_id) {
        try {
          const teachingRes = await getPreQuizSummary(response.data.note_id);
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
      console.log('Submitting quiz with answers:', answersArray);
      const response = await submitQuiz(id, answersArray);
      console.log('Submit response:', response);

      if (response && response.data) {
        navigate(`/quiz/${id}/results`);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-slate font-bold mt-4">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex flex-col items-center justify-center h-96">
          <X className="w-16 h-16 text-danger mb-4" />
          <p className="text-ink font-black text-2xl">Quiz not found</p>
        </div>
      </div>
    );
  }

  // Show teaching modal for Pro+ users
  if (showTeaching && teaching && tier !== 'free') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
        <Navbar user={user} onLogout={onLogout} />
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-10 max-h-[80vh] overflow-y-auto border-2 border-gray-200 shadow-2xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-brand-500" />
              </div>
              <h2 className="text-3xl font-black text-ink">Pre-Quiz Teaching</h2>
            </div>

            <div className="mb-10">
              <p className="text-lg font-semibold text-ink mb-6 leading-relaxed">{teaching.data?.summary}</p>

              {teaching.data?.keyPoints && (
                <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border-2 border-green-100">
                  <h3 className="font-black text-ink mb-4 text-lg">Key Concepts:</h3>
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
              className="w-full inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-brand-400 to-brand-600 text-white font-black rounded-2xl hover:shadow-lg transition-all"
            >
              Start Quiz →
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((Object.keys(answers).length) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-100">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-black text-brand-600">Question {currentQuestion + 1} of {quiz.questions.length}</p>
              <p className="text-sm font-semibold text-slate">{answeredCount} answered</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-ink">{Math.round(progress)}%</p>
              <p className="text-xs font-semibold text-slate">Complete</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-2xl shadow-sm">
            <p className="text-danger font-bold">{error}</p>
          </div>
        )}

        {/* Question Card */}
        <div className="bg-white border-2 border-gray-200 rounded-3xl p-10 mb-8 shadow-sm">
          <p className="text-lg font-semibold text-slate mb-2">Question {currentQuestion + 1}</p>
          <h2 className="text-3xl font-black text-ink leading-tight">
            {question.text || question.q}
          </h2>
        </div>

        {/* Options - MCQ */}
        {question.type === 'mcq' && (
          <div className="space-y-4 mb-10">
            {question.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(currentQuestion, index)}
                  className={`w-full text-left p-6 rounded-2xl border-2 transition-all font-semibold flex items-start gap-4 ${
                    isSelected
                      ? 'border-brand-400 bg-gradient-to-r from-brand-50 to-green-50 text-brand-600 shadow-md'
                      : 'border-gray-200 bg-white text-ink hover:border-brand-300 hover:shadow-md'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white'
                      : 'bg-gray-100 text-slate border-2 border-gray-300'
                  }`}>
                    {optionLabels[index]}
                  </span>
                  <span className="text-lg leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Free-Text Answer */}
        {question.type === 'text' && (
          <div className="mb-10">
            <textarea
              value={answers[currentQuestion] || ''}
              onChange={(e) => handleSelectAnswer(currentQuestion, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full h-40 p-6 border-2 border-gray-200 rounded-2xl resize-none focus:border-brand-400 focus:outline-none transition-all font-semibold"
            />
            <p className="text-sm font-semibold text-slate mt-3">{(answers[currentQuestion]?.length || 0).toLocaleString()} characters</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mb-10">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex-1 px-6 py-4 border-2 border-gray-300 text-ink font-black rounded-2xl hover:bg-gray-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-brand-400 to-brand-600 text-white font-black rounded-2xl hover:shadow-lg transition-all disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-brand-400 to-brand-600 text-white font-black rounded-2xl hover:shadow-lg transition-all"
            >
              Next →
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <p className="text-sm font-black text-slate mb-4 uppercase tracking-wide">Jump to question</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-11 h-11 rounded-xl text-sm font-black transition-all ${
                  currentQuestion === index
                    ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-md'
                    : answers[index] !== undefined
                    ? 'bg-brand-200 text-brand-700 border-2 border-brand-300'
                    : 'bg-gray-100 text-slate border-2 border-gray-300 hover:border-brand-300 hover:bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Quiz;
