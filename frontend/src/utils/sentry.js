/**
 * Error tracking and monitoring with Sentry
 * Integrated error tracking for production monitoring
 */

import * as Sentry from '@sentry/react';

/**
 * Initialize Sentry for error tracking
 */
export const initializeSentry = () => {
  try {
    const integrations = [];

    // Try to add Replay if available
    if (Sentry.Replay) {
      integrations.push(
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        })
      );
    }

    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0',
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: 1.0,
      integrations,
      replaysSessionSampleRate: integrations.length > 0 ? 0.1 : undefined,
      replaysOnErrorSampleRate: integrations.length > 0 ? 1.0 : undefined,
    });

    console.log('✅ Sentry error tracking initialized');
  } catch (err) {
    console.warn('⚠️  Sentry initialization skipped:', err.message);
    // Non-critical - continue without Sentry
  }
};

/**
 * Capture exceptions
 */
export const captureException = (error, context = {}) => {
  console.error('Error captured:', error, context);
  Sentry.captureException(error, { extra: context });
};

/**
 * Capture messages
 */
export const captureMessage = (message, level = 'info') => {
  console.log(`Message (${level}):`, message);
  Sentry.captureMessage(message, level);
};

/**
 * Set user context for error tracking
 */
export const setSentryUser = (user) => {
  if (user) {
    Sentry.setUser({
      id: user.id,
      username: user.username,
      email: user.email,
    });
    sessionStorage.setItem('errorTrackingUser', JSON.stringify({
      id: user.id,
      username: user.username,
      email: user.email,
    }));
  }
};

/**
 * Clear user context on logout
 */
export const clearSentryUser = () => {
  Sentry.setUser(null);
  sessionStorage.removeItem('errorTrackingUser');
};

/**
 * Log performance metrics
 */
export const logPerformanceMetric = (name, duration, metadata = {}) => {
  console.log(`Performance: ${name} took ${duration}ms`, metadata);
  Sentry.captureMessage(`Performance: ${name} took ${duration}ms`, 'info');
};

/**
 * Store errors in localStorage for analysis
 */
const storeErrorLocally = (errorData) => {
  try {
    const errors = JSON.parse(localStorage.getItem('floraquiz_errors') || '[]');
    errors.push(errorData);

    // Keep only last 50 errors
    if (errors.length > 50) {
      errors.shift();
    }

    localStorage.setItem('floraquiz_errors', JSON.stringify(errors));
  } catch (e) {
    // LocalStorage might be full
  }
};

/**
 * Get stored errors for debugging
 */
export const getStoredErrors = () => {
  try {
    return JSON.parse(localStorage.getItem('floraquiz_errors') || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Clear stored errors
 */
export const clearStoredErrors = () => {
  try {
    localStorage.removeItem('floraquiz_errors');
  } catch (e) {
    // Ignore
  }
};

export default {
  initializeSentry,
  captureException,
  captureMessage,
  setSentryUser,
  clearSentryUser,
  logPerformanceMetric,
  getStoredErrors,
  clearStoredErrors,
};
