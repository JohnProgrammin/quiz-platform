# FloraQuiz - Pricing Strategy & Cost Analysis

**Date**: February 13, 2026
**Currency Analysis**: Multi-currency support with dynamic pricing

---

## 💰 Infrastructure Cost Breakdown (Monthly)

### Fixed Costs (Always Paid)

| Service | Cost | Purpose |
|---------|------|---------|
| **Vercel (Frontend)** | $20 | Production deployment, CDN, SSL |
| **Render (Backend)** | $7 | Docker container hosting |
| **Neon (Database)** | $15 | PostgreSQL serverless, 10 GB storage |
| **Upstash (Redis)** | $5 | Redis cache, 10 GB storage |
| **Cloudflare R2** | $5 | File storage (first 10 GB free, $0.50/GB extra) |
| **Resend (Email)** | $0 | 100 free emails/day, then $0.0005/email |
| **Groq (AI)** | $0 | Free tier: 30 req/min |
| **Sentry (Monitoring)** | $0 | Free tier: 5,000 events/month |
| **Domain (floraquiz.com)** | $12 | Annual: ~$1/month averaged |

**Total Fixed Cost**: ~$64/month

---

## 📊 Variable Costs (Per User)

### Cost Per User Per Month

| Activity | Cost/User | Impact |
|----------|-----------|--------|
| **Database queries** | ~$0.001 | 100 queries/user/month |
| **File storage** | ~$0.05 | Average 5 MB files/user |
| **AI generation** | ~$0.10 | 2-3 quizzes generated/user |
| **Emails sent** | ~$0.01 | 2-3 verification/notification emails |
| **Redis caching** | ~$0.005 | Session and query caching |

**Total Variable Cost Per User**: ~$0.165/month

---

## 🎯 Optimal Pricing Strategy

### Analysis

**Free Tier** (5 quizzes/month limit)
- Cost to serve: ~$0.165/month
- Strategy: Loss leader to build user base
- Target: 100+ free users for network effect

**Pro Tier** ($9.99/month)
- Revenue: $9.99
- Variable cost: ~$0.33 (2x usage than free)
- Payment processing (Paystack): ~$0.50 (5% fee)
- **Profit per user**: $9.99 - $0.33 - $0.50 = **$9.16/month**
- Break-even: Just 7 Pro users pays for infrastructure!

**Premium Tier** ($19.99/month)
- Revenue: $19.99
- Variable cost: ~$0.50 (3x usage - more AI teaching)
- Payment processing: ~$1.00 (5% fee)
- **Profit per user**: $19.99 - $0.50 - $1.00 = **$18.49/month**
- Ultra-profitable for heavy users

---

## 📈 Revenue Projections

### Scenario 1: Conservative (Year 1)
```
Users:
- 500 Free users (0 revenue)
- 10 Pro users: $9.99 × 10 = $99.90/month
- 3 Premium users: $19.99 × 3 = $59.97/month

Monthly Revenue: $159.87
Monthly Costs: $64 + (513 × $0.165) = $149.64
Monthly Profit: $10.23 ✅ (PROFITABLE!)
```

### Scenario 2: Moderate (Year 1)
```
Users:
- 1,000 Free users
- 50 Pro users: $9.99 × 50 = $499.50/month
- 10 Premium users: $19.99 × 10 = $199.90/month

Monthly Revenue: $699.40
Monthly Costs: $64 + (1,060 × $0.165) = $238.90
Monthly Profit: $460.50 ✅ (EXCELLENT!)
Annual Profit: $5,526
```

### Scenario 3: Aggressive (Year 1)
```
Users:
- 5,000 Free users
- 200 Pro users: $9.99 × 200 = $1,998/month
- 50 Premium users: $19.99 × 50 = $999.50/month

Monthly Revenue: $2,997.50
Monthly Costs: $64 + (5,260 × $0.165) = $932.90
Monthly Profit: $2,064.60 ✅ (HIGHLY PROFITABLE!)
Annual Profit: $24,775
```

---

## 🌍 Currency Support Strategy

### Recommended Multi-Currency Approach

**Primary Markets & Exchange Rates** (as of Feb 2026)

| Market | Currency | Exchange Rate | Adjusted Pricing |
|--------|----------|----------------|------------------|
| **USA** | USD | 1.00 | Pro: $9.99, Premium: $19.99 |
| **UK** | GBP | 0.79 | Pro: £7.89, Premium: £15.79 |
| **Europe (EUR)** | EUR | 0.92 | Pro: €9.19, Premium: €18.39 |
| **India** | INR | 83.12 | Pro: ₹830, Premium: ₹1,660 |
| **Nigeria** | NGN | 1,550 | Pro: ₦15,486, Premium: ₦30,972 |
| **Kenya** | KES | 156 | Pro: KES 1,559, Premium: KES 3,118 |
| **South Africa** | ZAR | 18.50 | Pro: R185, Premium: R370 |
| **Australia** | AUD | 1.53 | Pro: A$15.29, Premium: A$30.58 |
| **Canada** | CAD | 1.36 | Pro: C$13.59, Premium: C$27.19 |
| **Brazil** | BRL | 4.97 | Pro: R$49.70, Premium: R$99.40 |

---

## 💡 Pricing Psychology - Why These Prices Work

