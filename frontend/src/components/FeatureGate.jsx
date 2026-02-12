import React from 'react';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import UpgradePrompt from './UpgradePrompt';

/**
 * Wrapper component that gates features based on subscription tier
 *
 * Usage:
 * <FeatureGate feature="ai_teaching" fallback={<UpgradePrompt />}>
 *   <AITeachingComponent />
 * </FeatureGate>
 */
function FeatureGate({ feature, children, fallback, showUpgrade = true }) {
  const { hasAccess, isLoading } = useFeatureAccess(feature);

  if (isLoading) {
    return null; // Or loading spinner
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }
    if (showUpgrade) {
      return <UpgradePrompt feature={feature} />;
    }
    return null;
  }

  return <>{children}</>;
}

export default FeatureGate;
