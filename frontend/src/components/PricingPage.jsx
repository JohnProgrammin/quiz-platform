import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import PricingCard from './PricingCard';
import { createCheckoutSession, getSubscriptionPlans } from '../api';
import { ArrowLeft } from 'lucide-react';

function PricingPage({ user, onLogout }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [detectedCurrency, setDetectedCurrency] = useState('');

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await getSubscriptionPlans();
      const data = response.data;

      // Extract plans from new multi-currency format
      const proPlan = data.plans?.pro || {
        name: 'Pro',
        price: 999,
        currency: data.currency || 'USD',
        description: 'For serious learners',
        features: [
          'Unlimited quizzes',
          'Unlimited notes',
          'AI feedback on answers',
          'Weakness mastery tracking',
          'Pre-quiz teaching',
          'Free-text questions',
          'Enhanced analytics',
        ],
      };

      const premiumPlan = data.plans?.premium || {
        name: 'Premium',
        price: 1999,
        currency: data.currency || 'USD',
        description: 'For mastery seekers',
        features: [
          'Everything in Pro',
          'AI Teaching companion',
          'Custom quiz settings',
          'API access',
          'Priority support',
          'PDF export',
          'Advanced analytics',
        ],
      };

      const currency = data.currency || 'USD';
      setDetectedCurrency(currency);
      setSelectedCurrency(currency);

      setPlans([
        { tier: 'pro', ...proPlan, currency: currency },
        { tier: 'premium', ...premiumPlan, currency: currency },
      ]);

      // Log detection info
      if (data.detected) {
        console.log(`💱 Auto-detected currency: ${currency}`);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
      setError('Failed to load pricing plans');
      // Fallback to USD if API fails
      setPlans([
        {
          tier: 'pro',
          name: 'Pro',
          price: 999,
          currency: 'USD',
          features: ['Unlimited quizzes', 'Unlimited notes', 'AI feedback'],
        },
        {
          tier: 'premium',
          name: 'Premium',
          price: 1999,
          currency: 'USD',
          features: ['Everything in Pro', 'AI Teaching', 'API Access'],
        },
      ]);
    }
  };

  const handleSelectPlan = async (plan) => {
    setLoading(true);
    setError('');
    try {
      const response = await createCheckoutSession({
        plan: plan.tier,
        currency: selectedCurrency,
      });

      // Redirect to Paystack Checkout
      if (response.data.authorizationUrl) {
        window.location.href = response.data.authorizationUrl;
      } else {
        setError('Failed to create payment session');
      }
    } catch (err) {
      console.error('Error creating payment session:', err);
      setError('Failed to start checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate hover:text-ink font-bold mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-ink mb-3">
            Choose Your Plan
          </h1>
          <p className="text-xl font-semibold text-slate">
            Unlock unlimited learning potential with AI-powered quizzes
          </p>
        </div>

        {/* Currency Selector */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <label className="block text-sm font-bold text-slate mb-2">
              💱 Select Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg font-semibold text-ink focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="USD">🇺🇸 USD ($)</option>
              <option value="NGN">🇳🇬 NGN (₦)</option>
              <option value="GBP">🇬🇧 GBP (£)</option>
              <option value="EUR">🇪🇺 EUR (€)</option>
              <option value="INR">🇮🇳 INR (₹)</option>
              <option value="KRW">🇰🇷 KRW (₩)</option>
              <option value="JPY">🇯🇵 JPY (¥)</option>
              <option value="CAD">🇨🇦 CAD ($)</option>
              <option value="AUD">🇦🇺 AUD ($)</option>
              <option value="ZAR">🇿🇦 ZAR (R)</option>
            </select>
            {detectedCurrency && selectedCurrency !== detectedCurrency && (
              <p className="text-xs text-slate mt-2">
                ℹ️ Auto-detected: {detectedCurrency}
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border-2 border-danger rounded-xl">
            <p className="text-danger font-bold">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {plans.map((plan, idx) => (
            <PricingCard
              key={plan.tier}
              plan={plan}
              onSelect={handleSelectPlan}
              isPopular={idx === 0}
            />
          ))}
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-slate">
            All plans include 7-day money-back guarantee
          </p>
        </div>
      </div>
    </div>
  );
}

export default PricingPage;
