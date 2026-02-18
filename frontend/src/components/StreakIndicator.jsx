import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

function StreakIndicator({ currentStreak = 0, longestStreak = 0 }) {
  // Weekly dots (last 7 days) — simple visual
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay(); // 0 = Sunday
  const mappedToday = today === 0 ? 6 : today - 1; // Convert to 0=Monday

  return (
    <div className="bg-white rounded-2xl border-2 border-border p-5">
      <div className="flex items-center justify-between mb-4">
        {/* Current Streak */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={currentStreak > 0 ? {
              scale: [1, 1.15, 1],
              rotate: [0, 2, -2, 0],
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${currentStreak > 0
                ? 'bg-gradient-to-br from-flame to-heart'
                : 'bg-gray-200'
              }`}
            style={currentStreak > 0 ? { boxShadow: '0 3px 0 #cc7700' } : {}}
          >
            <Flame className={`w-7 h-7 ${currentStreak > 0 ? 'text-white' : 'text-muted'}`} />
          </motion.div>
          <div>
            <p className="text-sm font-black text-ink uppercase tracking-wide">
              {currentStreak > 0 ? 'Streak' : 'No streak'}
            </p>
            {currentStreak > 0 ? (
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-flame to-heart">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </p>
            ) : (
              <p className="text-sm font-bold text-muted">Start learning today!</p>
            )}
          </div>
        </div>

        {/* Longest Streak */}
        {longestStreak > 0 && (
          <div className="text-right bg-amber-50 rounded-xl px-3 py-2">
            <p className="text-xs font-black text-slate uppercase">Best</p>
            <p className="text-xl font-black text-flame">{longestStreak}</p>
          </div>
        )}
      </div>

      {/* Weekly Streak Calendar */}
      <div className="flex items-center justify-between gap-1 mt-2">
        {weekDays.map((day, i) => {
          const isCompleted = i <= mappedToday && currentStreak > (mappedToday - i);
          const isToday = i === mappedToday;

          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] font-black text-muted uppercase">{day}</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isCompleted
                    ? 'bg-brand-400 text-white'
                    : isToday
                      ? 'border-2 border-brand-400 text-brand-400'
                      : 'bg-gray-100 text-muted'
                  }`}
                style={isCompleted ? { boxShadow: '0 2px 0 #4CAD00' } : {}}
              >
                {isCompleted ? (
                  <Flame className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">{day}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentStreak > 0 && (
        <p className="text-xs font-bold text-muted mt-3 text-center">
          Complete a quiz tomorrow to keep your streak! 🎯
        </p>
      )}
      {currentStreak === 0 && (
        <p className="text-xs font-bold text-muted mt-3 text-center">
          Complete a quiz to start a streak! 🔥
        </p>
      )}
    </div>
  );
}

export default StreakIndicator;
