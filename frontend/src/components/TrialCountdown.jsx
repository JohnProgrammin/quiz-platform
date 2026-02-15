import React, { useState, useEffect } from 'react';
import { Zap, AlertCircle } from 'lucide-react';

function TrialCountdown({ expiresAt, onExpired }) {
  const [timeRemaining, setTimeRemaining] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires - now;

      if (diff <= 0) {
        setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        onExpired?.();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ hours, minutes, seconds, isExpired: false });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpired]);

  const isWarning = timeRemaining.hours <= 1 && timeRemaining.hours > 0;
  const isCritical = timeRemaining.hours === 0;

  if (timeRemaining.isExpired) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-black text-ink text-sm">Trial Expired</h3>
            <p className="text-slate font-semibold text-sm mt-1">
              Your Premium trial has ended. You're back to the Free plan.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const bgColor = isCritical ? 'bg-red-50 border-red-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200';
  const textColor = isCritical ? 'text-danger' : isWarning ? 'text-amber-700' : 'text-blue-700';
  const iconColor = isCritical ? 'text-danger' : isWarning ? 'text-amber-600' : 'text-brand-500';

  return (
    <div className={`${bgColor} border-2 rounded-2xl p-4 mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <Zap className={`w-6 h-6 ${iconColor} flex-shrink-0 mt-0.5`} />
          <div>
            <h3 className={`font-black text-ink text-sm`}>Premium Trial Active</h3>
            <p className={`${textColor} font-semibold text-sm mt-1`}>
              Expires in {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
            </p>
            {isWarning && (
              <p className="text-amber-700 font-semibold text-xs mt-1">⏰ Expires soon!</p>
            )}
            {isCritical && (
              <p className="text-danger font-black text-xs mt-1">⚠️ Expires in minutes!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrialCountdown;
