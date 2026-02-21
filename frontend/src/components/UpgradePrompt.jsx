import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Lock, Zap, Crown } from 'lucide-react';

function UpgradePrompt({ feature, compact = false, className = '' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const featureNames = {
    unlimited_quizzes: 'Unlimited Quizzes',
    ai_feedback: 'AI Feedback',
    weakness_mastery: 'Weakness Mastery',
    ai_teaching: 'AI Teaching',
    free_text_questions: 'Free-Text Questions',
    pre_teach: 'Pre-Quiz Teaching',
  };

  const premiumFeatures = ['ai_teaching'];
  const requiredTier = premiumFeatures.includes(feature) ? 'Premium' : 'Pro';

  const featureName = featureNames[feature] || 'This feature';

  if (compact) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className={`inline-flex items-center gap-2 px-4 py-2 text-white font-bold rounded-xl hover:shadow-sm transition-all ${requiredTier === 'Premium' ? 'bg-gradient-to-r from-amber-500 to-orange-600' : 'bg-brand-500'
          }`}
      >
        <Crown className="w-4 h-4" />
        Upgrade to {requiredTier}
      </button>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl p-8 text-center border bg-white/50 backdrop-blur-xl shadow-lg ${requiredTier === 'Premium' ? 'border-amber-200/50' : 'border-brand-200/50'
      } ${className}`}>
      {/* Decorative background blur elements */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full blur-3xl -z-10 ${requiredTier === 'Premium' ? 'bg-amber-500/20' : 'bg-brand-500/20'
        }`} />

      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white/50 ${requiredTier === 'Premium' ? 'bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-500/30' : 'bg-gradient-to-br from-brand-400 to-brand-600 shadow-brand-500/30'
        }`}>
        <Lock className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-xl font-extrabold text-ink mb-2">
        {featureName} <span className={requiredTier === 'Premium' ? 'text-amber-600' : 'text-brand-600'}>is Locked</span>
      </h3>

      <p className="text-slate font-semibold mb-8 max-w-md mx-auto leading-relaxed">
        Unlock this feature and supercharge your learning with {requiredTier} access.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/pricing')}
          className="btn-primary inline-flex items-center justify-center gap-2 px-8 py-3 shadow-xl shadow-brand-500/20"
        >
          View Plans
        </button>
      </div>
    </div>
  );
}

export default UpgradePrompt;
