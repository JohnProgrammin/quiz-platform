import * as RadixTooltip from '@radix-ui/react-tooltip';
import { motion } from 'framer-motion';

/**
 * Tooltip Component (Radix UI + Framer Motion)
 * Accessible tooltips for helpful hints
 */
export const Tooltip = ({ content, children, side = 'top' }) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Content
          side={side}
          className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 z-50 pointer-events-none"
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        </RadixTooltip.Content>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default Tooltip;
