/**
 * Analytics Tab - Performance charts and insights
 * Displays: performance trends, weak topics, study insights
 */

export const AnalyticsTab = ({ isFree }) => {
  return (
    <div className="space-y-8">
      {/* Analytics content will be built in Phase 4 */}
      {isFree ? (
        <div className="bg-red-50 rounded-[2rem] border-2 border-red-200 p-8 text-center">
          <p className="text-red-700 font-bold">Unlock Advanced Analytics with Pro</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border-2 border-border p-8 text-center">
          <p className="text-slate font-bold">Analytics content coming soon...</p>
        </div>
      )}
    </div>
  );
};

export default AnalyticsTab;
