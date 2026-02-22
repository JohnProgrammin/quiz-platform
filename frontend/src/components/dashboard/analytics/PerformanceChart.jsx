import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

/**
 * PerformanceChart Component
 * Displays score trends over last 7 days using Recharts
 */
export const PerformanceChart = ({ data = [] }) => {
  // Format data for Recharts if needed
  const chartData = data.length > 0 ? data : [
    { date: '2026-02-15', score: 75 },
    { date: '2026-02-16', score: 82 },
    { date: '2026-02-17', score: 78 },
    { date: '2026-02-18', score: 90 },
    { date: '2026-02-19', score: 85 },
    { date: '2026-02-20', score: 88 },
    { date: '2026-02-21', score: 92 },
  ];

  const averageScore = Math.round(
    chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length
  );

  const maxScore = Math.max(...chartData.map(d => d.score));
  const minScore = Math.min(...chartData.map(d => d.score));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] border-2 border-border p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-ink mb-2">Performance Trend (Last 7 Days)</h3>
          <p className="text-sm text-slate font-bold">Average score: {averageScore}%</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-brand-500">{maxScore}%</div>
          <p className="text-xs text-slate font-bold">Peak</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#58CC02" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#58CC02" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4f0" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#9999b8"
            style={{ fontSize: '12px', fontWeight: 600 }}
            tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis stroke="#9999b8" domain={[0, 100]} style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '2px solid #e4e4f0',
              borderRadius: '1rem',
              padding: '8px 12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            labelStyle={{ color: '#1a1a2e', fontWeight: 'bold' }}
            formatter={(value) => [`${value}%`, 'Score']}
            labelFormatter={(date) => new Date(date).toLocaleDateString()}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#58CC02"
            strokeWidth={3}
            fill="url(#colorScore)"
            dot={{ fill: '#58CC02', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#58CC02' }}
            isAnimationActive={true}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Stats Below Chart */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t-2 border-border">
        <div className="text-center">
          <p className="text-2xl font-black text-brand-500">{averageScore}%</p>
          <p className="text-xs font-bold text-slate uppercase tracking-wider mt-1">Avg Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-green-500">{maxScore}%</p>
          <p className="text-xs font-bold text-slate uppercase tracking-wider mt-1">Peak</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-gold">{minScore}%</p>
          <p className="text-xs font-bold text-slate uppercase tracking-wider mt-1">Low</p>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
