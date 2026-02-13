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
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GROQ_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://username:password@host/database
REDIS_URL=redis://default:password@host:6379
R2_ACCOUNT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_ACCESS_KEY_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
R2_BUCKET_NAME=floraquiz-access-token
R2_PUBLIC_URL=https://storage.floraquiz.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
FROM_EMAIL=your-email@resend.dev
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxxxxxxxxx
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
