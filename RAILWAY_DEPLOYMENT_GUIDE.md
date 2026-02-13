# Railway Backend Deployment Guide

## ✅ Prerequisites Done
- ✅ Code pushed to GitHub: https://github.com/JohnProgrammin/quiz-platform
- ✅ Dockerfile created (`Dockerfile`)
- ✅ railway.json created (`railway.json`)
- ✅ All environment variables configured in `backend/.env`

## 🚀 Deploy to Railway (3 Steps)

### Step 1: Connect GitHub to Railway
1. Go to https://railway.app/login
2. Sign in (create account if needed)
3. Click **New Project** → **Deploy from GitHub repo**
4. Select: `JohnProgrammin/quiz-platform`
5. Authorize Railway to access your GitHub

### Step 2: Add Environment Variables
Once the project is created in Railway:
1. Go to **Settings** → **Variables**
2. Copy-paste these 14 environment variables from your `backend/.env`:

```
NODE_ENV=production
PORT=8080
FRONTEND_URL=https://floraquiz.com
BACKEND_URL=<RAILWAY_URL_WILL_BE_HERE>
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

### Step 3: Deploy & Get URL
1. Railway will automatically detect `Dockerfile` and `railway.json`
2. Click **Deploy** - wait ~2-3 minutes
3. Once deployed, go to **Settings** → **Domains**
4. Copy your Railway URL (looks like: `https://quiz-platform-prod.railway.app`)

## 🔗 Connect Backend to Frontend

After Railway deployment, you'll have a URL like:
```
https://quiz-platform-prod.railway.app
```

### Update Vercel Environment Variables:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://quiz-platform-prod.railway.app`
   - **Environments**: Production

3. Click **Save** and **Redeploy** from Deployments tab

## ✅ Testing Checklist

After both are deployed:
1. **Frontend**: Visit https://floraquiz.com
2. **Sign Up**: Create a test account
3. **Upload Notes**: Test file upload feature
4. **Create Quiz**: Generate a quiz from notes
5. **Submit Quiz**: Test quiz submission
6. **Payment**: Test Paystack payment (use test card if available)
7. **Errors**: Check Sentry for any issues

## 🆘 Troubleshooting

**Database Connection Error?**
- Verify `DATABASE_URL` is correct in Railway variables
- Check Neon console for active connections

**File Upload Fails?**
- Check `R2_*` variables are correct
- Verify Cloudflare R2 bucket exists

**Paystack Errors?**
- Verify `PAYSTACK_SECRET_KEY` in Railway variables
- Check Paystack dashboard for transaction logs

**Backend Won't Start?**
- Check Railway **Logs** tab for error details
- Verify `node backend/server.js` runs locally first

## 📋 URLs Summary
- **GitHub**: https://github.com/JohnProgrammin/quiz-platform
- **Frontend**: https://floraquiz.com (Vercel)
- **Backend**: [To be updated after Railway deployment]
- **Database**: Neon PostgreSQL
- **Cache**: Upstash Redis
- **Storage**: Cloudflare R2
- **Monitoring**: Sentry

## ✨ Done!
Your production deployment is ready. After these steps, FloraQuiz will be 100% live with thousands of users ready to use it! 🎉
