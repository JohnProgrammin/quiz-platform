# ✅ Verify Your Vercel Environment Variables

Based on your screenshot, check if these **CRITICAL** variables are set:

## 🔴 MUST HAVE (for auth to work):

- [ ] `VITE_API_URL` = `https://quiz-platform-eseq.onrender.com/api`
- [ ] `VITE_SUPABASE_URL` = (should be in your list)
- [ ] `VITE_SUPABASE_ANON_KEY` = (should be in your list)
- [ ] `VITE_PAYSTACK_PUBLIC_KEY` = (should be in your list)

## 🟡 OPTIONAL (but good to have):

- [ ] `SENTRY_DSN`
- [ ] `VITE_APP_ENV` = `production`

---

## 🚨 IF `VITE_API_URL` IS MISSING:

1. Go to Vercel Dashboard → quiz-platform → Settings → Environment Variables
2. Click **"Add New"**
3. Name: `VITE_API_URL`
4. Value: `https://quiz-platform-eseq.onrender.com/api`
5. Environments: Select **Production** ✓
6. Click **Save**
7. **Redeploy** (Deployments → click ... on latest → Redeploy)

---

## 🚨 IF `VITE_API_URL` VALUE IS WRONG:

Check what value it has:
- ❌ `http://localhost:3001/api` (LOCAL - WRONG!)
- ❌ `undefined` or empty (MISSING - WRONG!)
- ✅ `https://quiz-platform-eseq.onrender.com/api` (CORRECT!)

**If it's wrong:**
1. Click the variable to edit it
2. Change value to: `https://quiz-platform-eseq.onrender.com/api`
3. Click **Save**
4. **Redeploy** (Deployments → click ... on latest → Redeploy)

---

## ✅ After fixing:

1. Wait for deployment to say **"Ready"** (2-3 minutes)
2. Visit: https://floraquiz-epozak9om-okafor-johns-projects.vercel.app
3. Try to Sign Up
4. If still fails, share the console error (F12 → Console)

---

**Share a screenshot showing:**
- [ ] `VITE_API_URL` variable and its value
- Or confirm it's missing
