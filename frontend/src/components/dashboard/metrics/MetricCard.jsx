import { motion } from 'framer-motion';

/**
 * MetricCard Component
 * Displays a single metric with gradient icon, value, and optional progress indicator
 */
export const MetricCard = ({
  label,
  value,
  icon,
  gradient = 'from-violet-400 to-violet-300',
  subtitle,
  progress,
  showProgress = false,
  animated = false,
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="rounded-xl sm:rounded-2xl bg-white border-2 border-border p-4 sm:p-5 md:p-6 relative group overflow-hidden transition-all hover:border-brand-400 hover:shadow-card-hover"
    >
      {/* Animated pulse background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon Container */}
      <div
        className={`w-11 sm:w-12 md:w-14 h-11 sm:h-12 md:h-14 rounded-lg sm:rounded-xl md:rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 sm:mb-4 text-white group-hover:scale-110 transition-transform duration-200 relative z-10 flex-shrink-0 ${
          animated ? 'animate-pulse' : ''
        }`}
      >
        {icon && typeof icon === 'string' ? (
          <span className="text-4xl sm:text-5xl">{icon}</span>
        ) : (
          icon
        )}
      </div>

      {/* Label */}
      <p className="text-xs font-black text-muted uppercase tracking-widest mb-2 relative z-10">
        {label}
      </p>

      {/* Value */}
      <p className="text-xl sm:text-2xl md:text-3xl font-black text-ink mb-2 relative z-10 truncate">
        {value}
      </p>

      {/* Optional Subtitle */}
      {subtitle && (
        <p className="text-xs sm:text-sm font-bold text-slate relative z-10 line-clamp-2">{subtitle}</p>
      )}

      {/* Optional Progress Ring (top-right) */}
      {showProgress && progress !== undefined && (
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20">
          <CircularProgress percentage={progress} size={50} />
        </div>
      )}
    </motion.div>
  );
};

/**
 * Circular Progress Ring Component
 * Displays progress as a circular indicator
 */
const CircularProgress = ({ percentage = 0, size = 60, strokeWidth = 5 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{
          background: 'transparent',
        }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e4e4f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#58CC02"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-xs font-black text-ink">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export const CircularProgressComponent = CircularProgress;
export default MetricCard;
