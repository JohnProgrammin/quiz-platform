import { motion } from 'framer-motion';

/**
 * SettingCard Component
 * Container for grouped settings
 */
export const SettingCard = ({ title, icon: Icon, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl sm:rounded-2xl border-2 border-border p-4 sm:p-5 md:p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        {Icon && (
          <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-400 to-violet-300 flex items-center justify-center text-white flex-shrink-0">
            <Icon className="w-4 sm:w-5 h-4 sm:h-5" />
          </div>
        )}
        <h3 className="text-base sm:text-lg font-black text-ink">{title}</h3>
      </div>

      {/* Settings Content */}
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </motion.div>
  );
};

export default SettingCard;
