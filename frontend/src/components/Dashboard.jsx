import React from 'react';
import DashboardContainer from './dashboard/DashboardContainer';

/**
 * Dashboard - Wrapper component for the new tab-based dashboard
 * Delegates to DashboardContainer which handles all dashboard sections
 */
function Dashboard({ user, onLogout }) {
  return <DashboardContainer user={user} />;
}

export default Dashboard;
