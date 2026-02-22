import { motion } from 'framer-motion';
import { Clock, Calendar, Zap, Award } from 'lucide-react';

/**
 * StudyInsights Component
 * Displays study patterns and insights
 */
export const StudyInsights = ({ insights = {} }) => {
  const defaultInsights = {
    totalTimeMinutes: 1430,
    bestTimeOfDay: 'Evening (6-9 PM)',
    mostActiveDay: 'Wednesday',
    averageSessionMinutes: 38,
  };

  const data = { ...defaultInsights, ...insights };

  const insightCards = [
    {
      title: 'Total Study Time',
      value: `${Math.round(data.totalTimeMinutes / 60)}h ${data.totalTimeMinutes % 60}m`,
      icon: <Clock className="w-6 h-6" />,
      gradient: 'from-blue-400 to-blue-300',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Best Time to Study',
      value: data.bestTimeOfDay,
      icon: <Zap className="w-6 h-6" />,
      gradient: 'from-gold to-amber-300',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Most Active Day',
      value: data.mostActiveDay,
      icon: <Calendar className="w-6 h-6" />,
      gradient: 'from-violet-400 to-violet-300',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Avg Session Length',
      value: `${data.averageSessionMinutes}m`,
      icon: <Award className="w-6 h-6" />,
      gradient: 'from-brand-400 to-brand-300',
      bgColor: 'bg-brand-50',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {insightCards.map((card, idx) => (
        <motion.div
          key={card.title}
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -4 }}
          className={`${card.bgColor} rounded-[2rem] border-2 border-border p-6 cursor-default transition-all`}
        >
          {/* Icon */}
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 text-white`}
          >
            {card.icon}
          </div>

          {/* Title */}
          <p className="text-xs font-black text-muted uppercase tracking-widest mb-2">{card.title}</p>

          {/* Value */}
          <p className="text-2xl font-black text-ink">{card.value}</p>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StudyInsights;
