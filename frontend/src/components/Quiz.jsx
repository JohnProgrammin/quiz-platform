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
      <div className="min-h-screen bg-surface">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex flex-col items-center justify-center h-96">
          <Loader className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-slate font-bold mt-4">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex flex-col items-center justify-center h-96">
          <X className="w-12 h-12 text-danger mb-3" />
          <p className="text-ink font-bold text-lg">Quiz not found</p>
        </div>
      </div>
    );
  }

  // Show teaching modal for Pro+ users
  if (showTeaching && teaching && tier !== 'free') {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar user={user} onLogout={onLogout} />
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 max-h-96 overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-brand-500" />
              </div>
              <h2 className="text-2xl font-extrabold text-ink">Pre-Quiz Teaching</h2>
            </div>

            <div className="mb-8">
              <p className="text-lg font-bold text-ink mb-4">{teaching.data?.summary}</p>

              {teaching.data?.keyPoints && (
                <div className="mb-6">
                  <h3 className="font-bold text-ink mb-3">Key Concepts:</h3>
                  <ul className="space-y-2">
                    {teaching.data.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-slate font-semibold">
                        <span className="text-brand-500 font-black">{idx + 1}.</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowTeaching(false)}
              className="btn-primary w-full"
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
    <div className="min-h-screen bg-surface">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate">
          <span>{answeredCount}/{quiz.questions.length} answered</span>
          <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
        </div>
        <div className="progress-bar mb-8">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-danger rounded-xl">
            <p className="text-danger font-bold">{error}</p>
          </div>
        )}

        {/* Question */}
        <div className="card p-8 mb-6">
          <h2 className="text-xl font-extrabold text-ink leading-relaxed">
            {question.text}
          </h2>
        </div>

        {/* Options - MCQ */}
        {question.type === 'mcq' && (
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              const isSelected = answers[currentQuestion] === index;
              return (
                <button
                  key={index}
                  onClick={() => handleSelectAnswer(currentQuestion, index)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition-all font-bold flex items-center gap-4 ${
                    isSelected
                      ? 'border-brand-400 bg-brand-50 text-brand-500 border-b-4'
                      : 'border-border bg-white text-ink hover:bg-surface border-b-4 hover:border-muted'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black flex-shrink-0 ${
                    isSelected
                      ? 'bg-brand-400 text-white'
                      : 'bg-surface text-slate border-2 border-border'
                  }`}>
                    {optionLabels[index]}
                  </span>
                  <span className="text-base">{option}</span>
                </button>
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
              placeholder="Type your answer here..."
              className="input-field w-full h-32 resize-none"
            />
            <p className="text-sm font-semibold text-slate mt-2">{answers[currentQuestion]?.length || 0} characters</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn-secondary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            PREVIOUS
          </button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {submitting ? 'SUBMITTING...' : 'SUBMIT QUIZ'}
            </button>
          ) : (
            <button onClick={handleNext} className="btn-primary flex-1">
              NEXT
            </button>
          )}
        </div>

        {/* Question Navigator */}
        <div className="card p-5 mt-8">
          <p className="text-sm font-bold text-slate mb-3 uppercase tracking-wide">Jump to question</p>
          <div className="flex flex-wrap gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                  currentQuestion === index
                    ? 'bg-brand-400 text-white'
                    : answers[index] !== undefined
                    ? 'bg-brand-500 text-white'
                    : 'bg-surface text-slate border-2 border-border hover:border-muted'
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
