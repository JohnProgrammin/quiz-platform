# 🔧 Complete Environment Variables Guide

## 📦 WHAT YOU HAVE (Your Actual Values)

Your Render Backend URL: `https://quiz-platform-eseq.onrender.com`
Your Vercel Frontend URL: `https://floraquiz-epozak9om-okafor-johns-projects.vercel.app`
Your Supabase Project: `https://oxbjguswfijanmzxbrd.supabase.co`

---

## 1️⃣ LOCAL DEVELOPMENT: `backend/.env`

These are what should be in your `backend/.env` file (for LOCAL development only):

```
# Application
NODE_ENV=production
PORT=3001

# URLs (LOCAL - for development)
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001

# Database - Supabase (from your Supabase dashboard)
SUPABASE_URL=https://oxbjguswfijanmzxbrd.supabase.co
SUPABASE_ANON_KEY=<copy from Supabase dashboard>
SUPABASE_SERVICE_ROLE_KEY=<copy from Supabase dashboard>

# Authentication
JWT_SECRET=<your jwt secret>
JWT_EXPIRES_IN=7d

# AI / Groq (from your Groq account)
GROQ_API_KEY=<your groq api key>

# File Storage - Cloudflare R2 (from your R2 dashboard)
R2_ACCOUNT_ID=<your account id>
R2_ACCESS_KEY_ID=<your access key>
R2_SECRET_ACCESS_KEY=<your secret key>
R2_BUCKET_NAME=floraquiz-access-token
R2_PUBLIC_URL=https://storage.floraquiz.com

# Payment - Paystack (from your Paystack account)
PAYSTACK_SECRET_KEY=<your paystack secret key>
PAYSTACK_PUBLIC_KEY=<your paystack public key>

# Email - Resend (from your Resend account)
RESEND_API_KEY=<your resend api key>
FROM_EMAIL=onboarding@resend.dev

# Monitoring - Sentry (from your Sentry project)
SENTRY_DSN=<your sentry dsn>

# Logging
LOG_LEVEL=info
```

---

## 2️⃣ LOCAL DEVELOPMENT: `frontend/.env`

These are what should be in your `frontend/.env` file (for LOCAL development only):

```
# API
VITE_API_URL=http://localhost:3001/api

# Payment - Paystack
VITE_PAYSTACK_PUBLIC_KEY=pk_test_6d3d4ea0dae07ad7d08a4bee7e4d512e1cb34416

# Database - Supabase
VITE_SUPABASE_URL=https://oxbjguswfijanmzxbrd.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_jJ6v29Kz-fvGTcBfc234TQ_KNAEKVoy

# Error Tracking - Sentry
VITE_SENTRY_DSN=https://c2d1ff9ae1f35e5f2f6fb254e6715558@o451087347639910.ingest.de.sentry.io/4510873522536528
```

---

## 3️⃣ VERCEL (Production Frontend)

**Go to:** Vercel Dashboard → `quiz-platform` → Settings → Environment Variables

**Add these 4 variables for PRODUCTION:**

```
VITE_API_URL
https://quiz-platform-eseq.onrender.com/api

VITE_PAYSTACK_PUBLIC_KEY
pk_test_6d3d4ea0dae07ad7d08a4bee7e4d512e1cb34416

VITE_SUPABASE_URL
https://oxbjguswfijanmzxbrd.supabase.co

VITE_SUPABASE_ANON_KEY
sb_publishable_jJ6v29Kz-fvGTcBfc234TQ_KNAEKVoy
```

**After adding:**
1. Go to Deployments tab
2. Click ... on latest deployment
3. Select "Redeploy"
4. Wait for "Ready" status

---

## 4️⃣ RENDER (Production Backend)

**Go to:** Render Dashboard → `quiz-platform-backend` → Settings → Environment

**Add/Update these 8 variables for PRODUCTION:**

```
SUPABASE_URL
https://oxbjguswfijanmzxbrd.supabase.co

SUPABASE_ANON_KEY
<copy from your backend/.env>

SUPABASE_SERVICE_ROLE_KEY
<copy from your backend/.env>

FRONTEND_URL
https://floraquiz-epozak9om-okafor-johns-projects.vercel.app

BACKEND_URL
https://quiz-platform-eseq.onrender.com

GROQ_API_KEY
<copy from your backend/.env>

PAYSTACK_SECRET_KEY
<copy from your backend/.env>

JWT_SECRET
<copy from your backend/.env>
```

**After adding:**
1. Click "Save Changes"
2. Wait for redeploy (check logs for "Listening on port 3001")

---

## ✅ CHECKLIST

### Local Development (laptop)
- [ ] `backend/.env` has all variables above
- [ ] `frontend/.env` has all variables above
- [ ] `npm start` works locally
- [ ] Can sign up/login locally

### Production (Vercel + Render)
- [ ] Vercel has 4 variables ✅
- [ ] Render has 8 variables ✅
- [ ] Both are redeployed ✅
- [ ] Can sign up/login on production ✅

---

## 🎯 TO FIX SIGN IN/UP NOW:

1. **Render Backend:** Make sure these 8 variables are set (especially the 3 Supabase ones)
2. **Vercel Frontend:** Already correct (you confirmed VITE_API_URL is set)
3. **Render redeploy:** After adding variables, it should redeploy automatically
4. **Test:** Try signing up again

---

## 💡 KEY DIFFERENCES

| Context | FRONTEND_URL | BACKEND_URL | VITE_API_URL |
|---------|--------------|-------------|--------------|
| **Local Dev** | `http://localhost:3000` | `http://localhost:3001` | `http://localhost:3001/api` |
| **Production** | `https://floraquiz-epozak9om-okafor-johns-projects.vercel.app` | `https://quiz-platform-eseq.onrender.com` | `https://quiz-platform-eseq.onrender.com/api` |

---

**That's it!** Use this as your single source of truth for all environment variables. 🎉
