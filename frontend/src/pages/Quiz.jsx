import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Progress, PageTransition } from '../components';
import { ChevronRight, Check, X } from 'lucide-react';
import { staggerContainer, staggerItem, shake } from '../lib/animations';

/**
 * Enhanced Quiz Component (Duolingo Style)
 * Beautiful quiz experience with instant feedback and animations
 */
export const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);

  // Sample quiz data
  const questions = [
    {
      id: 1,
      question: 'What is the capital of France?',
      options: ['London', 'Berlin', 'Paris', 'Madrid'],
      correct: 2,
      explanation: 'Paris has been the capital of France since the 12th century.',
    },
    {
      id: 2,
      question: 'Which planet is closest to the Sun?',
      options: ['Venus', 'Mercury', 'Earth', 'Mars'],
      correct: 1,
      explanation: 'Mercury is the smallest planet and closest to the Sun.',
    },
    {
      id: 3,
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correct: 1,
      explanation: 'Basic arithmetic: 2 + 2 = 4',
    },
  ];

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswer = (index) => {
    if (answered) return;

    setSelectedAnswer(index);
    setAnswered(true);

    const isCorrect = index === question.correct;
    if (isCorrect) {
      setScore(score + 1);
      setFeedback({ type: 'correct', message: '🎉 Correct!' });
    } else {
      setFeedback({
        type: 'incorrect',
        message: '❌ Not quite right',
        correctAnswer: question.options[question.correct],
      });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setFeedback(null);
    } else {
      // Quiz complete
      setCurrentQuestion(questions.length);
    }
  };

  if (currentQuestion === questions.length) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, repeat: 3 }}
              className="text-6xl mb-6"
            >
              🎉
            </motion.div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Complete!</h1>

            <div className="mb-6">
              <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {score}/{questions.length}
              </div>
              <p className="text-gray-600 mt-2">
                You got {Math.round((score / questions.length) * 100)}% correct!
              </p>
            </div>

            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl mb-8"
            >
              ⭐
            </motion.div>

            <Button variant="primary" className="w-full">
              View Results
            </Button>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-8">
        {/* Header */}
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Quiz</h1>
            <span className="text-sm font-semibold text-gray-600">
              {currentQuestion + 1}/{questions.length}
            </span>
          </div>

          <Progress value={currentQuestion + 1} max={questions.length} showPercent={false} />
        </motion.div>

        {/* Question Card */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-purple-100 mb-8">
            {/* Question */}
            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {question.question}
            </motion.h2>

            {/* Options */}
            <motion.div
              className="space-y-3"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === question.correct;
                const showResult = answered && isSelected;

                return (
                  <motion.button
                    key={index}
                    variants={staggerItem}
                    onClick={() => handleAnswer(index)}
                    disabled={answered}
                    className={`w-full p-4 rounded-xl font-semibold text-left transition-all border-2 ${
                      !answered
                        ? 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50'
                        : isSelected
                          ? isCorrect
                            ? 'border-green-400 bg-green-50 text-green-900'
                            : 'border-red-400 bg-red-50 text-red-900'
                          : isCorrect
                            ? 'border-green-400 bg-green-50'
                            : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                    whileHover={!answered ? { scale: 1.02 } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    animate={showResult && !isCorrect ? shake.animate : {}}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      <AnimatePresence>
                        {answered && isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            {isCorrect ? (
                              <Check className="w-6 h-6 text-green-600" />
                            ) : (
                              <X className="w-6 h-6 text-red-600" />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>

            {/* Feedback */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mt-6 p-4 rounded-lg ${
                    feedback.type === 'correct'
                      ? 'bg-green-100 border border-green-300'
                      : 'bg-red-100 border border-red-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{feedback.message}</p>
                  {feedback.correctAnswer && (
                    <p className="text-sm text-gray-700 mt-2">
                      The correct answer is: <span className="font-bold">{feedback.correctAnswer}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">{question.explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Next Button */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <Button variant="primary" onClick={handleNext} className="flex items-center gap-2">
                {currentQuestion === questions.length - 1 ? 'Finish' : 'Next Question'}
                <ChevronRight size={20} />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Quiz;
