import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { createCheckoutSession } from '../api';
import { ArrowLeft, Check } from 'lucide-react';

function PricingPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Nigeria-only pricing in NGN
  const plans = [
    {
      tier: 'pro',
      name: 'Pro',
      price: 5000,
      currency: 'NGN',
      description: 'Perfect for serious learners wanting to master any topic',
      isPopular: true,
      features: [
        'Unlimited quizzes',
        'Unlimited notes & uploads',
        'AI-powered feedback on answers',
        'Identify weak topics automatically',
        'Focused mastery quizzes',
        'Pre-quiz AI teaching summaries',
        'Enhanced analytics & insights',
      ],
    },
    {
      tier: 'premium',
      name: 'Premium',
      price: 10000,
      currency: 'NGN',
      description: 'Everything in Pro, plus 1-on-1 AI tutoring',
      isPopular: false,
      features: [
        'Everything in Pro',
        'Unlimited AI Teaching sessions',
        '1-on-1 conversational tutoring',
        'Ask AI any question you want',
        'Custom quiz settings',
        'Advanced analytics',
        'Priority support',
      ],
    },
  ];

  const handleSelectPlan = async (plan) => {
    setLoading(true);
    setError('');
    try {
      const response = await createCheckoutSession({
        plan: plan.tier,
        currency: 'NGN',
      });

      if (response.data.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      } else {
        setError('Failed to create payment session');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error creating payment session:', err);
      setError('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate hover:text-ink font-semibold mb-12 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-ink mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate font-semibold max-w-2xl mx-auto">
            Start learning smarter with AI-powered quizzes. No hidden fees, cancel anytime.
          </p>
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
              className={`relative rounded-2xl transition-all ${
                plan.isPopular
                  ? 'ring-2 ring-brand-500 shadow-2xl scale-105 md:scale-100'
                  : 'border-2 border-border'
              } bg-white overflow-hidden`}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-brand-500 to-brand-600 text-white py-2 text-center font-bold text-sm">
                  MOST POPULAR
                </div>
              )}

              {/* Card Content */}
              <div className={`p-8 ${plan.isPopular ? 'pt-16' : ''}`}>
                {/* Plan Name */}
                <h3 className="text-3xl font-black text-ink mb-2">
                  {plan.name}
                </h3>
                <p className="text-slate font-medium text-sm mb-6 min-h-10">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-ink">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-slate font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-slate mt-2 font-medium">
                    Cancel anytime, no questions asked
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition-all mb-8 ${
                    plan.isPopular
                      ? 'bg-brand-500 text-white hover:bg-brand-600 disabled:bg-gray-400'
                      : 'border-2 border-ink text-ink hover:bg-ink hover:text-white disabled:border-gray-400 disabled:text-gray-400'
                  }`}
                >
                  {loading ? 'Processing...' : 'Get Started'}
                </button>

                {/* Features List */}
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate uppercase tracking-wide">
                    What's included:
                  </p>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate font-medium">{feature}</span>
                    </div>
                  ))}
                </div>
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
