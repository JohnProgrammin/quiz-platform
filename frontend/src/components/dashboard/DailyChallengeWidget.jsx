import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, Target, CheckCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Daily Challenge Widget
 * Shows a daily challenge with progress and XP reward
 * Motivates users to complete daily goals
 */
export const DailyChallengeWidget = ({ recentAttempts, gamification, quizzes }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    // Determine today's challenge based on date
    const today = new Date().toDateString();
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);

    // Different challenges rotate daily
    const challengeOptions = [
      {
        id: 1,
        title: 'Quiz Master',
        description: 'Complete 3 quizzes today',
        icon: '🎯',
        target: 3,
        reward: 50,
        type: 'quizzes',
        color: 'from-blue-400 to-blue-500',
        borderColor: 'border-blue-200'
      },
      {
        id: 2,
        title: 'Perfect Score',
        description: 'Score 90%+ on a quiz',
        icon: '💯',
        target: 1,
        reward: 75,
        type: 'perfect_score',
        color: 'from-amber-400 to-amber-500',
        borderColor: 'border-amber-200'
      },
      {
        id: 3,
        title: 'Consistency King',
        description: 'Maintain your current streak',
        icon: '🔥',
        target: 1,
        reward: 100,
        type: 'streak',
        color: 'from-flame to-red-500',
        borderColor: 'border-flame'
      },
      {
        id: 4,
        title: 'Knowledge Seeker',
        description: 'Complete 5 questions from different quizzes',
        icon: '📚',
        target: 5,
        reward: 60,
        type: 'questions',
        color: 'from-purple-400 to-purple-500',
        borderColor: 'border-purple-200'
      },
    ];

    // Select challenge based on day
    const selectedChallenge = challengeOptions[dayOfYear % challengeOptions.length];
    setChallenge(selectedChallenge);

    // Check if challenge is completed
    checkChallengeCompletion(selectedChallenge);
  }, [recentAttempts, gamification]);

  const checkChallengeCompletion = (selectedChallenge) => {
    if (!selectedChallenge || !recentAttempts) {
      setCompleted(false);
      return;
    }

    const today = new Date().toDateString();
    const todayAttempts = recentAttempts.filter((attempt) => {
      const attemptDate = new Date(attempt.completedAt || attempt.completed_at).toDateString();
      return attemptDate === today;
    });

    let isCompleted = false;

    switch (selectedChallenge.type) {
      case 'quizzes':
        isCompleted = todayAttempts.length >= selectedChallenge.target;
        break;
      case 'perfect_score':
        isCompleted = todayAttempts.some((attempt) => (attempt.percentage || attempt.score) >= 90);
        break;
      case 'streak':
        isCompleted = (gamification?.currentStreak || 0) > 0;
        break;
      case 'questions':
        const totalQuestions = todayAttempts.reduce(
          (sum, attempt) => sum + (attempt.totalQuestions || 0),
          0
        );
        isCompleted = totalQuestions >= selectedChallenge.target;
        break;
      default:
        isCompleted = false;
    }

    setCompleted(isCompleted);
  };

  const getProgress = () => {
    if (!challenge || !recentAttempts) return 0;

    const today = new Date().toDateString();
    const todayAttempts = recentAttempts.filter((attempt) => {
      const attemptDate = new Date(attempt.completedAt || attempt.completed_at).toDateString();
      return attemptDate === today;
    });

    let current = 0;

    switch (challenge.type) {
      case 'quizzes':
        current = todayAttempts.length;
        break;
      case 'perfect_score':
        current = todayAttempts.some((a) => (a.percentage || a.score) >= 90) ? 1 : 0;
        break;
      case 'streak':
        current = (gamification?.currentStreak || 0) > 0 ? 1 : 0;
        break;
      case 'questions':
        current = todayAttempts.reduce(
          (sum, attempt) => sum + (attempt.totalQuestions || 0),
          0
        );
        break;
      default:
        current = 0;
    }

    return Math.min(Math.round((current / challenge.target) * 100), 100);
  };

  if (!challenge) {
    return null;
  }

  const progress = getProgress();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className={`bg-gradient-to-br ${challenge.color} rounded-2xl border-2 ${challenge.borderColor} border-b-4 p-5 sm:p-6 md:p-7 overflow-hidden relative`}
    >
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />

      <div className="relative z-10">
        {/* Header with icon and reward */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl sm:text-4xl">{challenge.icon}</span>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white mb-1">
                {challenge.title}
              </h3>
              <p className="text-sm sm:text-base font-bold text-white/90">
                {challenge.description}
              </p>
            </div>
          </div>

          {/* Reward badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex-shrink-0"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white" />
            <span className="font-black text-white text-sm sm:text-base">+{challenge.reward} XP</span>
          </motion.div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs sm:text-sm font-bold text-white/80 uppercase tracking-wider">
              Progress
            </p>
            <p className="text-sm sm:text-base font-black text-white">{progress}%</p>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-white rounded-full shadow-lg"
            />
          </div>
        </div>

        {/* Status and CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {completed ? (
              <>
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-sm sm:text-base">Challenge Complete!</span>
              </>
            ) : (
              <>
                <Target className="w-5 h-5 text-white/70" />
                <span className="font-bold text-white/70 text-sm sm:text-base">In Progress</span>
              </>
            )}
          </div>

          {!completed ? (
            <button
              onClick={() => navigate('/notes')}
              className="bg-white text-current font-black px-4 py-2 rounded-xl hover:bg-white/90 active:translate-y-0.5 transition-all text-sm sm:text-base whitespace-nowrap"
            >
              Take Quiz
            </button>
          ) : (
            <div className="px-4 py-2 bg-white/20 rounded-xl border-2 border-white/30 font-bold text-white text-sm sm:text-base">
              ✨ Reward Ready
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DailyChallengeWidget;
