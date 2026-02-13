import React from 'react';
import { Check, Sparkles, Crown } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

// Currency symbols and formatting
const currencySymbols = {
  USD: '$', GBP: '£', EUR: '€', INR: '₹', NGN: '₦',
  KES: 'KES', ZAR: 'R', AUD: 'A$', CAD: 'C$', BRL: 'R$',
  JPY: '¥', CNY: '¥', MXN: '$', CHF: 'CHF', SEK: 'kr',
  NZD: 'NZ$', SGD: 'S$', HKD: 'HK$', THB: '฿', PKR: '₨',
};

const decimalsForCurrency = {
  JPY: 0, // Japanese Yen uses no decimals
  KES: 0, THB: 0, // Some currencies use 0 decimals
};

function formatPrice(priceInMinorUnits, currency = 'USD') {
  const symbol = currencySymbols[currency] || currency;
  const decimals = decimalsForCurrency[currency] ?? 2;
  const divisor = Math.pow(10, decimals);
  const displayPrice = (priceInMinorUnits / divisor).toFixed(decimals);
  return `${symbol}${displayPrice}`;
}

function PricingCard({ plan, onSelect, isPopular = false }) {
  const { tier } = useSubscription();
  const isCurrentPlan = tier === plan.tier;

  const icons = {
    pro: <Sparkles className="w-6 h-6" />,
    premium: <Crown className="w-6 h-6" />,
  };

  return (
    <div className={`card relative ${isPopular ? 'ring-4 ring-brand-500 scale-105' : ''}`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-brand-500 text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wide">
            Most Popular
          </span>
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            plan.tier === 'premium' ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-brand-500 to-violet-500'
          }`}>
            <span className="text-white">{icons[plan.tier]}</span>
          </div>
          <div>
            <h3 className="text-2xl font-extrabold text-ink">{plan.name}</h3>
            <p className="text-sm font-semibold text-slate">{plan.description}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-ink">
              {formatPrice(plan.price, plan.currency)}
            </span>
            <span className="text-lg font-bold text-slate">/month</span>
          </div>
          {plan.currency && plan.currency !== 'USD' && (
            <p className="text-xs text-slate mt-1">
              ≈ ${(plan.priceUSD || plan.price) / 100} USD
            </p>
          )}
        </div>

        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Check className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-semibold text-ink">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={() => onSelect(plan)}
          disabled={isCurrentPlan}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            isCurrentPlan
              ? 'bg-surface text-slate cursor-not-allowed'
              : isPopular
              ? 'btn-primary'
              : 'btn-secondary hover:bg-brand-500 hover:text-white'
          }`}
        >
          {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
        </button>
      </div>
    </div>
  );
}

export default PricingCard;
