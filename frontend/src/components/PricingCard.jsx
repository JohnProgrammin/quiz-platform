import React from 'react';
import { Check, Sparkles, Crown } from 'lucide-react';
import { useSubscription } from '../contexts/SubscriptionContext';

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
            <span className="text-4xl font-extrabold text-ink">${plan.price / 100}</span>
            <span className="text-lg font-bold text-slate">/month</span>
          </div>
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
