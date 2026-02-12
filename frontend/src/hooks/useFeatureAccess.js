import { useSubscription } from '../contexts/SubscriptionContext';

export const useFeatureAccess = (featureName) => {
  const { hasFeature, tier, isLoading } = useSubscription();

  return {
    hasAccess: hasFeature(featureName),
    tier,
    isLoading,
    requiresUpgrade: !hasFeature(featureName),
  };
};
