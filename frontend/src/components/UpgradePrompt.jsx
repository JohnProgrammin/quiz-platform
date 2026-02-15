import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, Crown } from 'lucide-react';

function UpgradePrompt({ feature, compact = false, className = '' }) {
  const navigate = useNavigate();

  const featureNames = {
    unlimited_quizzes: 'Unlimited Quizzes',
    ai_feedback: 'AI Feedback',
    weakness_mastery: 'Weakness Mastery',
    ai_teaching: 'AI Teaching',
    free_text_questions: 'Free-Text Questions',
    pre_teach: 'Pre-Quiz Teaching',
  };

  const featureName = featureNames[feature] || 'This feature';

  if (compact) {
    return (
      <button
        onClick={() => navigate('/pricing')}
        className= disabled:opacity-50"inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white font-bold rounded-xl hover:shadow-sm transition-all"
      >
        <Crown className="w-4 h-4" />
        Upgrade to Pro
      </button>
    );
  }

  return (
    <div className={`card p-8 text-center ${className}`}>
      <div className= disabled:opacity-50"w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-white" />
      </div>

      <h3 className="text-xl font-extrabold text-ink mb-2">
        {featureName} is a Pro Feature
      </h3>

      <p className="text-slate font-semibold mb-6 max-w-md mx-auto">
        Upgrade to Pro for unlimited quizzes, AI feedback, weakness mastery, and more!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={() => navigate('/pricing')}
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <Zap className="w-5 h-5" />
          View Pricing
        </button>

        <button
          onClick={() => window.history.back()}
          className="btn-secondary"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}

export default UpgradePrompt;
