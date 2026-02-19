import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createCheckoutSession } from '../api';
import { ArrowLeft, Check } from 'lucide-react';

function PricingPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'

  // Nigeria pricing in NGN
  const plans = [
    {
      tier: 'pro',
      name: 'Pro',
      price: { monthly: 5000, yearly: 50000 }, // 2 months free
      currency: 'NGN',
      description: 'Perfect for serious learners.',
      isPopular: true,
      badge: 'Most Popular',
      features: [
        'Unlimited quizzes',
        'Unlimited notes & uploads',
        'Upload PPTX & PDF files',
        'AI feedback & teaching',
        'Weakness mastery',
        'Enhanced analytics',
      ],
      buttonText: 'Get Started',
      buttonVariant: 'primary',
    },
    {
      tier: 'premium',
      name: 'Premium',
      price: { monthly: 10000, yearly: 100000 }, // 2 months free
      currency: 'NGN',
      description: 'For power users needing 1-on-1 tutoring.',
      isPopular: false,
      badge: 'Best Value',
      features: [
        'Everything in Pro',
        '1-on-1 AI Tutoring',
        'Priority Support',
        'Custom Quiz Settings',
        'Advanced Analytics',
      ],
      buttonText: 'Go Premium',
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

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-ink mb-4">
              Plans and features
            </h1>
            <p className="text-xl text-slate font-bold">
              Simple pricing. No hidden fees.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="bg-gray-100 p-1 rounded-xl inline-flex items-center relative">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${billingCycle === 'monthly' ? 'bg-white shadow-sm text-ink' : 'text-slate hover:text-ink'
                }`}
            >
              Pay monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg text-sm font-black transition-all ${billingCycle === 'yearly' ? 'bg-white shadow-sm text-ink' : 'text-slate hover:text-ink'
                }`}
            >
              Pay annually
            </button>
            <div className="absolute -top-3 -right-2 bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-200 uppercase tracking-wide">
              Save 17%
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
              className={`relative rounded-3xl p-8 transition-all duration-300 ${plan.isPopular
                ? 'bg-white border-2 border-brand-500 shadow-xl shadow-brand-500/10'
                : 'bg-white border-2 border-border hover:border-brand-300 hover:shadow-lg'
                }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute top-0 right-0 transform translate-x-2 -translate-y-1/2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wide
                  ${plan.isPopular ? 'bg-brand-500 text-white' : 'bg-ink text-white'
                  }`}>
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
                  <span className="text-slate font-bold text-lg">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-xs font-black text-green-600 mt-1">
                    Billed yearly (2 months free)
                  </p>
                )}
              </div>

              <p className="text-slate font-semibold text-sm mb-8 h-10 leading-relaxed">
                {plan.description}
              </p>

              {/* CTA Button */}
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={loadingPlan !== null}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all mb-10 shadow-lg active:scale-95 ${plan.buttonVariant === 'primary' // Pro
                  ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-brand-500/25'
                  : 'bg-ink text-white hover:bg-slate-800 shadow-slate-900/25' // Premium
                  }`}
              >
                {loadingPlan === plan.tier ? 'Processing...' : plan.buttonText}
              </button>

              {/* Features List */}
              <div className="space-y-4">
                <p className="text-xs font-black text-slate uppercase tracking-wider mb-4 border-b border-border pb-2">
                  Everything in {plan.tier === 'premium' ? 'Pro' : 'Free'}
                </p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-pink-500 stroke-[4]" />
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
            ✓ 7-day money-back guarantee • ✓ Secure payment with Paystack • ✓ Start learning immediately
          </p>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