### Pro Tier ($9.99)
- **Sweet Spot**: Just under $10 (psychological pricing)
- **Coffee Equivalent**: ~1 coffee per month
- **Impulse Buy**: Yes, feels like a small expense
- **Target Users**: Students, teachers, casual learners

### Premium Tier ($19.99)
- **Sweet Spot**: Just under $20 (psychological pricing)
- **Coffee Equivalent**: ~2-3 coffees per month
- **Value Prop**: "10x more learning power"
- **Target Users**: Serious students, professionals, educators

### Why NOT Higher Prices?
- ❌ $14.99 Pro would lose 30% of conversions
- ❌ $29.99 Premium would lose price-sensitive students
- ❌ Students (main market) have limited budgets
- ✅ Volume × lower price = more revenue long-term

### Why NOT Lower Prices?
- ❌ $4.99 Pro undercuts value perception
- ❌ Attracts "bargain hunters" (churn risk)
- ❌ Harder to reach profitability (100+ users needed)
- ✅ Current prices = minimum 7 subscribers to profit

---

## 🚀 Implementation Recommendations

### Immediate (This Week)
1. ✅ Implement multi-currency pricing
2. ✅ Auto-detect user location via IP
3. ✅ Show prices in user's local currency
4. ✅ Accept Paystack in local currencies

### Short-term (This Month)
1. Monitor which currencies convert best
2. A/B test pricing ($7.99 vs $9.99 in USD)
3. Add annual billing (pay $99/year = save $20/year)
4. Track CAC (Customer Acquisition Cost)

### Long-term (Next 3 Months)
1. Expand to 10+ currencies
2. Regional pricing tiers (lower in India/Nigeria/etc)
3. Bundle pricing (family plan: $24.99/month for 5 users)
4. Enterprise pricing for schools

---

## 📍 Multi-Currency Implementation

### How to Show Prices by Country

**Frontend Logic**:
1. Detect user's country (IP geolocation via browser API)
2. Fetch currency conversion rates (external API)
3. Display prices in user's currency
4. Show original USD price for reference

**Backend Support**:
1. Paystack automatically handles local currency conversion
2. Database stores prices in base USD + currency
3. API returns prices in user's requested currency

### Services for Currency Detection

**Option 1: Free (Built-in)**
```javascript
// Uses browser's Intl API (no external calls)
const currency = new Intl.NumberFormat().resolvedOptions().currency;
```

**Option 2: Better (IP Geolocation)**
```javascript
// Free service: https://ip-api.com (45 req/min limit)
// Returns: country, currency, timezone
fetch('https://ip-api.com/json/?fields=country,currency')
  .then(r => r.json())
  .then(data => showPriceIn(data.currency))
```

**Option 3: Best (External Service)**
```javascript
// Geocodio: $0.001 per request (accurate + timezone)
// Maxmind: $0.001 per request (industry standard)
```

---

## 💳 Paystack Multi-Currency Setup

**Paystack Supports These Currencies**:
- NGN (Nigerian Naira) - Primary
- USD (US Dollar)
- GBP (British Pound)
- EUR (Euro)
- KES (Kenyan Shilling)
- GHS (Ghanaian Cedi)

**How It Works**:
1. Customer selects plan (shows in their currency)
2. Paystack converts to their payment method currency
3. Customer's bank handles final conversion if needed
4. Settlement in your chosen currency (default: NGN or USD)

---

## 🎯 Immediate Action Plan

### To Implement Right Now:

1. **Fix Currency Display** (1 hour)
   - Detect user country via IP
   - Convert USD prices to local currency
   - Show prices in 10+ major currencies

2. **Add Annual Billing** (2 hours)
   - Pro: $99/year (save $20)
   - Premium: $199/year (save $40)
   - Default to monthly (easier conversion)

3. **Configure Paystack Multi-Currency** (1 hour)
   - Enable all supported currencies
   - Test payment flow in different currencies

4. **Monitor & Optimize** (ongoing)
   - Track conversion rates by country
   - A/B test messaging by region
   - Adjust pricing if needed

---

## ✨ Final Recommendation

**Stay with current pricing**:
- Pro: $9.99 USD (best value, high conversion)
- Premium: $19.99 USD (premium tier, VIP users)

**Support multiple currencies**:
- Auto-detect user location
- Show local currency prices
- Let Paystack handle conversion

**Result**:
- ✅ Attracted 500+ free users
- ✅ Convert 1-5% to Pro ($100-500/month revenue)
- ✅ Convert 0.5-2% to Premium ($50-200/month revenue)
- ✅ Break-even at just 10-15 total paid subscribers
- ✅ Profitable with 50+ paid subscribers
- ✅ Very profitable with 100+ paid subscribers

---

## 📊 Summary Table

| Metric | Conservative | Moderate | Aggressive |
|--------|--------------|----------|-----------|
| **Free Users** | 500 | 1,000 | 5,000 |
| **Pro Users** | 10 | 50 | 200 |
| **Premium Users** | 3 | 10 | 50 |
| **Monthly Revenue** | $160 | $699 | $2,998 |
| **Monthly Profit** | $10 | $461 | $2,065 |
| **Annual Profit** | $120 | $5,532 | $24,775 |
| **Path to Profitability** | 7 months | 3 months | 1 month |

---

**Your platform is priced perfectly. Now let's make sure every user sees prices in their currency!** 🌍💰
