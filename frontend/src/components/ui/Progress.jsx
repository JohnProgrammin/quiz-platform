import * as RadixProgress from '@radix-ui/react-progress';
import { motion } from 'framer-motion';

/**
 * Progress Bar Component (Radix UI + Framer Motion)
 * Beautiful animated progress indicators
 */
export const Progress = ({
  value = 0,
  max = 100,
  label,
  showPercent = true,
  variant = 'default',
  animated = true,
}) => {
  const percentage = (value / max) * 100;

  const variants = {
    default: 'bg-gradient-to-r from-brand-500 to-brand-500',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
    danger: 'bg-gradient-to-r from-red-500 to-brand-500',
  };

  return (
    <div className="space-y-2">
      {(label || showPercent) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercent && <span className="text-sm font-semibold text-gray-600">{Math.round(percentage)}%</span>}
        </div>
      )}

      <RadixProgress.Root value={value} max={max} className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 15,
            duration: animated ? 0.6 : 0,
          }}
          className={`h-full rounded-full shadow-lg ${variants[variant]}`}
        />
      </RadixProgress.Root>
    </div>
  );
};

export default Progress;
