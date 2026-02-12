/**
 * Logger Service
 * Centralized logging with Sentry integration for production error tracking
 */

class LoggerService {
  constructor() {
    this.isDev = process.env.NODE_ENV !== 'production';
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.sentryDsn = process.env.SENTRY_DSN;
    this.initSentry();
  }

  /**
   * Initialize Sentry for error tracking (if configured)
   */
  initSentry() {
    if (this.sentryDsn && !this.isDev) {
      try {
        const Sentry = require('@sentry/node');
        Sentry.init({
          dsn: this.sentryDsn,
          tracesSampleRate: 0.1,
          environment: process.env.NODE_ENV || 'production',
        });
        this.sentry = Sentry;
        console.log('✅ Sentry initialized for error tracking');
      } catch (error) {
        console.warn('⚠️  Could not initialize Sentry:', error.message);
      }
    }
  }

  /**
   * Log informational message
   */
  info(message, data = {}) {
    console.log(`[${this._timestamp()}] ℹ️  ${message}`, data);
  }

  /**
   * Log warning message
   */
  warn(message, data = {}) {
    console.warn(`[${this._timestamp()}] ⚠️  ${message}`, data);
  }

  /**
   * Log error message and optionally send to Sentry
   */
  error(message, error = null, context = {}) {
    console.error(`[${this._timestamp()}] ❌ ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      context
    });

    // Send to Sentry if configured
    if (this.sentry && !this.isDev) {
      this.sentry.captureException(error, {
        level: 'error',
        extra: { message, context }
      });
    }
  }

  /**
   * Log debug message (development only)
   */
  debug(message, data = {}) {
    if (this.isDev) {
      console.log(`[${this._timestamp()}] 🔍 ${message}`, data);
    }
  }

  /**
   * Log API call
   */
  logApiCall(method, path, statusCode, duration, error = null) {
    const status = statusCode >= 400 ? '❌' : '✅';
    console.log(
      `[${this._timestamp()}] ${status} ${method} ${path} - ${statusCode} (${duration}ms)`,
      error ? { error } : ''
    );

    // Track errors in Sentry
    if (statusCode >= 500 && this.sentry && !this.isDev) {
      this.sentry.captureMessage(
        `API Error: ${method} ${path} - ${statusCode}`,
        'error'
      );
    }
  }

  /**
   * Log database query
   */
  logDatabase(query, duration, error = null) {
    const status = error ? '❌' : '✅';
    const msg = `[${this._timestamp()}] ${status} Database Query (${duration}ms)`;

    if (error) {
      console.error(msg, { error: error.message, query });
      if (this.sentry && !this.isDev) {
        this.sentry.captureException(error, {
          level: 'error',
          tags: { type: 'database' }
        });
      }
    } else {
      console.log(msg, { query: query.substring(0, 100) + '...' });
    }
  }

  /**
   * Log cache operation
   */
  logCache(operation, key, hit = null) {
    if (hit === true) {
      console.log(`[${this._timestamp()}] 🟢 Cache HIT: ${operation}(${key})`);
    } else if (hit === false) {
      console.log(`[${this._timestamp()}] 🔴 Cache MISS: ${operation}(${key})`);
    } else {
      console.log(`[${this._timestamp()}] 📦 Cache ${operation}: ${key}`);
    }
  }

  /**
   * Log authentication event
   */
  logAuth(event, userId, success = true) {
    const status = success ? '✅' : '❌';
    console.log(
      `[${this._timestamp()}] ${status} Auth ${event} - User: ${userId || 'unknown'}`
    );

    // Track failed auth attempts
    if (!success && this.sentry && !this.isDev) {
      this.sentry.captureMessage(
        `Failed authentication: ${event}`,
        'warning'
      );
    }
  }

  /**
   * Get current timestamp
   */
  _timestamp() {
    return new Date().toISOString();
  }

  /**
   * Create error context for better debugging
   */
  createContext(userId, path, method) {
    return {
      userId,
      path,
      method,
      timestamp: this._timestamp(),
      environment: process.env.NODE_ENV
    };
  }
}

module.exports = new LoggerService();
