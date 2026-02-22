import { motion } from 'framer-motion';
import useSound from '../../hooks/useSound';

export const DashboardTabs = ({ activeTab, onTabChange }) => {
  const { playClickSound } = useSound();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'profile', label: 'Profile' },
  ];

  const handleTabChange = (tabId) => {
    playClickSound();
    onTabChange(tabId);
  };

  return (
    <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`px-4 sm:px-6 py-2.5 sm:py-3 font-black rounded-lg sm:rounded-xl md:rounded-2xl transition-all whitespace-nowrap text-xs sm:text-sm md:text-base flex-shrink-0 ${
            activeTab === tab.id
              ? 'bg-violet-600 text-white shadow-btn-violet'
              : 'bg-white text-slate border-2 border-border hover:bg-surface hover:border-brand-400'
          }`}
          style={
            activeTab === tab.id
              ? {
                  boxShadow: '0 4px 0 0 #4c1d95',
                }
              : {}
          }
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
};

export default DashboardTabs;
