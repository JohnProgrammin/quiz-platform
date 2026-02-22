import { motion } from 'framer-motion';
import { Lock, Crown, Zap } from 'lucide-react';

/**
 * AchievementCard Component
 * Displays individual achievement with locked/unlocked states
 */
export const AchievementCard = ({
  id,
  name,
  description,
  icon,
  tier = 'bronze',
  xpReward = 0,
  unlocked = false,
  unlockedAt = null,
}) => {
  const getTierGradient = (tier) => {
    switch (tier) {
      case 'bronze':
        return 'from-orange-400 to-orange-600';
      case 'silver':
        return 'from-gray-300 to-gray-400';
      case 'gold':
        return 'from-gold to-flame';
      case 'platinum':
        return 'from-violet-400 to-indigo-500';
      default:
        return 'from-slate-300 to-slate-400';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'bronze':
        return 'text-orange-700';
      case 'silver':
        return 'text-gray-700';
      case 'gold':
        return 'text-amber-700';
      case 'platinum':
        return 'text-violet-700';
      default:
        return 'text-slate-700';
    }
  };

  const getTierLabel = (tier) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05, y: -4 } : { scale: 1.02 }}
      className={`relative rounded-[2rem] border-2 p-6 transition-all ${
        unlocked
          ? 'bg-white border-border shadow-card hover:shadow-card-hover'
          : 'bg-surface border-border/50'
      }`}
    >
      {/* Tier Badge - Top Right */}
      <div
        className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${getTierGradient(
          tier
        )} shadow-md`}
      >
        <Crown className="w-4 h-4 text-white" />
      </div>

      {/* Icon */}
      <div className="text-5xl mb-3 select-none">{icon}</div>

      {/* Name */}
      <h3 className={`text-lg font-black text-ink mb-1 ${unlocked ? '' : ''}`}>{name}</h3>

      {/* Description */}
      <p className={`text-sm font-bold mb-3 ${unlocked ? 'text-slate' : 'text-slate/50'}`}>
        {description}
      </p>

      {/* XP Reward */}
      <div className="flex items-center gap-2 text-gold">
        <Zap className="w-4 h-4 fill-current" />
        <span className="font-black text-sm">+{xpReward} XP</span>
      </div>

      {/* Unlock Date */}
      {unlocked && unlockedAt && (
        <p className="text-xs text-slate/60 font-bold mt-2">
          Unlocked {new Date(unlockedAt).toLocaleDateString()}
        </p>
      )}

      {/* Lock Overlay */}
      {!unlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-[2rem] group">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <Lock className="w-12 h-12 text-muted mx-auto mb-2" />
            <p className="text-xs font-black text-slate">Locked</p>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default AchievementCard;
