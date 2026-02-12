/**
 * Paystack Configuration
 * Direct API implementation (no npm library to avoid bugs)
 */

const https = require('https');
require('dotenv').config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;

/**
 * Make HTTPS request to Paystack API
 */
const makePaystackRequest = (method, endpoint, data) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.paystack.co',
      path: endpoint,
      method: method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: parsed.status,
            data: parsed.data,
            message: parsed.message,
          });
        } catch (e) {
          reject(new Error(`Failed to parse Paystack response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('Paystack request error:', error);
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

/**
 * Verify Paystack webhook signature
 */
const verifyWebhookSignature = (body, signature) => {
  const crypto = require('crypto');
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    throw new Error('Invalid webhook signature');
  }

  return JSON.parse(body);
};

/**
 * Initialize Paystack transaction
 */
const createTransaction = async (params) => {
  try {
    const data = {
      email: params.email,
      amount: params.amount * 100, // Convert to kobo
      metadata: {
        userId: params.userId,
        plan: params.plan,
      },
      callback_url: params.callbackUrl,
    };

    const response = await makePaystackRequest('POST', '/transaction/initialize', data);

    if (!response.status) {
      throw new Error(response.message || 'Failed to initialize transaction');
    }

    return response;
  } catch (error) {
    console.error('❌ Paystack transaction error:', error.message);
    throw error;
  }
};

/**
 * Verify payment with Paystack
 */
const verifyPayment = async (reference) => {
  try {
    const response = await makePaystackRequest('GET', `/transaction/verify/${reference}`);

    if (!response.status) {
      throw new Error(response.message || 'Payment verification failed');
    }

    return response;
  } catch (error) {
    console.error('❌ Paystack verification error:', error.message);
    throw error;
  }
};

/**
 * List transactions for customer
 */
const listTransactions = async (email) => {
  try {
    const response = await makePaystackRequest('GET', `/transaction?customer=${encodeURIComponent(email)}`);

    if (!response.status) {
      throw new Error(response.message || 'Failed to list transactions');
    }

    return response;
  } catch (error) {
    console.error('❌ Paystack list error:', error.message);
    throw error;
  }
};

module.exports = {
  createTransaction,
  verifyPayment,
  verifyWebhookSignature,
  listTransactions,
};
