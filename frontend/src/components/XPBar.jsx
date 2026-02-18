import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

function XPBar({ level = 1, totalXP = 0, nextLevelXP = 100, progressToNextLevel = 0 }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-border p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold via-flame to-gold flex items-center justify-center"
              style={{ boxShadow: '0 3px 0 #cc9e00' }}>
              <span className="text-xl font-black text-white">{level}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-400 flex items-center justify-center border-2 border-white">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-black text-ink uppercase tracking-wide">Level {level}</p>
            <p className="text-xs font-bold text-slate">{totalXP.toLocaleString()} XP total</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-black text-brand-500">{progressToNextLevel}%</p>
          <p className="text-xs font-bold text-muted flex items-center gap-1">
            Level {level + 1} <ChevronRight className="w-3 h-3" />
          </p>
        </div>
      </div>

      {/* Duolingo-style thick progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNextLevel}%` }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="h-full rounded-full relative"
          style={{
            background: 'linear-gradient(90deg, #58CC02, #78E018)',
          }}
        >
          {/* Shine effect */}
          <div className="absolute top-1 left-2 right-2 h-1.5 bg-white/30 rounded-full" />
        </motion.div>
      </div>

      <p className="text-xs font-bold text-muted mt-2 text-center">
        {nextLevelXP.toLocaleString()} XP to next level
      </p>
    </div>
  );
}

export default XPBar;
