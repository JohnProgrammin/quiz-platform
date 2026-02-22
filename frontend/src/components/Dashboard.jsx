import React from 'react';
import DashboardContainer from './dashboard/DashboardContainer';

/**
 * Dashboard - Wrapper component for the new tab-based Duolingo-style dashboard
 * Delegates to DashboardContainer which handles all dashboard sections (Overview, Analytics, Achievements, Profile)
 */
function Dashboard({ user, onLogout }) {
  return <DashboardContainer user={user} />;
}

export default Dashboard;
