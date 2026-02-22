import * as RadixTabs from '@radix-ui/react-tabs';
import { motion } from 'framer-motion';

/**
 * Tabs Component (Radix UI + Framer Motion)
 * Accessible tabbed interface with smooth animations
 */
export const Tabs = ({ defaultValue, tabs, children }) => {
  return (
    <RadixTabs.Root defaultValue={defaultValue} className="w-full">
      <RadixTabs.List className="flex border-b border-gray-200 gap-1">
        {tabs.map((tab) => (
          <RadixTabs.Trigger
            key={tab.value}
            value={tab.value}
            className="relative px-4 py-3 font-semibold text-gray-700 hover:text-gray-900 transition-colors data-[state=active]:text-brand-600 data-[state=active]:border-b-2 data-[state=active]:border-brand-600"
          >
            {tab.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>

      {tabs.map((tab) => (
        <RadixTabs.Content key={tab.value} value={tab.value} asChild>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children(tab.value)}
          </motion.div>
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
};

export default Tabs;
