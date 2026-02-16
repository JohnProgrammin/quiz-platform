# Payment Flow Test Plan - Currency Selection Feature

## Overview
This document outlines the complete payment flow with the new currency selection feature that allows Nigerian users (and others) to select their preferred currency before checkout.

## Features Implemented

### Backend Changes (server.js)
✅ **Checkout Endpoint Enhancement** (`POST /api/v1/subscription/checkout`)
- Accepts optional `currency` parameter from frontend
- Falls back to geolocation detection if currency not provided
- Passes currency to Paystack transaction initialization
- Returns complete payment info including:
  - `authorizationUrl` - Paystack payment page
  - `currency` - User's selected currency
  - `displayPrice` - Formatted price display
  - `conversionRate` - Exchange rate applied

### Frontend Changes (PricingPage.jsx)
✅ **Currency Selector Component**
- Dropdown with 10 currencies:
  - 🇺🇸 USD ($)
  - 🇳🇬 NGN (₦) - **Primary for Nigeria**
  - 🇬🇧 GBP (£)
  - 🇪🇺 EUR (€)
  - 🇮🇳 INR (₹)
  - 🇰🇷 KRW (₩)
  - 🇯🇵 JPY (¥)
  - 🇨🇦 CAD ($)
  - 🇦🇺 AUD ($)
  - 🇿🇦 ZAR (R)

✅ **State Management**
- `selectedCurrency` - User's choice (initially auto-detected)
- `detectedCurrency` - Shows what was auto-detected
- Displays hint when user overrides auto-detection

✅ **Paystack Config (paystack.config.js)**
- Line 85: `currency: params.currency || 'NGN'`
- Ensures Paystack receives proper currency code

## Test Scenarios

### Scenario 1: Nigerian User Flow (DEFAULT CASE)
**Objective**: Verify Nigerian users see correct NGN pricing

**Steps**:
1. User from Nigeria visits pricing page
2. Geolocation detects Nigeria → Currency auto-set to "NGN"
3. Pro Plan shows: ₦13,512 (converted from $9.99)
4. User clicks "Select Plan"
5. Frontend sends: `{ plan: 'pro', currency: 'NGN' }`
6. Backend receives request and:
   - Calls `currencyService.getPaystackPaymentData('NGN', 'pro')`
   - Gets converted amount: ~3,378,000 kobo (₦33,780)
   - Creates Paystack transaction with `currency: 'NGN'`
7. Paystack initializes with correct currency
8. User redirected to Paystack checkout showing NGN amount

**Expected Result**: ✅ Paystack shows "₦13,512" not "$9.99"

---

### Scenario 2: US User Changing to NGN
**Objective**: Verify manual currency override works

**Steps**:
1. User from US visits pricing page
2. Geolocation detects US → Currency auto-set to "USD"
3. User clicks dropdown and selects "NGN (₦)"
4. UI shows: "ℹ️ Auto-detected: USD" (hint that they've changed)
5. Pro Plan updates to show: ₦13,512
6. User clicks "Select Plan"
7. Frontend sends: `{ plan: 'pro', currency: 'NGN' }`
8. Backend converts and initiates with NGN

**Expected Result**: ✅ Payment works with user's chosen currency

---

### Scenario 3: Geolocation Failure Fallback
**Objective**: Verify graceful fallback when geolocation fails

**Steps**:
1. Backend catches geolocation error
2. Logs: "⚠️ Geolocation detection failed, defaulting to USD"
3. Sets `userCurrency = 'USD'`
4. User can still manually select from dropdown
5. Payment proceeds with selected currency

**Expected Result**: ✅ Payment doesn't fail due to geolocation issues

---

### Scenario 4: Premium Plan Pricing
**Objective**: Verify Premium tier also converts correctly

**Steps**:
1. Select NGN currency
2. Premium Plan shows: ₦27,024 (converted from $19.99)
3. User clicks "Select Plan"
4. Backend converts and charges correct amount

**Expected Result**: ✅ Both Pro and Premium tiers work

---

## Technical Verification Checklist

### Backend Verification
- [ ] `/api/v1/subscription/checkout` accepts `currency` parameter
- [ ] Paystack transaction includes `currency` field
- [ ] Error logging shows when geolocation fails
- [ ] Response includes payment info with display price
- [ ] Console shows: `💳 Payment data prepared: { currency: NGN, amount: ..., displayPrice: ... }`

### Frontend Verification
- [ ] Currency dropdown displays all 10 currencies with emojis
- [ ] Selected currency updates plan display price
- [ ] Auto-detected currency message shows when overridden
- [ ] `handleSelectPlan` passes `currency: selectedCurrency` to API
- [ ] No console errors when selecting currency

### Payment Flow Verification
- [ ] Paystack receives correct currency code
- [ ] User sees correct currency symbol in Paystack modal
- [ ] User sees converted price in Paystack (not literal conversion)
- [ ] Payment completes successfully
- [ ] Webhook processing handles currency metadata

---

## Deployment Checklist

### Before Deploying to Production

**Backend (Render)**:
1. [ ] Code reviewed: server.js checkout endpoint
2. [ ] Paystack config includes currency parameter
3. [ ] Error handling is comprehensive
4. [ ] Logs are helpful for debugging
5. [ ] Deploy with: `git push origin main`

**Frontend (Vercel)**:
1. [ ] `npm run build` succeeds with no errors
2. [ ] PricingPage renders without console errors
3. [ ] Currency selector is interactive
4. [ ] Deploy with: `git push origin main`

---

## Known Limitations

⚠️ **Currency Conversion Service**:
- Uses real-time exchange rates (if available)
- Falls back to hardcoded rates if API unavailable
- Rates cached for performance

⚠️ **Paystack Supported Currencies**:
- Not all 10 currencies may be supported by Paystack
- NGN, USD, GHS are primary support
- Other currencies may require Paystack plan upgrade

---

## Currency Conversion Example

**Pro Plan: $9.99 USD**

| Currency | Rate | Amount | Display |
|----------|------|--------|---------|
| USD | 1.0 | 999 cents | $9.99 |
| NGN | 1,350 | 13,512 naira | ₦13,512 |
| GBP | 0.79 | 789 pence | £7.89 |
| EUR | 0.92 | 919 cents | €9.19 |
| INR | 83.2 | 83,200 paise | ₹832 |

---

## Testing Commands

### Test Subscription Plans Endpoint
```bash
curl http://localhost:3001/api/v1/subscription/plans
```

**Expected Response**:
```json
{
  "currency": "USD",
  "plans": {
    "pro": { "price": 999, "currency": "USD" },
    "premium": { "price": 1999, "currency": "USD" }
  },
  "detected": true
}
```

### Test Checkout with Currency (Authenticated)
```bash
curl -X POST http://localhost:3001/api/v1/subscription/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan": "pro", "currency": "NGN"}'
```

**Expected Response**:
```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "accessCode": "...",
  "reference": "...",
  "paymentInfo": {
    "amount": 3378000,
    "currency": "NGN",
    "displayPrice": "₦13,512",
    "conversionRate": 1.35
  }
}
```

---

## Success Metrics

✅ **Nigerian users see NGN pricing** (not USD)
✅ **Currency selection persists through checkout**
✅ **Paystack receives correct currency code**
✅ **Payment completes successfully**
✅ **No console errors or warnings**
✅ **Fallback works if geolocation fails**
