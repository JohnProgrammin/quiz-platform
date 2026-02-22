import { motion } from 'framer-motion';
import { Target, Zap } from 'lucide-react';

/**
 * WeakTopicsCard Component
 * Displays topics with low performance scores
 */
export const WeakTopicsCard = ({ topics = [] }) => {
  // Mock data if none provided
  const topicsData = topics.length > 0 ? topics : [
    { topic: 'Algebra', strength: 45, quizzesTaken: 8, color: 'from-red-400 to-red-300' },
    { topic: 'Calculus', strength: 72, quizzesTaken: 5, color: 'from-amber-400 to-amber-300' },
    { topic: 'Geometry', strength: 88, quizzesTaken: 3, color: 'from-green-400 to-green-300' },
  ];

  const getStrengthColor = (strength) => {
    if (strength >= 80) return 'text-green-600';
    if (strength >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getStrengthBg = (strength) => {
    if (strength >= 80) return 'bg-green-100';
    if (strength >= 60) return 'bg-amber-100';
    return 'bg-red-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border-2 border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black text-ink flex items-center gap-3">
          <Target className="w-6 h-6 text-heart" />
          Weak Areas
        </h3>
        <span className="text-xs font-black bg-red-100 text-red-700 px-3 py-1 rounded-full">
          Focus Here
        </span>
      </div>

      <div className="space-y-3">
        {topicsData.map((item, idx) => (
          <motion.div
            key={item.topic}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * idx }}
            className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border-2 border-border hover:border-heart/50 transition-all"
          >
            {/* Topic Name */}
            <div className="flex-1">
              <h4 className="font-black text-ink mb-1">{item.topic}</h4>
              <p className="text-xs text-slate font-bold">
                {item.quizzesTaken} quiz{item.quizzesTaken !== 1 ? 'zes' : ''}
              </p>
            </div>

            {/* Strength Bar */}
            <div className="flex-1">
              <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full bg-gradient-to-r ${item.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.strength}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Strength Badge */}
            <div
              className={`text-right px-3 py-1 rounded-xl font-black text-sm min-w-[60px] ${getStrengthBg(
                item.strength
              )} ${getStrengthColor(item.strength)}`}
            >
              {item.strength}%
            </div>
          </motion.div>
        ))}
      </div>

      {/* Practice CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-6 py-4 rounded-2xl font-black text-white bg-gradient-to-r from-heart to-red-500 hover:from-red-600 hover:to-red-600 transition-all"
      >
        <Zap className="w-5 h-5 inline mr-2 fill-white" />
        Practice Weak Areas
      </motion.button>
    </motion.div>
  );
};

export default WeakTopicsCard;
