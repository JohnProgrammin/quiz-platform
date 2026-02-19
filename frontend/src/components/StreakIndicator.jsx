import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

function StreakIndicator({ currentStreak = 0, longestStreak = 0 }) {
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date().getDay();
  const mappedToday = today === 0 ? 6 : today - 1;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">

        {/* Flame + streak count */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={currentStreak > 0 ? { scale: [1, 1.15, 1], rotate: [0, 3, -3, 0] } : {}}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
            className={`w-14 h-14 rounded-full flex items-center justify-center ${currentStreak > 0
                ? 'bg-gradient-to-br from-flame to-heart'
                : 'bg-gray-100'
              }`}
            style={currentStreak > 0 ? {
              boxShadow: '0 4px 0 #b91c1c, 0 0 20px rgba(255,122,26,0.3)',
            } : {}}
          >
            <Flame className={`w-7 h-7 ${currentStreak > 0 ? 'text-white animate-flame' : 'text-muted'}`} />
          </motion.div>

          <div>
            <p className="text-xs font-black text-muted uppercase tracking-widest">
              {currentStreak > 0 ? 'Streak' : 'No streak'}
            </p>
            {currentStreak > 0
              ? <p className="text-2xl font-black text-gradient-fire">
                {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
              </p>
              : <p className="text-sm font-bold text-muted">Start learning today!</p>
            }
          </div>
        </div>

        {/* Best streak badge */}
        {longestStreak > 0 && (
          <div className="text-right bg-amber-50 rounded-2xl px-3 py-2 border border-amber-200">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-wide">Best</p>
            <p className="text-xl font-black text-flame">{longestStreak}</p>
          </div>
        )}
      </div>

      {/* Weekly calendar */}
      <div className="flex items-center justify-between gap-1">
        {weekDays.map((day, i) => {
          const isCompleted = i <= mappedToday && currentStreak > (mappedToday - i);
          const isToday = i === mappedToday;

          return (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] font-black text-muted uppercase">{day}</span>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 20 }}
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${isCompleted
                    ? 'text-white'
                    : isToday
                      ? 'border-2 border-violet-400 text-violet-500'
                      : 'bg-gray-100 text-muted'
                  }`}
                style={isCompleted ? {
                  background: 'linear-gradient(135deg, #ff7a1a, #ff4b6a)',
                  boxShadow: '0 2px 0 #b91c1c',
                } : {}}
              >
                {isCompleted ? <Flame className="w-4 h-4" /> : day}
              </motion.div>
            </div>
          );
        })}
      </div>

      <p className="text-xs font-bold text-muted mt-3 text-center">
        {currentStreak > 0
          ? `Keep it going! Complete a quiz tomorrow 🎯`
          : `Complete a quiz to start a streak! 🔥`
        }
      </p>
    </div>
  );
}

export default StreakIndicator;
