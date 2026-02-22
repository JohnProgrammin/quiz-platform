import { motion } from 'framer-motion';

export const AnimatedDots = ({ text = 'Loading' }) => {
  const dotVariants = {
    animate: {
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1.4,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <span>
      {text}
      <motion.span variants={dotVariants} animate="animate">
        .
      </motion.span>
      <motion.span
        variants={dotVariants}
        animate="animate"
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.2,
        }}
      >
        .
      </motion.span>
      <motion.span
        variants={dotVariants}
        animate="animate"
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.4,
        }}
      >
        .
      </motion.span>
    </span>
  );
};

export default AnimatedDots;
