/**
 * Currency Service
 * Handles multi-currency pricing and conversion
 * Automatically detects user location and shows prices in their currency
 */

const https = require('https');

class CurrencyService {
  constructor() {
    // Fallback rates (will be updated with real-time data)
    this.exchangeRates = {
      USD: { rate: 1.00, symbol: '$', name: 'US Dollar' },
      GBP: { rate: 0.79, symbol: '£', name: 'British Pound' },
      EUR: { rate: 0.92, symbol: '€', name: 'Euro' },
      INR: { rate: 83.12, symbol: '₹', name: 'Indian Rupee' },
      NGN: { rate: 1353.57, symbol: '₦', name: 'Nigerian Naira' },
      KES: { rate: 156, symbol: 'KES ', name: 'Kenyan Shilling' },
      ZAR: { rate: 18.50, symbol: 'R', name: 'South African Rand' },
      AUD: { rate: 1.53, symbol: 'A$', name: 'Australian Dollar' },
      CAD: { rate: 1.36, symbol: 'C$', name: 'Canadian Dollar' },
      BRL: { rate: 4.97, symbol: 'R$', name: 'Brazilian Real' },
      JPY: { rate: 149.50, symbol: '¥', name: 'Japanese Yen' },
      CNY: { rate: 7.24, symbol: '¥', name: 'Chinese Yuan' },
      MXN: { rate: 17.05, symbol: '$', name: 'Mexican Peso' },
      CHF: { rate: 0.88, symbol: 'CHF', name: 'Swiss Franc' },
      SEK: { rate: 10.51, symbol: 'kr', name: 'Swedish Krona' },
      NZD: { rate: 1.69, symbol: 'NZ$', name: 'New Zealand Dollar' },
      SGD: { rate: 1.34, symbol: 'S$', name: 'Singapore Dollar' },
      HKD: { rate: 7.82, symbol: 'HK$', name: 'Hong Kong Dollar' },
      THB: { rate: 35.45, symbol: '฿', name: 'Thai Baht' },
      PKR: { rate: 278.50, symbol: '₨', name: 'Pakistani Rupee' },
    };

    // Country to currency mapping
    this.countryToCurrency = {
      US: 'USD', GB: 'GBP', CA: 'CAD', AU: 'AUD',
      IN: 'INR', NG: 'NGN', KE: 'KES', ZA: 'ZAR',
      BR: 'BRL', MX: 'MXN', JP: 'JPY', CN: 'CNY',
      CH: 'CHF', SE: 'SEK', NZ: 'NZD', SG: 'SGD',
      HK: 'HKD', TH: 'THB', PK: 'PKR', DE: 'EUR',
      FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
    };

    // Paystack supported currencies (can actually accept payment)
    this.paystackCurrencies = ['NGN', 'USD', 'GBP', 'EUR', 'KES', 'GHS'];

    // Real-time rate tracking
    this.lastRateUpdate = new Date();
    this.rateUpdateInterval = 3600000; // Update every 1 hour

    // Start fetching real-time rates immediately
    this.fetchRealtimeRates();
  }

