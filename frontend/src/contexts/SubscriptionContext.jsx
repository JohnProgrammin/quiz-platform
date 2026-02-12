import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentSubscription } from '../api';

const SubscriptionContext = createContext(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children, user }) => {
  const [subscription, setSubscription] = useState(null);
  const [tier, setTier] = useState('free');
  const [isLoading, setIsLoading] = useState(true);

  const loadSubscription = async () => {
    if (!user) {
      setTier('free');
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await getCurrentSubscription();
      setSubscription(response.data.subscription);
      setTier(response.data.tier || 'free');
    } catch (error) {
      console.error('Error loading subscription:', error);
      setTier('free');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [user?.id]);

  const refresh = () => {
    setIsLoading(true);
    loadSubscription();
  };

  const hasFeature = (feature) => {
    const features = {
      free: ['basic_quiz', 'limited_notes'],
      pro: ['unlimited_quizzes', 'unlimited_notes', 'ai_feedback', 'weakness_mastery', 'pre_teach', 'free_text_questions'],
      premium: ['ai_teaching', 'custom_quiz', 'api_access', 'priority_support']
    };

    const tierHierarchy = { free: 0, pro: 1, premium: 2 };
    const userTierValue = tierHierarchy[tier] || 0;

    // Check all tiers up to current tier
    for (let i = 0; i <= userTierValue; i++) {
      const tierName = Object.keys(tierHierarchy).find(key => tierHierarchy[key] === i);
      if (features[tierName]?.includes(feature)) {
        return true;
      }
    }

    return false;
  };

  const value = {
    subscription,
    tier,
    isLoading,
    refresh,
    hasFeature,
    isPro: tier === 'pro' || tier === 'premium',
    isPremium: tier === 'premium',
    isFree: tier === 'free',
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
