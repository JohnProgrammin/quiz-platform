import React, { useState, useEffect } from 'react';
import { getBillingHistory } from '../api';
import { Receipt, Loader } from 'lucide-react';

function BillingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getBillingHistory();
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Error loading billing history:', err);
      setError('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card p-12 text-center">
        <Loader className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-4" />
        <p className="text-slate font-bold">Loading billing history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-8 text-center">
        <p className="text-danger font-bold">{error}</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Receipt className="w-12 h-12 text-muted mx-auto mb-4" />
        <p className="text-slate font-bold">No billing history yet</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="px-6 py-4 border-b-2 border-border">
        <h3 className="text-lg font-extrabold text-ink">Billing History</h3>
      </div>

      <div className="divide-y-2 divide-border">
        {history.map((event, idx) => {
          // Format Paystack event types for display
          const formatEventType = (type) => {
            const labels = {
              'charge.success': 'Payment Successful',
              'charge.failed': 'Payment Failed',
              'subscription.create': 'Subscription Created',
              'subscription.disable': 'Subscription Cancelled',
              'subscription.enable': 'Subscription Resumed',
              'transfer.success': 'Refund Processed',
              'transfer.failed': 'Refund Failed',
            };
            return labels[type] || type.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          };

          // Format currency with symbol
          const formatAmount = (amount, currency) => {
            const symbols = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', KES: 'KES ', GHS: 'GH₵' };
            const symbol = symbols[currency?.toUpperCase()] || currency || '$';
            return `${symbol}${(amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
          };

          return (
            <div key={event.id || idx} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-ink">
                  {formatEventType(event.event_type)}
                </p>
                <p className="text-sm font-semibold text-slate">
                  {new Date(event.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="text-right">
                {event.amount && (
                  <p className="font-bold text-ink">
                    {formatAmount(event.amount, event.currency)}
                  </p>
                )}
                <p className={`text-sm font-semibold ${event.status === 'succeeded' ? 'text-success' : event.status === 'failed' ? 'text-danger' : 'text-slate'
                  }`}>
                  {event.status?.charAt(0).toUpperCase() + event.status?.slice(1)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BillingHistory;
