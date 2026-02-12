const Stripe = require('stripe');
require('dotenv').config();

/**
 * Stripe Configuration
 * Handles payment processing and subscription management
 *
 * Environment Variables:
 * - STRIPE_SECRET_KEY: Stripe secret key for API calls
 * - STRIPE_PUBLISHABLE_KEY: Stripe public key (for frontend)
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret for security
 * - STRIPE_PRICE_ID_PRO: Price ID for Pro tier ($9.99/month)
 * - STRIPE_PRICE_ID_PREMIUM: Price ID for Premium tier ($19.99/month)
 */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

/**
 * Pricing information for all subscription tiers
 */
const pricingPlans = {
  pro: {
    name: 'Pro',
    price: 999, // $9.99 in cents
    currency: 'usd',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_ID_PRO,
    features: [
      'Unlimited notes (50MB each)',
      'Unlimited quiz generation',
      'Variable question count (10-30)',
      'MCQ + free-text mix',
      'Pre-quiz AI teaching',
      'Post-quiz AI feedback',
      'Weakness mastery quizzes',
      'Enhanced analytics',
      'PDF export',
    ],
  },
  premium: {
    name: 'Premium',
    price: 1999, // $19.99 in cents
    currency: 'usd',
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_ID_PREMIUM,
    features: [
      'Everything in Pro',
      'AI Teaching (unlimited)',
      'Custom quiz settings',
      'API access',
      'Priority support',
      'Early access to features',
    ],
  },
};

/**
 * Create a Stripe customer
 * Called when user signs up
 */
const createCustomer = async (email, fullName) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name: fullName || email,
    });
    return customer;
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    throw error;
  }
};

/**
 * Create a checkout session
 * Called when user clicks "Upgrade" button
 */
const createCheckoutSession = async (customerId, priceId, successUrl, cancelUrl) => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });
    return session;
  } catch (error) {
    console.error('Stripe checkout session creation error:', error);
    throw error;
  }
};

/**
 * Create a billing portal session
 * Allows user to manage subscription, update payment method, etc.
 */
const createBillingPortalSession = async (customerId, returnUrl) => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    console.error('Stripe billing portal error:', error);
    throw error;
  }
};

/**
 * Retrieve subscription details
 */
const getSubscription = async (subscriptionId) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Stripe get subscription error:', error);
    throw error;
  }
};

/**
 * Cancel subscription
 */
const cancelSubscription = async (subscriptionId, cancelAtPeriodEnd = true) => {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });
    return subscription;
  } catch (error) {
    console.error('Stripe cancel subscription error:', error);
    throw error;
  }
};

/**
 * Retrieve customer
 */
const getCustomer = async (customerId) => {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return customer;
  } catch (error) {
    console.error('Stripe get customer error:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 * Ensures webhook came from Stripe
 */
const verifyWebhookSignature = (body, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    return event;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    throw error;
  }
};

/**
 * Handle common webhook events
 */
const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      console.log('✅ Checkout completed:', session.id);
      return { handled: true, type: 'checkout_completed', session };
    }

    case 'customer.subscription.created': {
      const subscription = event.data.object;
      console.log('✅ Subscription created:', subscription.id);
      return { handled: true, type: 'subscription_created', subscription };
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      console.log('✅ Subscription updated:', subscription.id);
      return { handled: true, type: 'subscription_updated', subscription };
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      console.log('✅ Subscription deleted:', subscription.id);
      return { handled: true, type: 'subscription_deleted', subscription };
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      console.log('✅ Payment succeeded:', invoice.id);
      return { handled: true, type: 'payment_succeeded', invoice };
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      console.log('⚠️  Payment failed:', invoice.id);
      return { handled: true, type: 'payment_failed', invoice };
    }

    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
      return { handled: false, type: event.type };
  }
};

module.exports = {
  stripe,
  pricingPlans,
  createCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  getSubscription,
  cancelSubscription,
  getCustomer,
  verifyWebhookSignature,
  handleWebhookEvent,
};
