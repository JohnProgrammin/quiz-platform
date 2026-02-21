import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createCheckoutSession } from '../api';
import { ArrowLeft, Check } from 'lucide-react';

import { useSubscription } from '../contexts/SubscriptionContext';
import { useTranslation } from 'react-i18next';
import { SEO } from './SEO';

function PricingPage() {
  const { t } = useTranslation();
  const { tier: currentPlanTier } = useSubscription();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  // Nigeria pricing in NGN
  const plans = [
    {
      tier: 'pro',
      name: t('pricing.pro') || 'Pro',
      price: { monthly: 5000, yearly: 50000 }, // 2 months free
      currency: 'NGN',
      description: t('pricing.forSeriousLearners') || 'Perfect for serious learners.',
      isPopular: true,
      badge: t('landing.pricing.mostPopular') || 'Most Popular',
      features: [
        t('pricing.pricingPageProFeature1', 'Unlimited quizzes'),
        t('pricing.pricingPageProFeature2', 'Unlimited notes & uploads'),
        t('pricing.pricingPageProFeature3', 'Upload PPTX & PDF files'),
        t('pricing.pricingPageProFeature4', 'AI Quiz Summary & Feedback'),
        t('pricing.pricingPageProFeature5', 'Weakness mastery'),
        t('pricing.pricingPageProFeature6', 'Enhanced analytics'),
      ],
      buttonText: t('pricing.upgradePro') || 'Get Started',
      buttonVariant: 'primary',
    },
    {
      tier: 'premium',
      name: t('pricing.premium') || 'Premium',
      price: { monthly: 10000, yearly: 100000 }, // 2 months free
      currency: 'NGN',
      description: t('pricing.forMasterySeekers') || 'For power users needing 1-on-1 tutoring.',
      isPopular: false,
      badge: t('landing.pricing.premium') || 'Best Value',
      features: [
        t('pricing.pricingPagePremiumFeature1', 'Everything in Pro'),
        t('pricing.pricingPagePremiumFeature2', 'Unlimited AI Tutoring Chat'),
        t('pricing.pricingPagePremiumFeature3', 'Priority Support'),
        t('pricing.pricingPagePremiumFeature4', 'Custom Quiz Settings'),
        t('pricing.pricingPagePremiumFeature5', 'Advanced Analytics'),
      ],
      buttonText: t('pricing.premium') || 'Go Premium',
      buttonVariant: 'dark', // New variant
    },
  ];

  const handleSelectPlan = async (plan) => {
    setLoadingPlan(plan.tier);
    setError('');
    try {
      const response = await createCheckoutSession({
        plan: plan.tier,
        interval: billingCycle,
        currency: 'NGN',
      });

      if (response.data.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      } else {
        setError('Failed to create payment session');
        setLoadingPlan(null);
      }
    } catch (err) {
      console.error('Error creating payment session:', err);
      setError('Failed to start checkout. Please try again.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-nunito">
      <SEO title="FloraQuiz Pricing | Plans for Every Student" description="Upgrade to FloraQuiz Pro for unlimited AI quizzes, personalized tutoring, and priority support. Pick a plan that fits your study needs." />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-ink mb-4">
              {t('pricing.plansAndFeatures') || 'Plans and features'}
            </h1>
            <p className="text-xl text-slate font-bold">
              {t('pricing.simplePricing') || 'Simple pricing. No hidden fees.'}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl inline-flex items-center relative">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px - 6 py - 2 rounded - lg text - sm font - black transition - all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-ink' : 'text-slate hover:text-ink'
                } `}
            >
              {t('subscription.monthly') || 'Pay monthly'}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px - 6 py - 2 rounded - lg text - sm font - black transition - all ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-ink' : 'text-slate hover:text-ink'
                } `}
            >
              {t('subscription.yearly') || 'Pay annually'}
            </button>
            <div className="absolute -top-3 -right-2 bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wide">
              {t('pricing.saveX', { amount: '17%' }) || 'Save 17%'}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-danger rounded-xl max-w-md mx-auto">
            <p className="text-danger font-bold text-center">{error}</p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative rounded - 3xl p - 8 transition - all duration - 300 ${plan.isPopular
                ? 'bg-white border-2 border-brand-500 shadow-xl shadow-brand-500/10'
                : 'bg-white border-2 border-border hover:border-brand-300 hover:shadow-lg'
                } `}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute top - 0 right - 0 transform translate - x - 2 - translate - y - 1 / 2 px - 4 py - 1.5 rounded - full text - xs font - black uppercase tracking - wide
                  ${plan.isPopular ? 'bg-brand-500 text-white' : 'bg-ink text-white'
                  } `}>
                  {plan.badge}
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-black text-ink mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-ink">
                    ₦{plan.price[billingCycle].toLocaleString()}
                  </span>
                  <span className="text-slate font-bold text-lg">/{billingCycle === 'monthly' ? (t('pricing.mo') || 'mo') : (t('pricing.yr') || 'yr')}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-xs font-black text-green-600 mt-1">
                    {t('pricing.billedYearly') || 'Billed yearly (2 months free)'}
                  </p>
                )}
              </div>

              <p className="text-slate font-semibold text-sm mb-8 h-10 leading-relaxed">
                {plan.description}
              </p>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loadingPlan !== null || plan.tier === currentPlanTier}
                className={`w - full py - 4 rounded - 2xl font - black text - lg transition - all mb - 10 shadow - lg active: scale - 95 ${plan.tier === currentPlanTier
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                  : plan.buttonVariant === 'primary' // Pro
                    ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/25'
                    : 'bg-ink text-white hover:bg-slate-800 shadow-slate-900/25' // Premium
                  } `}
              >
                {loadingPlan === plan.tier
                  ? (t('common.loading') || 'Processing...')
                  : plan.tier === currentPlanTier
                    ? (t('pricing.currentPlan') || 'Current Plan')
                    : plan.buttonText}
              </button>

              {/* Features List */}
              <div className="space-y-4">
                <p className="text-xs font-black text-slate uppercase tracking-wider mb-4 border-b border-border pb-2">
                  {t('pricing.everythingInTier', { tier: plan.tier === 'premium' ? 'Pro' : 'Free' }) || `Everything in ${plan.tier === 'premium' ? 'Pro' : 'Free'}`}
                </p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-brand-500 stroke-[4]" />
                    </div>
                    <span className="text-ink font-bold text-sm tracking-tight">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Message */}
        <div className="text-center">
          <p className="text-sm font-semibold text-slate">
            {t('pricing.trustMessage') || '✓ 7-day money-back guarantee • ✓ Secure payment with Paystack • ✓ Start learning immediately'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
