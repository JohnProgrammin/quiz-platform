import React from 'react';
import { Flame } from 'lucide-react';

function StreakIndicator({ currentStreak = 0, longestStreak = 0 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        {/* Current Streak */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Current Streak</p>
            <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
            </p>
          </div>
        </div>

        {/* Longest Streak (divider) */}
        {longestStreak > currentStreak && (
          <>
            <div className="w-px h-12 bg-gray-200" />
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-600">Longest</p>
              <p className="text-lg font-black text-gray-800">{longestStreak}</p>
            </div>
          </>
        )}
      </div>

      {currentStreak > 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Keep it up! Complete a quiz tomorrow to continue your streak 🎯
        </p>
      )}

      {currentStreak === 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          Complete a quiz tomorrow to start a streak! 🔥
        </p>
      )}
    </div>
  );
}

export default StreakIndicator;
