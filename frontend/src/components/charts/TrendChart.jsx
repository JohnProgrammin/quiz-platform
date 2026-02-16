import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

/**
 * Trend Chart Component
 * Shows quiz performance trends over last 7 days
 */
export const TrendChart = ({ data = [] }) => {
  // Sample data if none provided
  const chartData = data.length > 0 ? data : [
    { date: 'Mon', score: 78, quizzes: 2 },
    { date: 'Tue', score: 85, quizzes: 3 },
    { date: 'Wed', score: 82, quizzes: 2 },
    { date: 'Thu', score: 90, quizzes: 4 },
    { date: 'Fri', score: 88, quizzes: 3 },
    { date: 'Sat', score: 92, quizzes: 5 },
    { date: 'Sun', score: 95, quizzes: 4 },
  ];

  const colors = {
    score: '#a855f7', // purple
    quizzes: '#ec4899', // pink
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-lg shadow-lg border-2 border-purple-200"
        >
          <p className="font-semibold text-gray-900">{payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value}
            </p>
          ))}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Trend</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.score} stopOpacity={0.8} />
              <stop offset="100%" stopColor={colors.score} stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="quizzesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.quizzes} stopOpacity={0.8} />
              <stop offset="100%" stopColor={colors.quizzes} stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Bar
            dataKey="score"
            fill="url(#scoreGradient)"
            name="Avg Score (%)"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
          />
          <Bar
            dataKey="quizzes"
            fill="url(#quizzesGradient)"
            name="Quizzes Completed"
            radius={[8, 8, 0, 0]}
            isAnimationActive={true}
            animationDuration={800}
            animationDelay={200}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
          <p className="text-gray-600">Avg Score</p>
          <p className="text-2xl font-bold text-purple-600">88%</p>
        </div>
        <div className="p-3 rounded-lg bg-pink-50 border border-pink-200">
          <p className="text-gray-600">Total Quizzes</p>
          <p className="text-2xl font-bold text-pink-600">23</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TrendChart;
