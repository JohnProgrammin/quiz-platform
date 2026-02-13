# Render Backend Deployment Guide

## ✅ Prerequisites Done
- ✅ Code pushed to GitHub: https://github.com/JohnProgrammin/quiz-platform
- ✅ Dockerfile created (`Dockerfile`)
- ✅ All environment variables configured in `backend/.env`
- ✅ Backend syntax validated

---

## 🚀 Deploy to Render (3 Steps)

### Step 1: Connect GitHub to Render
1. Go to https://render.com
2. Sign up with GitHub (or login if you have account)
3. Click **New +** → **Web Service**
4. Click **Connect Repository**
5. Select: `JohnProgrammin/quiz-platform`
6. Click **Connect**

### Step 2: Configure Service
On the deployment form, fill in:

| Field | Value |
|-------|-------|
| **Name** | `quiz-platform-backend` |
| **Environment** | `Docker` |
| **Region** | `Oregon (us-west)` |
| **Branch** | `master` |

Leave other options as default.

### Step 3: Add Environment Variables
1. Scroll down to **Environment Variables**
2. Click **Add Environment Variable**
3. Copy-paste all 14 variables from your `backend/.env`:

```
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://floraquiz.com
BACKEND_URL=<RENDER_URL_WILL_BE_HERE>
JWT_SECRET=qp_s3cur3_jwt_k3y_2024_r4nd0m_str1ng_x7k9m2
GROQ_API_KEY=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
DATABASE_URL=postgresql://neondb_owner:npg_2PMFJ4KOcHrp@ep-shiny-snow-aixq0e1a-pooler.c-4.us-east-1.aws.neon.tech/floraquiz?sslmode=require&channel_binding=require
REDIS_URL=redis://default:Acx3AAIncDJlZWQ3NzNjMGY4MTM0NTAyYTQxNDE1ZWJmYzZkZjkzM3AyNTIzNDM@saved-heron-52343.upstash.io:6379
R2_ACCOUNT_ID=4c3d190efbc88d52da77158fc8fa0689
R2_ACCESS_KEY_ID=b85b33e4223b0056defb72a9950f3278
R2_SECRET_ACCESS_KEY=981446f2b3fec5acd469422919cc1d0ea0de5596910cf307b755e8e245e7a4e0
PAYSTACK_SECRET_KEY=sk_live_c732aee2f3235473fe037d1328c651d315684eb8
PAYSTACK_PUBLIC_KEY=pk_live_ef1f90bb45b428cdb1fc3eb2c0fc6c8ccd173fe8
R2_BUCKET_NAME=floraquiz-access-token
R2_PUBLIC_URL=https://storage.floraquiz.com
RESEND_API_KEY=re_7yNA7T4t_E7xy7GTYVwfMN3VXUg1bvNHj
FROM_EMAIL=onboarding@resend.dev
SENTRY_DSN=https://c2d1ff9ae1f35e5f2f6fb254e6715558@o451087347639910.ingest.de.sentry.io/4510873522536528
LOG_LEVEL=info
```

### Step 4: Deploy
1. Click **Create Web Service**
2. Render will automatically:
   - Detect your Dockerfile
   - Build the Docker image
   - Deploy to their servers
   - Give you a public URL

This takes **2-3 minutes**.

---

## 🔗 Connect Backend to Frontend

Once deployed, you'll get a URL like:
```
https://quiz-platform-backend.onrender.com
```

### Update Vercel Environment Variables:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **quiz-platform** project
3. Settings → **Environment Variables**
4. Add/Update:
   ```
   Name: VITE_API_BASE_URL
   Value: https://quiz-platform-backend.onrender.com
   Environments: Production
   ```
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **⋮** menu on your latest deployment
8. Click **Redeploy**

---

## ✅ Testing Checklist

After both are deployed:

1. **Frontend**: Visit https://floraquiz.com
2. **Sign Up**: Create a test account
3. **Upload Notes**: Test file upload feature
4. **Create Quiz**: Generate a quiz from notes
5. **Submit Quiz**: Test quiz submission
6. **Payment**: Test Paystack payment
7. **Check Errors**: Monitor Sentry dashboard

---

## 🆘 Troubleshooting

**Backend shows "503 Service Unavailable"?**
- Wait 3-5 minutes for deployment to fully complete
- Check Render **Logs** tab for errors

**"Cannot connect to database"?**
- Verify `DATABASE_URL` is correct in Render env vars
- Check Neon console for active connections

**File upload fails?**
- Verify R2 credentials are correct
- Check Cloudflare R2 bucket exists

**Quiz generation fails?**
- Check `GROQ_API_KEY` is valid
- Verify Groq API hasn't hit rate limits

**Payment processing fails?**
- Verify `PAYSTACK_SECRET_KEY` in Render env vars
- Check Paystack dashboard

---

## 📊 Render Dashboard

After deployment, you can:
- **View Logs**: Click service → **Logs** tab
- **Monitor Performance**: Click service → **Metrics** tab
- **Manage Environment**: Click service → **Environment** tab
- **View Deployments**: Click service → **Deployments** tab

---

## 🔄 Auto-Redeploy on Push

Render automatically redeploys whenever you push to GitHub `master` branch. No extra setup needed!

---

## 📋 Final URLs

| Service | URL |
|---------|-----|
| Frontend | https://floraquiz.com |
| Backend API | https://quiz-platform-backend.onrender.com |
| Database | Neon PostgreSQL |
| Cache | Upstash Redis |
| Storage | Cloudflare R2 |
| Monitoring | Sentry |

---

## ✨ Done!

Your production deployment is ready. Your FloraQuiz platform will be live with real users! 🎉

**Estimated time**: 5-10 minutes for deployment + 2 minutes to update Vercel = ~15 minutes total to go fully live.
