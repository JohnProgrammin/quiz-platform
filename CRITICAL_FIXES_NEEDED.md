# 🚨 CRITICAL FIXES REQUIRED - ACTION PLAN

## Status: 2 Critical Issues Found

### ❌ ISSUE #1: Missing Database Tables (BLOCKING COUPON FEATURE)

**Error:** `relation "user_coupon_usage" does not exist`

**Root Cause:** Database migration `003_coupon_system.sql` hasn't been run

**Fix Steps (Choose One):**

#### Option A: Command Line (Fastest)
```bash
psql "$DATABASE_URL" < backend/migrations/003_coupon_system.sql
```

#### Option B: Neon Dashboard
1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor"
4. Open `backend/migrations/003_coupon_system.sql` locally
5. Copy entire contents
6. Paste into editor → Click "Execute"

#### Option C: Render Shell
1. Go to https://dashboard.render.com
2. Click your backend service
3. Click "Shell" tab
4. Paste the psql command above

**What This Fixes:**
- ✅ Coupon code LEARN8HOURS will be redeemable
- ✅ Trial status will show correctly
- ✅ "Have a Coupon Code?" feature will work

---

### ❌ ISSUE #2: Paystack Currency Not Supported (BLOCKING PAYMENTS)

**Error:** `Currency not supported by merchant`

**Root Cause:** Your Paystack merchant account doesn't support NGN (or other detected currency)

**Status:** Even though we're now defaulting to NGN, your merchant account rejects it

**Fix Steps:**

#### Step 1: Check Your Paystack Account Capabilities
1. Go to https://dashboard.paystack.co
2. Click Settings → Account → Currencies
3. Take screenshot of supported currencies
4. Tell me what currencies are listed

#### Step 2: Fix Based on What You Find

**If NGN IS supported:**
- Verify PAYSTACK_SECRET_KEY is correct
- Check key isn't rate-limited
- Try with different test amount

**If NGN is NOT supported:**
- Option A: Upgrade Paystack account tier (may require kyc)
- Option B: Switch to USD for testing
- Option C: Use Stripe instead (simpler setup)

#### Step 3: Temporary Fix for Testing
Until payment is fixed, coupon codes work as alternative:
```
Coupon: LEARN8HOURS
Benefit: 8-hour Premium access (no payment needed)
```

---

## IMMEDIATE ACTION REQUIRED

### For Coupon Feature to Work:
```bash
psql "$DATABASE_URL" < backend/migrations/003_coupon_system.sql
```

Then test: Go to Dashboard → "Have a Coupon Code?" → Enter `LEARN8HOURS` → Click Redeem

### For Payment to Work:
1. Check Paystack supported currencies
2. Update code if needed based on findings
3. Test payment flow

---

## Files That Need Database:
- ✅ `backend/migrations/003_coupon_system.sql` - Already created, needs to be RUN
- ❌ `coupons` table - Missing
- ❌ `user_coupon_usage` table - Missing

## Timeline to Fix:
- Migration: **2 minutes** (copy/paste SQL)
- Paystack: **10-15 minutes** (check dashboard + update keys if needed)

**Status**: Everything is code-ready. Just need to run database migration and verify Paystack account.
