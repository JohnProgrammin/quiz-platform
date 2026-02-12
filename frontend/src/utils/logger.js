/**
 * Comprehensive logging system for floraquiz platform
 * Integrates with Sentry for error tracking and provides detailed logs
 */

import { captureException, captureMessage } from './sentry';

const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
  }

  /**
   * Core logging method
   */
  log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level,
      message,
      data,
      timestamp,
      url: window.location.pathname,
    };

    // Store in memory
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with styling
    const styles = this.getStyles(level);
    console.log(`%c[${level.toUpperCase()}]%c ${timestamp} - ${message}`, styles.label, styles.message, data);

    // Send to Sentry for errors and warnings
    if (level === LogLevel.ERROR || level === LogLevel.FATAL) {
      captureException(new Error(message), { data });
    } else if (level === LogLevel.WARN) {
      captureMessage(message, 'warning');
    }

    // Store to local storage for debugging
    this.storeLogsLocally();
  }

  /**
   * Debug level log
   */
  debug(message, data) {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level log
   */
  info(message, data) {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning level log
   */
  warn(message, data) {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level log
   */
  error(message, error, data = {}) {
    const errorData = {
      message: error?.message,
      stack: error?.stack,
      ...data,
    };
    this.log(LogLevel.ERROR, message, errorData);
  }

  /**
   * Fatal level log
   */
  fatal(message, error, data = {}) {
    const errorData = {
      message: error?.message,
      stack: error?.stack,
      ...data,
    };
    this.log(LogLevel.FATAL, message, errorData);
  }

  /**
   * Log API calls
   */
  logAPICall(method, endpoint, status, duration, error = null) {
    const data = {
      method,
      endpoint,
      status,
      duration: `${duration}ms`,
    };

    if (error) {
      data.error = error;
      this.warn(`API Error: ${method} ${endpoint}`, data);
    } else {
      this.debug(`API Call: ${method} ${endpoint} - ${status}`, data);
    }
  }

  /**
   * Log user actions for analytics
   */
  logUserAction(action, metadata = {}) {
    this.info(`User Action: ${action}`, metadata);
  }

  /**
   * Log quiz performance
   */
  logQuizPerformance(quizId, score, timeSpent) {
    this.info('Quiz Completed', {
      quizId,
      score,
      timeSpent: `${timeSpent}s`,
    });
  }

  /**
   * Get console styling
   */
  getStyles(level) {
    const styles = {
      debug: {
        label: 'color: #666; font-weight: bold;',
        message: 'color: #666;',
      },
      info: {
        label: 'color: #0066cc; font-weight: bold;',
        message: 'color: #0066cc;',
      },
      warn: {
        label: 'color: #ff9900; font-weight: bold;',
        message: 'color: #ff9900;',
      },
      error: {
        label: 'color: #cc0000; font-weight: bold;',
        message: 'color: #cc0000;',
      },
      fatal: {
        label: 'color: #990000; font-weight: bold; background: #ffcccc;',
        message: 'color: #990000;',
      },
    };

    return styles[level] || styles.info;
  }

  /**
   * Store logs in localStorage
   */
  storeLogsLocally() {
    try {
      const recentLogs = this.logs.slice(-100); // Store last 100 logs
      localStorage.setItem('floraquiz_logs', JSON.stringify(recentLogs));
    } catch (e) {
      // LocalStorage might be full, ignore
    }
  }

  /**
   * Retrieve stored logs
   */
  getStoredLogs() {
    try {
      const stored = localStorage.getItem('floraquiz_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('floraquiz_logs');
    } catch (e) {
      // Ignore
    }
  }

  /**
   * Export logs for debugging
   */
  exportLogs() {
    const allLogs = [...this.logs, ...this.getStoredLogs()];
    const dataStr = JSON.stringify(allLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `floraquiz-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
