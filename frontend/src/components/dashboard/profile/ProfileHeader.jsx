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
      className="flex items-center gap-6 p-6 bg-white rounded-[2rem] border-2 border-border mb-8"
    >
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-4xl font-black text-white flex-shrink-0">
        {userInitial}
      </div>

      {/* User Info */}
      <div className="flex-1">
        <h2 className="text-2xl font-black text-ink mb-1">
          {user.fullName || user.username || 'User'}
        </h2>
        <p className="text-slate font-bold mb-3">{user.email || 'No email'}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-violet-100 text-violet-700">
            Level {level}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-black ${tierColors[tier]}`}>
            {tier === 'premium' && <Crown className="w-3 h-3 inline mr-1" />}
            {tierLabel}
          </span>
        </div>
      </div>

      {/* Edit Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleEdit}
        className="btn-secondary flex items-center gap-2"
      >
        <Edit2 className="w-4 h-4" />
        Edit
      </motion.button>
    </motion.div>
  );
};

export default ProfileHeader;
