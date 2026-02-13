# 🚀 Deploy to Vercel - Step by Step (No GitHub)

**Time Required**: ~10 minutes
**What You Need**: Vercel account (free), your environment variables

---

## Step 1: Install Vercel CLI (1 minute)

### On Windows PowerShell or Command Prompt:
```bash
npm install -g vercel
```

### Verify Installation:
```bash
vercel --version
```

---

## Step 2: Deploy Your Project (3 minutes)

### Navigate to Your Project:
```bash
cd c:\Users\HP\Documents\quiz-platform
```

### Start Deployment:
```bash
vercel
```

You'll be asked these questions:

| Question | Answer |
|----------|--------|
| "Set up and deploy ~/quiz-platform?" | `y` (yes) |
| "Which scope?" | Select your Vercel account |
| "Link to existing project?" | `n` (no - this is new) |
| "Project name?" | `quiz-platform` |
| "In which directory is your code?" | `./` (current directory) |
| "Override detected settings?" | `N` (no) |

**Expected Output:**
```
✅ Created verified domain floraquiz-xyz.vercel.app
🔗 https://floraquiz-xyz.vercel.app
```

**Save this URL!** You'll need it next.

---

## Step 3: Add Environment Variables (3 minutes)

### Go to Vercel Dashboard:
1. Open https://vercel.com/dashboard
2. Click your new project: `quiz-platform`
3. Go to **Settings** → **Environment Variables**

### Add These 10 Variables:

```
DATABASE_URL = postgresql://neondb_owner:npg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...@ep-shiny-snow-...
JWT_SECRET = (your-jwt-secret-key)
GROQ_API_KEY = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
REDIS_URL = redis://default:...@saved-heron-52343.upstash.io:6379
PAYSTACK_SECRET_KEY = sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
R2_ACCOUNT_ID = (your-r2-account-id)
R2_ACCESS_KEY_ID = (your-r2-access-key)
R2_SECRET_ACCESS_KEY = (your-r2-secret)
SENDGRID_API_KEY = (your-sendgrid-key)
SENTRY_DSN = https://...@....ingest.sentry.io/...
```

### Click "Save"

---

## Step 4: Redeploy (1 minute)

After adding environment variables, go back to:
**Deployments** → Click the latest deployment → **Redeploy**

This will deploy with all your environment variables in place.

---

## Step 5: Verify It Works (2 minutes)

### Check Your Site:
1. Click the deployment URL (or go to https://quiz-platform-xyz.vercel.app)
2. Try to **Sign Up** with test account
3. You should see the login form
4. Check that no errors appear (look at browser console)

### Check Database Setup:
Run this in your terminal to initialize the database:
```bash
cd backend
node create_tables.js
```

Wait for it to complete. You should see:
```
✅ Users table created
✅ All tables created successfully!
✅ All indexes created successfully!
```

---

## Step 6: Set Custom Domain (Optional - 5 minutes)

If you have a custom domain:

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your custom domain (e.g., floraquiz.com)
3. Follow instructions to update DNS
4. Update environment variables:
   - `FRONTEND_URL = https://floraquiz.com`
   - `BACKEND_URL = https://floraquiz.com/api`

---

## 🎉 You're Live!

Your site is now live on Vercel!

### Next Steps:
1. ✅ Share the URL with users
2. ✅ Monitor errors on Sentry dashboard
3. ✅ Check analytics on Vercel dashboard
4. ✅ Test all features (signup, quiz, payment)

### If Something Goes Wrong:

**"Environment variables not loading"**
→ Did you redeploy after adding env vars? Check Deployments page.

**"Database connection error"**
→ Run `node backend/create_tables.js` to initialize

**"Quiz generation returns blank"**
→ Check GROQ_API_KEY is correct in Vercel env vars

**"Payment not working"**
→ Verify PAYSTACK_SECRET_KEY in Vercel env vars

---

## 📊 Monitoring

### Must-Have Dashboards:
1. **Vercel** - https://vercel.com/dashboard (uptime, analytics)
2. **Sentry** - https://sentry.io (errors)
3. **Neon** - https://console.neon.tech (database)
4. **Upstash** - https://console.upstash.com (cache)

---

## ✅ Production Checklist

After deployment:
- [ ] Site loads without errors
- [ ] Login/signup works
- [ ] Quiz generation works
- [ ] Payment flow tested
- [ ] Emails are being sent
- [ ] Errors appear in Sentry
- [ ] Google can find your site (robots.txt)

---

## 🎊 Done!

Your FloraQuiz platform is now live on Vercel serving real users!

**You can push to GitHub later anytime if you want version control.**

---

## Need Help?

Check these files for more info:
- `QUICK_START_DEPLOY.md` - Quick reference
- `PRODUCTION_CHECKLIST.md` - Full checklist
- `PRODUCTION_READY_SUMMARY.md` - Technical details
