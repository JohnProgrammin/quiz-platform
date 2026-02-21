import { motion } from 'framer-motion';
import { Target, CheckCircle2 } from 'lucide-react';
import Progress from '../ui/Progress';

/**
 * Daily Goal Widget Component
 * Shows user's daily goal progress (quizzes, XP, or time spent)
 */
export const DailyGoalWidget = ({
  goalType = 'quizzes', // 'quizzes' | 'xp' | 'minutes'
  current = 0,
  goal = 3,
  isCompleted = false,
}) => {
  const goalText = {
    quizzes: `${current} of ${goal} quizzes`,
    xp: `${current} of ${goal} XP`,
    minutes: `${current} of ${goal} minutes`,
  };

  const goalEmoji = {
    quizzes: '📚',
    xp: '⚡',
    minutes: '⏱️',
  };

  return (
    <motion.div
      className={`rounded-xl p-4 border-2 transition-all ${
        isCompleted
          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
          : 'bg-gradient-to-br from-blue-50 to-brand-50 border-blue-200'
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6 }}
            >
              <CheckCircle2 className="w-6 h-6 text-green-500" fill="currentColor" />
            </motion.div>
          ) : (
            <span className="text-2xl">{goalEmoji[goalType]}</span>
          )}
          <span className="font-semibold text-gray-900">Daily Goal</span>
        </div>

        {isCompleted && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-sm font-bold text-green-600"
          >
            ✓ Complete!
          </motion.span>
        )}
      </div>

      {/* Progress Bar */}
      <Progress
        value={current}
        max={goal}
        label={goalText[goalType]}
        showPercent={true}
        variant={isCompleted ? 'success' : 'default'}
        animated={true}
      />

      {/* Motivation Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={`text-xs mt-3 text-center font-medium ${
          isCompleted ? 'text-green-600' : 'text-gray-600'
        }`}
      >
        {isCompleted ? (
          '🎉 Excellent work today!'
        ) : (
          <>
            {goal - current} more to go! Let's keep the momentum going!
          </>
        )}
      </motion.p>
    </motion.div>
  );
};

export default DailyGoalWidget;
