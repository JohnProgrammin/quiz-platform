import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

/**
 * Learning Heatmap Component
 * Displays hourly study distribution across the week
 */
export const LearningHeatmap = ({ recentAttempts = [] }) => {
  // Calculate hourly study distribution
  const calculateHourlyDistribution = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const distribution = hours.map((hour) => {
      const count = recentAttempts.filter((attempt) => {
        const attemptHour = new Date(attempt.completedAt || attempt.completed_at).getHours();
        return attemptHour === hour;
      }).length;
      return { hour: `${hour}:00`, count, hour24: hour };
    });

    return distribution;
  };

  const hourlyData = calculateHourlyDistribution();
  const maxCount = Math.max(...hourlyData.map((h) => h.count), 1);

  // Color intensity based on activity level
  const getHeatColor = (count, max) => {
    if (count === 0) return 'bg-gray-100 text-muted';
    const intensity = count / max;
    if (intensity >= 0.8) return 'bg-brand-600 text-white';
    if (intensity >= 0.6) return 'bg-brand-500 text-white';
    if (intensity >= 0.4) return 'bg-brand-400 text-white';
    if (intensity >= 0.2) return 'bg-brand-300 text-white';
    return 'bg-brand-100 text-brand-700';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-5 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-6">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-brand-400 to-brand-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-ink">Learning Heatmap</h3>
      </div>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate font-bold mb-5">
        Most active study hours (24-hour format)
      </p>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 sm:gap-1.5 min-w-max pb-3">
          {hourlyData.map((item) => (
            <motion.div
              key={item.hour24}
              className="flex flex-col items-center gap-2"
              whileHover={{ scale: 1.1 }}
            >
              {/* Bar */}
              <div
                className={`w-6 sm:w-7 flex items-end justify-center rounded-sm sm:rounded-md transition-all cursor-pointer group relative ${getHeatColor(
                  item.count,
                  maxCount
                )}`}
                style={{
                  height: `${Math.max((item.count / maxCount) * 80, 4)}px`,
                  minHeight: '4px',
                }}
              >
                {/* Tooltip */}
                {item.count > 0 && (
                  <div className="absolute bottom-full mb-2 bg-ink text-white text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count} quiz{item.count !== 1 ? 'zes' : ''}
                  </div>
                )}
              </div>

              {/* Hour Label */}
              <span className="text-xs font-bold text-slate">
                {item.hour24}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-5 border-t-2 border-border flex gap-4 sm:gap-6">
        <div>
          <p className="text-xs text-muted font-bold uppercase">Most Active Hour</p>
          <p className="text-lg sm:text-2xl font-black text-ink mt-1">
            {hourlyData.length > 0
              ? hourlyData.reduce((max, h) => (h.count > max.count ? h : max), { hour: '--', count: 0 }).hour
              : '--'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted font-bold uppercase">Peak Activity</p>
          <p className="text-lg sm:text-2xl font-black text-brand-500 mt-1">
            {Math.max(...hourlyData.map((h) => h.count))} quiz{Math.max(...hourlyData.map((h) => h.count)) !== 1 ? 'zes' : ''}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LearningHeatmap;
