import { motion } from 'framer-motion';
import { pageTransition } from '../lib/animations';

/**
 * Page Transition Wrapper
 * Wraps page content for consistent transition animations
 */
export const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      initial={pageTransition.initial}
      animate={pageTransition.animate}
      exit={pageTransition.exit}
      transition={pageTransition.transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
