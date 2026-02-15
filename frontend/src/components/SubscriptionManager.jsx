import React, { useState } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { cancelSubscription, resumeSubscription } from '../api';
import { Crown, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

function SubscriptionManager() {
  const navigate = useNavigate();
  const { subscription, tier, refresh } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel? You\'ll lose access at the end of your billing period.')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await cancelSubscription();
      setMessage('Subscription will cancel at period end');
      refresh();
    } catch (error) {
      setMessage('Error canceling subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    setMessage('');

    try {
      await resumeSubscription();
      setMessage('Subscription resumed successfully!');
      refresh();
    } catch (error) {
      setMessage('Error resuming subscription');
    } finally {
      setLoading(false);
    }
  };

  if (tier === 'free') {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center">
            <Crown className="w-6 h-6 text-slate" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-ink">Free Plan</h3>
            <p className="text-sm font-semibold text-slate">Upgrade to unlock premium features</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/pricing')}
          className="btn-primary w-full text-center"
        >
          View Plans
        </button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {message && (
        <div className={`mb-4 p-3 rounded-xl border-2 font-bold text-sm ${
          message.includes('Error') ? 'bg-red-50 text-danger border-danger' : 'bg-green-50 text-success border-success'
        }`}>
          {message}
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
          tier === 'premium' ? 'bg-amber-400' : 'bg-brand-500'
        }`}>
          <Crown className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-extrabold text-ink capitalize">{tier} Plan</h3>
          <p className="text-sm font-semibold text-slate">
            {subscription?.status === 'active' ? 'Active subscription' : subscription?.status || 'Active'}
          </p>
        </div>
      </div>

      {subscription && (
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-5 h-5 text-slate" />
            <span className="font-semibold text-ink">
              Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
            </span>
          </div>

          {subscription.cancel_at_period_end && (
            <div className="flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-danger" />
              <span className="font-semibold text-danger">
                Cancels at period end
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3">
        {subscription?.cancel_at_period_end ? (
          <button
            onClick={handleResume}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-5 h-5" />
            Resume Subscription
          </button>
        ) : (
          <button
            onClick={handleCancel}
            disabled={loading}
            className="btn-danger w-full"
          >
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
}

export default SubscriptionManager;
