import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

/**
 * Performance Chart Component
 * Shows performance improvement over 30 days with trend line
 */
export const PerformanceChart = ({ data = [] }) => {
  // Sample data if none provided
  const chartData = data.length > 0 ? data : [
    { week: 'Week 1', avgScore: 65, xpGained: 200 },
    { week: 'Week 2', avgScore: 72, xpGained: 350 },
    { week: 'Week 3', avgScore: 78, xpGained: 450 },
    { week: 'Week 4', avgScore: 85, xpGained: 600 },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-lg shadow-lg border-2 border-purple-200"
        >
          <p className="font-semibold text-gray-900">{payload[0].payload.week}</p>
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
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Overview</h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="week" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          <Area
            type="monotone"
            dataKey="avgScore"
            stroke="#a855f7"
            strokeWidth={3}
            fill="url(#colorScore)"
            name="Avg Score (%)"
            isAnimationActive={true}
            animationDuration={1000}
          />
          <Area
            type="monotone"
            dataKey="xpGained"
            stroke="#f59e0b"
            strokeWidth={3}
            fill="url(#colorXP)"
            name="XP Gained"
            isAnimationActive={true}
            animationDuration={1000}
            animationDelay={200}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Improvement Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        <motion.div
          className="p-3 rounded-lg bg-green-50 border border-green-200"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-gray-600">Score Improvement</p>
          <p className="text-2xl font-bold text-green-600">+20%</p>
          <p className="text-xs text-gray-500 mt-1">Last 4 weeks</p>
        </motion.div>

        <motion.div
          className="p-3 rounded-lg bg-blue-50 border border-blue-200"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-gray-600">Total XP</p>
          <p className="text-2xl font-bold text-blue-600">1,600</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </motion.div>

        <motion.div
          className="p-3 rounded-lg bg-purple-50 border border-purple-200"
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-gray-600">Streak</p>
          <p className="text-2xl font-bold text-purple-600">12 days</p>
          <p className="text-xs text-gray-500 mt-1">Current</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
