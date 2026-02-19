import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

function XPBar({ level = 1, totalXP = 0, nextLevelXP = 100, progressToNextLevel = 0 }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">

        {/* Level Badge */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.08, rotate: [0, -4, 4, 0] }}
              transition={{ duration: 0.3 }}
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                boxShadow: '0 4px 0 #4c1d95, 0 0 20px rgba(139,92,246,0.3)',
              }}
            >
              <span className="text-xl font-black text-white">{level}</span>
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gold flex items-center justify-center border-2 border-white"
            >
              <Zap className="w-3 h-3 text-white" />
            </motion.div>
          </div>

          <div>
            <p className="text-xs font-black text-muted uppercase tracking-widest">Level</p>
            <p className="text-2xl font-black text-ink">{level}</p>
            <p className="text-xs font-bold text-muted">{totalXP.toLocaleString()} XP total</p>
          </div>
        </div>

        {/* Next level info */}
        <div className="text-right">
          <motion.div
            key={progressToNextLevel}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-xl font-black text-gradient-violet"
          >
            {progressToNextLevel}%
          </motion.div>
          <p className="text-xs font-bold text-muted flex items-center gap-0.5 justify-end">
            Lv {level + 1} <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Thick Duolingo-style progress bar */}
      <div className="progress-bar">
        <motion.div
          className="progress-bar-fill animate-xp-pulse"
          initial={{ width: 0 }}
          animate={{ width: `${progressToNextLevel}%` }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </div>

      <p className="text-xs font-bold text-muted mt-2 text-center">
        {(nextLevelXP - totalXP % nextLevelXP).toLocaleString()} XP to Level {level + 1}
      </p>
    </div>
  );
}

export default XPBar;
