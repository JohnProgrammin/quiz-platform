/**
 * Payment Verification Timeout Configuration
 * Manages timeout behavior for payment gateway operations
 * Prevents hanging requests and improves user experience
 */

const TIMEOUT_CONFIG = {
  // Stripe operations
  STRIPE_CHECKOUT_SESSION: 30000, // 30 seconds to create checkout
  STRIPE_RETRIEVE_SESSION: 15000, // 15 seconds to retrieve session
  STRIPE_WEBHOOK_PROCESS: 20000, // 20 seconds to process webhook
  STRIPE_CUSTOMER_LOOKUP: 10000, // 10 seconds to lookup customer

  // Payment verification
  PAYMENT_VERIFICATION: 45000, // 45 seconds for full verification
  PAYMENT_CONFIRMATION_POLL: 5000, // 5 seconds between poll attempts
  PAYMENT_CONFIRMATION_MAX_ATTEMPTS: 12, // Max 12 attempts = 60 seconds total

  // Subscription operations
  SUBSCRIPTION_CREATION: 30000, // 30 seconds to create subscription
  SUBSCRIPTION_CANCELLATION: 20000, // 20 seconds to cancel
  SUBSCRIPTION_RETRIEVAL: 10000, // 10 seconds to retrieve

  // Retry behavior
  RETRY_DELAY_BASE: 1000, // 1 second base delay
  RETRY_DELAY_MAX: 10000, // 10 second max delay
  RETRY_BACKOFF_MULTIPLIER: 2, // Exponential backoff
};

/**
 * Creates a timeout promise that rejects after specified duration
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise} - Rejects with TimeoutError after ms
 */
function createTimeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(
      () => reject(new Error(`Operation timeout after ${ms}ms`)),
      ms
    )
  );
}

/**
 * Wraps a promise with a timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} ms - Timeout in milliseconds
 * @param {string} operation - Operation name for error message
 * @returns {Promise} - Original promise or timeout error
 */
async function withTimeout(promise, ms, operation = 'Operation') {
  try {
    return await Promise.race([
      promise,
      createTimeout(ms),
    ]);
  } catch (error) {
    if (error.message.includes('timeout')) {
      const err = new Error(`${operation} timed out after ${ms}ms`);
      err.code = 'TIMEOUT';
      err.operation = operation;
      throw err;
    }
    throw error;
  }
}

/**
 * Retries an async operation with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} initialDelay - Initial delay in ms
 * @param {string} operation - Operation name for error message
 * @returns {Promise} - Result of operation
 */
async function retryWithBackoff(
  fn,
  maxRetries = 3,
  initialDelay = TIMEOUT_CONFIG.RETRY_DELAY_BASE,
  operation = 'Operation'
) {
  let lastError;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[${operation}] Attempt ${attempt}/${maxRetries}`);
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // Don't retry on timeout if we've exceeded max attempts
      if (error.code === 'TIMEOUT' && attempt === maxRetries) {
        throw error;
      }

      if (attempt < maxRetries) {
        console.warn(
          `[${operation}] Attempt ${attempt} failed, retrying in ${delay}ms...`,
          error.message
        );
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(
          delay * TIMEOUT_CONFIG.RETRY_BACKOFF_MULTIPLIER,
          TIMEOUT_CONFIG.RETRY_DELAY_MAX
        );
      }
    }
  }

  throw lastError || new Error(`${operation} failed after ${maxRetries} attempts`);
}

/**
 * Verifies payment with timeout and retry logic
 * @param {Object} paymentData - Payment details
 * @param {string} paymentData.paymentId - Payment ID to verify
 * @param {Function} verifyFn - Function that performs actual verification
 * @returns {Promise<Object>} - Verification result
 */
async function verifyPaymentWithTimeout(paymentData, verifyFn) {
  return retryWithBackoff(
    () => withTimeout(
      verifyFn(paymentData),
      TIMEOUT_CONFIG.PAYMENT_VERIFICATION,
      'Payment verification'
    ),
    3,
    TIMEOUT_CONFIG.RETRY_DELAY_BASE,
    'Payment verification'
  );
}

/**
 * Polls for payment confirmation until success or timeout
 * @param {Function} checkFn - Function that checks payment status
 * @param {number} maxAttempts - Maximum poll attempts
 * @param {number} pollInterval - Time between polls in ms
 * @returns {Promise<Object>} - Payment status
 */
async function pollPaymentConfirmation(
  checkFn,
  maxAttempts = TIMEOUT_CONFIG.PAYMENT_CONFIRMATION_MAX_ATTEMPTS,
  pollInterval = TIMEOUT_CONFIG.PAYMENT_CONFIRMATION_POLL
) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await withTimeout(
        checkFn(),
        TIMEOUT_CONFIG.PAYMENT_CONFIRMATION_POLL,
        'Payment status check'
      );

      if (result.confirmed || result.status === 'completed') {
        return result;
      }

      if (attempt < maxAttempts) {
        console.log(`[Payment Poll] Attempt ${attempt}/${maxAttempts}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    } catch (error) {
      if (attempt === maxAttempts) {
        throw new Error(`Payment confirmation polling failed after ${maxAttempts} attempts`);
      }
      console.warn(`[Payment Poll] Attempt ${attempt} failed:`, error.message);
    }
  }

  throw new Error('Payment confirmation timeout');
}

module.exports = {
  TIMEOUT_CONFIG,
  createTimeout,
  withTimeout,
  retryWithBackoff,
  verifyPaymentWithTimeout,
  pollPaymentConfirmation,
};
