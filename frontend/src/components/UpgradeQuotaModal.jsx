import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Crown, Zap } from 'lucide-react';

function UpgradeQuotaModal({ type = 'quizzes', limit = 5, used = 5, onClose }) {
  const navigate = useNavigate();

  const content = {
    quizzes: {
      title: 'Monthly Quiz Limit Reached',
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      description: `You've used all ${limit} quizzes allowed this month on the Free plan. Upgrade to Pro for unlimited quizzes!`,
      ctaText: 'Upgrade to Pro',
      benefit: 'Unlimited quizzes + AI feedback + more',
    },
    notes: {
      title: 'Note Limit Reached',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: `You've uploaded ${limit} notes (the Free plan maximum). Upgrade to Pro for unlimited notes!`,
      ctaText: 'Upgrade to Pro',
      benefit: 'Unlimited notes + unlimited quizzes + more',
    },
  };

  const config = content[type] || content.quizzes;
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`w-8 h-8 ${config.color}`} />
        </div>

        {/* Content */}
        <h2 className="text-2xl font-black text-ink text-center mb-3">{config.title}</h2>
        <p className="text-slate font-semibold text-center mb-6">{config.description}</p>

        {/* Usage Progress */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-slate">Monthly Usage</span>
            <span className="text-sm font-black text-ink">
              {used}/{limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Pro Benefits Preview */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Crown className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm text-ink mb-1">With Pro Plan:</p>
              <p className="text-xs font-semibold text-slate">{config.benefit}</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-brand-500 hover:bg-green-600 text-white font-black py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            {config.ctaText} - $9.99/month
          </button>
          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-ink font-black py-3 rounded-lg transition-all duration-200"
          >
            Maybe Later
          </button>
        </div>

        {/* Footer */}
        <p className="text-xs text-slate font-semibold text-center mt-6">
          Resets on the 1st of next month
        </p>
      </div>
    </div>
  );
}

export default UpgradeQuotaModal;
