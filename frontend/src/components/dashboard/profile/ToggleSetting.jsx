import { motion } from 'framer-motion';
import useSound from '../../../hooks/useSound';

/**
 * ToggleSetting Component
 * A toggle switch for boolean settings
 */
export const ToggleSetting = ({ label, checked = false, onChange = () => {} }) => {
  const { playClickSound } = useSound();

  const handleToggle = () => {
    playClickSound();
    onChange(!checked);
  };

  return (
    <div className="flex items-center justify-between py-3 px-3 hover:bg-slate-50 rounded-xl transition-colors">
      <span className="font-bold text-slate">{label}</span>

      {/* Toggle Switch */}
      <motion.button
        onClick={handleToggle}
        className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors ${
          checked ? 'bg-brand-500' : 'bg-gray-300'
        }`}
      >
        <motion.div
          className="inline-block w-5 h-5 transform bg-white rounded-full shadow-md"
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 40 }}
        />
      </motion.button>
    </div>
  );
};

export default ToggleSetting;
