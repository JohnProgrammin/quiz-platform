import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { verifyPayment } from '../api';

/**
 * Payment Callback Handler
 * Handles Paystack payment redirect and verification
 * URL: /subscription/callback?reference=xxx
 */
function PaymentCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed, timeout
  const [message, setMessage] = useState('Verifying your payment...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (status === 'verifying') {
        setStatus('timeout');
        setMessage('Payment verification is taking longer than expected. Please check your email or contact support.');
      }
    }, 30000); // 30 second timeout

    verifyPaymentWithBackend();

    return () => clearTimeout(timeoutId);
  }, []);

  const verifyPaymentWithBackend = async () => {
    try {
      const reference = searchParams.get('reference');

      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found. Please try again.');
        return;
      }

      // Call backend to verify payment
      const response = await verifyPayment(reference);
      const data = response.data;

      if (data.verified) {
        setStatus('success');
        setMessage(`🎉 Payment successful! Upgrading to ${data.tier} plan...`);
        setDetails(data);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage(data.error || 'Payment verification failed. Please contact support.');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setStatus('failed');
      setMessage(error.response?.data?.error || 'Error verifying payment. Please try again or contact support.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <Loader className="w-12 h-12 text-brand-500 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2">Verifying Payment</h1>
            <p className="text-slate text-sm">{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2">Payment Successful!</h1>
            <p className="text-slate text-sm mb-4">{message}</p>
            {details && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
                <div className="text-sm">
                  <p className="text-slate mb-2">
                    <span className="font-semibold text-ink">Plan:</span> {details.tier?.toUpperCase()}
                  </p>
                  <p className="text-slate">
                    <span className="font-semibold text-ink">Status:</span> Active
                  </p>
                </div>
              </div>
            )}
            <p className="text-xs text-slate">
              Redirecting to dashboard in a few seconds...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2">Payment Failed</h1>
            <p className="text-slate text-sm mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate('/pricing')}
                className="w-full px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-4 py-2 border-2 border-slate-200 text-slate font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}

        {status === 'timeout' && (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2">Verification Timeout</h1>
            <p className="text-slate text-sm mb-6">
              The payment verification took too long. Your payment may still be processing.
              Please check your subscription status or contact support.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 bg-brand-500 text-white font-semibold rounded-lg hover:bg-brand-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentCallback;
