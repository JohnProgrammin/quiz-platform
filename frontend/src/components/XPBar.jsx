import React from 'react';
import { Zap } from 'lucide-react';

function XPBar({ level = 1, totalXP = 0, nextLevelXP = 100, progressToNextLevel = 0 }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Level {level}</p>
            <p className="text-xs text-gray-500">{totalXP.toLocaleString()} XP</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600 font-medium">{progressToNextLevel}%</p>
          <p className="text-xs text-gray-500">to Level {level + 1}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${progressToNextLevel}%` }}
        />
      </div>

      {/* XP info */}
      <p className="text-xs text-gray-500 mt-2 text-center">
        {nextLevelXP.toLocaleString()} XP to next level
      </p>
    </div>
  );
}

export default XPBar;
