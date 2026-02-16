import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

/**
 * Score Distribution Chart Component
 * Shows distribution of quiz scores (Perfect/Great/Good/Needs Work)
 */
export const ScoreDistribution = ({ data = [] }) => {
  // Sample data if none provided
  const chartData = data.length > 0 ? data : [
    { name: 'Perfect (90+%)', value: 12, color: '#10b981' },
    { name: 'Great (80-89%)', value: 18, color: '#3b82f6' },
    { name: 'Good (70-79%)', value: 8, color: '#f59e0b' },
    { name: 'Needs Work (<70%)', value: 3, color: '#ef4444' },
  ];

  const COLORS = chartData.map((item) => item.color);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-lg shadow-lg border-2"
          style={{ borderColor: data.color }}
        >
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p style={{ color: data.color }} className="text-lg font-bold">
            {data.value} quizzes
          </p>
          <p className="text-sm text-gray-600">
            {Math.round((data.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100)}%
          </p>
        </motion.div>
      );
    }
    return null;
  };

  const renderLabel = (entry) => {
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    const percent = Math.round((entry.value / total) * 100);
    return `${percent}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Score Distribution</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={true}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend with stats */}
      <div className="mt-6 space-y-3">
        {chartData.map((item, index) => {
          const total = chartData.reduce((sum, i) => sum + i.value, 0);
          const percent = Math.round((item.value / total) * 100);

          return (
            <motion.div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              whileHover={{ x: 5 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-gray-900">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-600">{percent}%</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default ScoreDistribution;
