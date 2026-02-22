import { motion } from 'framer-motion';
import { Edit2, Crown } from 'lucide-react';
import useSound from '../../../hooks/useSound';

/**
 * ProfileHeader Component
 * Displays user avatar, name, email, and level/tier badges
 */
export const ProfileHeader = ({ user = {}, level = 1, tier = 'free' }) => {
  const { playClickSound } = useSound();

  const userInitial = (user.fullName || user.username || 'U').charAt(0).toUpperCase();
  const tierLabel = tier.toUpperCase();
  const tierColors = {
    free: 'bg-gray-100 text-gray-700',
    pro: 'bg-violet-100 text-violet-700',
    premium: 'bg-amber-100 text-amber-700',
  };

  const handleEdit = () => {
    playClickSound();
    // TODO: Open edit profile modal
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 md:gap-6 p-4 sm:p-5 md:p-6 bg-white rounded-xl sm:rounded-2xl border-2 border-border mb-6 sm:mb-8"
    >
      {/* Avatar */}
      <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-3xl sm:text-4xl font-black text-white flex-shrink-0">
        {userInitial}
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <h2 className="text-xl sm:text-2xl font-black text-ink mb-1 line-clamp-1">
          {user.fullName || user.username || 'User'}
        </h2>
        <p className="text-xs sm:text-sm text-slate font-bold mb-3 truncate">{user.email || 'No email'}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-black bg-violet-100 text-violet-700">
            Level {level}
          </span>
          <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-black ${tierColors[tier]} flex items-center gap-1`}>
            {tier === 'premium' && <Crown className="w-2 sm:w-3 h-2 sm:h-3" />}
            {tierLabel}
          </span>
        </div>
      </div>

      {/* Edit Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleEdit}
        className="btn-secondary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 flex-shrink-0"
      >
        <Edit2 className="w-3 sm:w-4 h-3 sm:h-4" />
        <span className="hidden sm:inline">Edit</span>
      </motion.button>
    </motion.div>
  );
};

export default ProfileHeader;
