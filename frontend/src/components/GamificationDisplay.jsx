import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Zap, Trophy, Flame } from 'lucide-react';

function GamificationDisplay({ xpAwarded, leveledUp, newLevel, currentStreak }) {
  const { t } = useTranslation();
  const [showAnimation, setShowAnimation] = useState(true);

  useEffect(() => {
    // Auto-hide animation after 4 seconds
    const timer = setTimeout(() => setShowAnimation(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!showAnimation) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-xs mx-auto sm:mx-0 pointer-events-none">
      <div className="space-y-3 pointer-events-auto">
        {/* XP Earned */}
        {xpAwarded > 0 && (
          <div className="animate-slide-up bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl p-4 text-white shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-bounce">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold opacity-90">{t('gamification.xpEarned')}</p>
                <p className="text-2xl font-black">+{xpAwarded} XP</p>
              </div>
            </div>
          </div>
        )}

        {/* Level Up */}
        {leveledUp && (
          <div className="animate-slide-up-delay bg-gradient-to-r from-brand-500 to-brand-500 rounded-2xl p-4 text-white shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold opacity-90">{t('gamification.levelUp')}</p>
                <p className="text-2xl font-black">{t('gamification.level', { level: newLevel })}</p>
              </div>
            </div>
          </div>
        )}

        {/* Streak */}
        {currentStreak > 0 && (
          <div className="animate-slide-up-delay-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 text-white shadow-xl transform hover:scale-105 transition-transform">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold opacity-90">{t('gamification.streak')}</p>
                <p className="text-2xl font-black">{currentStreak} {currentStreak === 1 ? 'day' : 'days'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up-delay {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          30% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up-delay-2 {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          60% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.5s ease-out forwards;
        }

        .animate-slide-up-delay {
          animation: slide-up-delay 0.8s ease-out forwards;
        }

        .animate-slide-up-delay-2 {
          animation: slide-up-delay-2 1.1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default GamificationDisplay;