  /**
   * Fetch real-time exchange rates from free API
   * Uses exchangerate-api.com free tier (1500 requests/month = ~50/day)
   */
  async fetchRealtimeRates() {
    try {
      return new Promise((resolve) => {
        const options = {
          hostname: 'api.exchangerate-api.com',
          path: '/v4/latest/USD',
          method: 'GET',
          timeout: 8000,
        };

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data);
              if (parsed.rates) {
                // Update rates from API
                Object.keys(this.exchangeRates).forEach(currency => {
                  if (parsed.rates[currency]) {
                    this.exchangeRates[currency].rate = parseFloat(parsed.rates[currency].toFixed(2));
                  }
                });
                this.lastRateUpdate = new Date();
                console.log('✅ Exchange rates updated from API at', this.lastRateUpdate.toISOString());
              }
              resolve();
            } catch (e) {
              console.warn('⚠️  Failed to parse exchange rate API response');
              resolve();
            }
          });
        });

        req.on('timeout', () => {
          req.destroy();
          console.warn('⚠️  Exchange rate API timeout, using cached rates');
          resolve();
        });

        req.on('error', (err) => {
          console.warn('⚠️  Exchange rate API error:', err.message);
          resolve(); // Fail silently, use cached rates
        });

        req.end();
      });
    } catch (e) {
      console.warn('⚠️  Failed to fetch exchange rates:', e.message);
    }

    // Schedule next update
    setTimeout(() => this.fetchRealtimeRates(), this.rateUpdateInterval);
  }

  /**
   * Detect user's currency from country code
   * @param {string} countryCode - 2-letter country code (e.g., 'US')
   * @returns {string} Currency code (e.g., 'USD')
   */
  getCurrencyFromCountry(countryCode) {
    if (!countryCode) return 'USD'; // Default to USD
    return this.countryToCurrency[countryCode.toUpperCase()] || 'USD';
  }

  /**
   * Detect user's country from IP address
   * Uses free ip-api.com service
   * @param {string} ipAddress - User's IP address
   * @returns {Promise<{country: string, currency: string}>}
   */
  async detectCountryFromIP(ipAddress) {
    return new Promise((resolve, reject) => {
      if (!ipAddress || ipAddress === 'localhost' || ipAddress === '127.0.0.1') {
        // Default for local/dev
        resolve({ country: 'US', currency: 'USD' });
        return;
      }

      // Remove IPv6 wrapper if present
      const cleanIP = ipAddress.replace(/::ffff:/, '');

      const options = {
        hostname: 'ip-api.com',
        path: `/json/${cleanIP}?fields=country,countryCode,currency`,
        method: 'GET',
        timeout: 3000,
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.status === 'success') {
              resolve({
                country: parsed.country || 'Unknown',
                countryCode: parsed.countryCode || 'US',
                currency: parsed.currency || 'USD',
              });
            } else {
              resolve({ country: 'Unknown', currency: 'USD' });
            }
          } catch (e) {
            resolve({ country: 'Unknown', currency: 'USD' });
          }
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({ country: 'Unknown', currency: 'USD' });
      });

      req.on('error', () => {
        resolve({ country: 'Unknown', currency: 'USD' });
      });

      req.end();
    });
  }

  /**
   * Convert USD price to target currency
   * @param {number} priceUSD - Price in USD cents
   * @param {string} targetCurrency - Target currency code (e.g., 'EUR')
   * @returns {number} Converted price in target currency's minor units
   */
  convertPrice(priceUSD, targetCurrency = 'USD') {
    if (!this.exchangeRates[targetCurrency]) {
      return priceUSD; // Return USD if currency not found
    }

    const rate = this.exchangeRates[targetCurrency].rate;
    const priceUSDDecimal = priceUSD / 100;
    const convertedPrice = priceUSDDecimal * rate;

    // Round appropriately based on currency (most use 2 decimals, JPY uses 0)
    const decimals = targetCurrency === 'JPY' ? 0 : 2;
    const multiplier = Math.pow(10, decimals);

    return Math.round(convertedPrice * multiplier);
  }

  /**
   * Format price for display
   * @param {number} price - Price in minor units (cents)
   * @param {string} currency - Currency code
   * @returns {string} Formatted price (e.g., '$9.99' or '₹830')
   */
  formatPrice(price, currency = 'USD') {
    const currencyData = this.exchangeRates[currency];
    if (!currencyData) {
      return `${price / 100} USD`;
    }

    // Handle zero-decimal currencies (JPY, etc)
    const decimals = currency === 'JPY' ? 0 : 2;
    const displayPrice = (price / Math.pow(10, decimals)).toFixed(decimals);

    // Format with symbol
    if (decimals === 0) {
      return `${currencyData.symbol}${displayPrice}`;
    }
    return `${currencyData.symbol}${displayPrice}`;
  }

  /**
   * Get pricing plans for a specific currency
   * @param {string} currency - Currency code
   * @returns {object} Pricing plans with converted prices
   */
  getPricingPlans(currency = 'USD') {
    // Base prices in USD cents
    const basePlans = {
      free: {
        name: 'Free',
        price: 0,
        currency: currency,
        quizzesPerMonth: 5,
        features: [
          'Up to 3 notes',
          '5 quizzes per month',
          'Basic results',
          'Community support',
        ],
      },
      pro: {
        name: 'Pro',
        priceUSD: 999, // $9.99 in cents
        currency: currency,
        quizzesPerMonth: null, // Unlimited
        features: [
          'Unlimited notes',
          'Unlimited quizzes',
          '10-30 variable questions',
          'MCQ + free-text mix',
          'Pre-quiz AI teaching',
          'Post-quiz AI feedback',
          'Weakness mini-quizzes',
          'Enhanced analytics',
          'PDF export',
          'Email support',
        ],
      },
      premium: {
        name: 'Premium',
        priceUSD: 1999, // $19.99 in cents
        currency: currency,
        quizzesPerMonth: null, // Unlimited
        features: [
          'Everything in Pro',
          'Unlimited AI Teaching sessions',
          '1-on-1 conversational tutoring',
          'Custom quiz settings',
          'Advanced analytics',
          'Priority support',
          'API access (coming soon)',
          'Family plan (5 users)',
        ],
      },
    };

    // Convert prices
    basePlans.pro.price = this.convertPrice(basePlans.pro.priceUSD, currency);
    basePlans.premium.price = this.convertPrice(basePlans.premium.priceUSD, currency);

    return {
      currency,
      baseCurrency: 'USD',
      rates: this.exchangeRates[currency],
      plans: basePlans,
      conversionTimestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all supported currencies
   * @returns {object} List of supported currencies with symbols
   */
  getSupportedCurrencies() {
    const currencies = {};
    Object.entries(this.exchangeRates).forEach(([code, data]) => {
      currencies[code] = {
        name: data.name,
        symbol: data.symbol,
        rate: data.rate,
        isPaystackSupported: this.paystackCurrencies.includes(code),
      };
    });
    return currencies;
  }

  /**
   * Check if currency is supported for Paystack payments
   * @param {string} currency - Currency code
   * @returns {boolean}
   */
  isPaystackSupported(currency) {
    return this.paystackCurrencies.includes(currency);
  }

  /**
   * Get recommended currency for Paystack based on user location
   * Falls back to USD if not supported
   * @param {string} currency - Requested currency
   * @returns {string} Paystack-supported currency
   */
  getPaystackCurrency(currency) {
    if (this.isPaystackSupported(currency)) {
      return currency;
    }
    // Fallback mapping for unsupported currencies
    // Default to NGN (Nigerian Naira - Paystack native currency)
    const fallback = {
      AUD: 'NGN',
      CAD: 'NGN',
      NZD: 'NGN',
      JPY: 'NGN',
      CNY: 'NGN',
      MXN: 'NGN',
      BRL: 'NGN',
      GHS: 'GHS', // Ghana uses GHS
      // Add more as Paystack adds support
    };
    return fallback[currency] || 'NGN'; // Default to NGN (Paystack's native currency)
  }

  /**
   * Format Paystack payment request with currency conversion
   * @param {string} userCurrency - User's requested currency
   * @param {string} planType - 'pro' or 'premium'
   * @returns {object} Paystack-ready payment object
   */
  getPaystackPaymentData(userCurrency, planType = 'pro') {
    const plans = {
      pro: { nameUSD: 'Pro', priceUSD: 999 },
      premium: { nameUSD: 'Premium', priceUSD: 1999 },
    };

    const plan = plans[planType];
    if (!plan) throw new Error('Invalid plan type');

    // Get Paystack currency (might differ from user's currency)
    const paystackCurrency = this.getPaystackCurrency(userCurrency);

    // Convert to Paystack currency
    const amount = this.convertPrice(plan.priceUSD, paystackCurrency);

    return {
      amount, // In minor units (cents, etc)
      currency: paystackCurrency,
      originalCurrency: userCurrency,
      plan: planType,
      planName: plan.nameUSD,
      displayPrice: this.formatPrice(
        this.convertPrice(plan.priceUSD, userCurrency),
        userCurrency
      ),
      description: `FloraQuiz ${plan.nameUSD} - Monthly Subscription`,
      conversionRate: this.exchangeRates[paystackCurrency].rate,
    };
  }
}

module.exports = new CurrencyService();
