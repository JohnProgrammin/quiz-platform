import React, { useState } from 'react';
import { Gift, Loader } from 'lucide-react';
import { redeemCoupon } from '../api';

function CouponInput({ onSuccess, onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await redeemCoupon(code.toUpperCase());
      setMessage(response.data.message);
      setCode('');

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to redeem coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Gift className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-black text-ink">Unlock Premium</h2>
        </div>

        <p className="text-slate font-semibold mb-6">
          Enter your coupon code for 8-hour access to all Premium features
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter coupon code"
            className="input-field mb-4 uppercase text-center text-lg font-bold tracking-widest"
            disabled={loading}
            autoFocus
          />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-danger font-semibold text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 font-semibold text-sm">
              ✅ {message}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="flex-1 bg-brand-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  REDEEMING...
                </>
              ) : (
                'REDEEM'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-ink font-black py-3 rounded-lg transition-all duration-200"
            >
              CANCEL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CouponInput;
