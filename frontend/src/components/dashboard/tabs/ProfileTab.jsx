import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Trash2, Lock } from 'lucide-react';
import ProfileHeader from '../profile/ProfileHeader';
import SettingCard from '../profile/SettingCard';
import ToggleSetting from '../profile/ToggleSetting';
import useSound from '../../../hooks/useSound';

/**
 * Profile Tab - User account and settings
 * Displays profile info, subscription, preferences, and account management
 */
export const ProfileTab = ({ user = {}, tier = 'free', level = 1 }) => {
  const { playClickSound } = useSound();
  const [notifications, setNotifications] = useState({
    email: true,
    quizReminders: true,
    streakAlerts: false,
  });
  const [privacy, setPrivacy] = useState({
    showOnLeaderboard: true,
    shareProgress: false,
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  const handleDeleteAccount = () => {
    playClickSound();
    if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      // TODO: Implement account deletion
      console.log('Delete account confirmed');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 md:space-y-10"
    >
      {/* Profile Header */}
      <motion.div variants={itemVariants}>
        <ProfileHeader user={user} level={level} tier={tier} />
      </motion.div>

      {/* Settings Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6"
      >
        {/* Account Settings */}
        <SettingCard title="Account" icon={User}>
          <div className="space-y-3">
            <div className="py-3 px-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">
                Email
              </p>
              <p className="font-black text-ink text-sm">{user.email || 'No email'}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => playClickSound()}
              className="w-full py-2 rounded-xl bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-200 transition-colors"
            >
              Change Password
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => playClickSound()}
              className="w-full py-2 rounded-xl bg-slate-100 border-2 border-slate-200 text-slate-700 font-black text-sm hover:bg-slate-200 transition-colors"
            >
              Change Language
            </motion.button>
          </div>
        </SettingCard>

        {/* Notifications */}
        <SettingCard title="Notifications" icon={Bell}>
          <ToggleSetting
            label="Email Notifications"
            checked={notifications.email}
            onChange={(val) => setNotifications({ ...notifications, email: val })}
          />
          <ToggleSetting
            label="Quiz Reminders"
            checked={notifications.quizReminders}
            onChange={(val) =>
              setNotifications({ ...notifications, quizReminders: val })
            }
          />
          <ToggleSetting
            label="Streak Alerts"
            checked={notifications.streakAlerts}
            onChange={(val) =>
              setNotifications({ ...notifications, streakAlerts: val })
            }
          />
        </SettingCard>

        {/* Privacy Settings */}
        <SettingCard title="Privacy" icon={Shield}>
          <ToggleSetting
            label="Show on Leaderboard"
            checked={privacy.showOnLeaderboard}
            onChange={(val) => setPrivacy({ ...privacy, showOnLeaderboard: val })}
          />
          <ToggleSetting
            label="Share Progress"
            checked={privacy.shareProgress}
            onChange={(val) => setPrivacy({ ...privacy, shareProgress: val })}
          />
          <p className="text-xs text-slate font-bold pt-2">
            Control who can see your learning progress and stats
          </p>
        </SettingCard>

        {/* Subscription & Billing */}
        <SettingCard title="Subscription" icon={CreditCard}>
          {tier === 'free' ? (
            <>
              <div className="py-3 px-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">
                  Current Plan
                </p>
                <p className="font-black text-ink text-sm">Free - Limited Features</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => playClickSound()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-400 to-brand-500 text-white font-black text-sm hover:from-brand-500 hover:to-brand-600 transition-all"
              >
                Upgrade to Pro
              </motion.button>
            </>
          ) : (
            <>
              <div className="py-3 px-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">
                  Current Plan
                </p>
                <p className="font-black text-ink text-sm">
                  {tier === 'pro' ? 'Pro - $9.99/month' : 'Premium - $19.99/month'}
                </p>
              </div>
              <div className="py-3 px-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-muted font-bold uppercase tracking-wider mb-1">
                  Renewal Date
                </p>
                <p className="font-black text-ink text-sm">March 10, 2026</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => playClickSound()}
                className="w-full py-2 rounded-xl bg-red-50 border-2 border-red-200 text-red-700 font-black text-sm hover:bg-red-100 transition-colors"
              >
                Cancel Subscription
              </motion.button>
            </>
          )}
        </SettingCard>
      </motion.div>

      {/* Danger Zone */}
      <motion.div variants={itemVariants}>
        <div className="bg-red-50 rounded-xl sm:rounded-2xl border-2 border-red-200 p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-black text-red-900 mb-2 flex items-center gap-2">
            <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
            Danger Zone
          </h3>
          <p className="text-xs sm:text-sm text-red-700 font-bold mb-6">
            Actions here are irreversible. Please proceed with caution.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDeleteAccount}
            className="w-full py-2 sm:py-3 rounded-lg sm:rounded-xl bg-red-600 text-white font-black hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Trash2 className="w-4 sm:w-5 h-4 sm:h-5" />
            Delete Account
          </motion.button>

          <p className="text-xs text-red-600 font-bold mt-3 text-center">
            Your account and all data will be permanently deleted
          </p>
        </div>
      </motion.div>

      {/* Security Info */}
      <motion.div
        variants={itemVariants}
        className="bg-blue-50 rounded-xl sm:rounded-2xl border-2 border-blue-200 p-5 sm:p-6"
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <Lock className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-1" />
          <div>
            <h3 className="text-base sm:text-lg font-black text-blue-900 mb-1">Your Data is Secure</h3>
            <p className="text-xs sm:text-sm text-blue-700 font-bold">
              We use industry-standard encryption to protect your account. Never share your password
              with anyone.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileTab;
