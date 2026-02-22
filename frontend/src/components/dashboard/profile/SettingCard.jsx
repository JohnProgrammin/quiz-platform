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
      className="bg-white rounded-[2rem] border-2 border-border p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-violet-300 flex items-center justify-center text-white">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <h3 className="text-lg font-black text-ink">{title}</h3>
      </div>

      {/* Settings Content */}
      <div className="space-y-3">{children}</div>
    </motion.div>
  );
};

export default SettingCard;
