import { motion } from 'framer-motion';
import useSound from '../../hooks/useSound';

export const DashboardTabs = ({ activeTab, onTabChange }) => {
  const { playClickSound } = useSound();

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'profile', label: 'Profile' },
  ];

  const handleTabChange = (tabId) => {
    playClickSound();
    onTabChange(tabId);
  };

  return (
    <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`px-6 py-3 font-black rounded-2xl transition-all whitespace-nowrap text-sm sm:text-base ${
            activeTab === tab.id
              ? 'bg-violet-600 text-white'
              : 'bg-white text-slate border-2 border-border hover:bg-surface'
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
