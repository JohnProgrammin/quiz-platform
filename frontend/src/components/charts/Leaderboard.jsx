import { motion } from 'framer-motion';
import { Crown, Medal, Zap } from 'lucide-react';
import { staggerContainer, staggerItem } from '../../lib/animations';

/**
 * Leaderboard Component
 * Shows top performers ranked by level and XP
 */
export const Leaderboard = ({ users = [] }) => {
  // Sample data if none provided
  const leaderboardData = users.length > 0 ? users : [
    { id: 1, rank: 1, name: 'Alex Chen', level: 25, xp: 5250, avatar: '👨‍💼' },
    { id: 2, rank: 2, name: 'Sarah Johnson', level: 23, xp: 4890, avatar: '👩‍💼' },
    { id: 3, rank: 3, name: 'Marcus Brown', level: 22, xp: 4650, avatar: '👨‍🎓' },
    { id: 4, rank: 4, name: 'Emily Davis', level: 20, xp: 4200, avatar: '👩‍🎓' },
    { id: 5, rank: 5, name: 'James Wilson', level: 19, xp: 3950, avatar: '👨‍💻' },
  ];

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" fill="currentColor" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" fill="currentColor" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-400" fill="currentColor" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-orange-100 to-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm"
    >
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">🏆 Leaderboard</h3>
        <p className="text-sm text-gray-600">Top performers this month</p>
      </div>

      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {leaderboardData.map((user, index) => (
          <motion.div
            key={user.id}
            variants={staggerItem}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${getRankColor(
              user.rank
            )}`}
            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)' }}
          >
            {/* Rank */}
            <div className="flex-shrink-0">{getMedalIcon(user.rank)}</div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{user.avatar}</span>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-600">Level {user.level}</p>
                </div>
              </div>
            </div>

            {/* XP and Stats */}
            <div className="text-right">
              <div className="flex items-center gap-1 justify-end mb-1">
                <Zap className="w-4 h-4 text-yellow-500" fill="currentColor" />
                <span className="font-bold text-gray-900">{user.xp.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500">XP</p>
            </div>

            {/* Trend indicator */}
            {user.rank <= 3 && (
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex-shrink-0 text-lg"
              >
                ⬆️
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* View More */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full mt-6 py-3 rounded-lg bg-purple-50 border-2 border-purple-200 text-purple-700 font-semibold hover:bg-purple-100 transition-colors"
      >
        View Full Leaderboard →
      </motion.button>
    </motion.div>
  );
};

export default Leaderboard;
