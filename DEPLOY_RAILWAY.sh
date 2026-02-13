#!/bin/bash

# Railway Backend Deployment Script
# This script automates the Railway deployment process

echo "🚀 FloraQuiz Backend Deployment to Railway"
echo "==========================================="
echo ""

# Step 1: Login
echo "Step 1: Login to Railway..."
echo "📌 Please authenticate when the browser opens"
railway login

# Step 2: Create/connect project
echo ""
echo "Step 2: Setting up project..."
railway up --name quiz-platform-prod --service backend

# Step 3: Add environment variables
echo ""
echo "Step 3: Adding environment variables..."
railway variables set NODE_ENV=production
railway variables set PORT=8080
railway variables set FRONTEND_URL=https://floraquiz.com
railway variables set JWT_SECRET=qp_s3cur3_jwt_k3y_2024_r4nd0m_str1ng_x7k9m2
railway variables set GROQ_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set DATABASE_URL="postgresql://neondb_owner:npg_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@ep-shiny-snow-aixq0e1a-pooler.c-4.us-east-1.aws.neon.tech/floraquiz?sslmode=require&channel_binding=require"
railway variables set REDIS_URL="redis://default:Acx3AAIncDJlZWQ3NzNjMGY4MTM0NTAyYTQxNDE1ZWJmYzZkZjkzM3AyNTIzNDM@saved-heron-52343.upstash.io:6379"
railway variables set R2_ACCOUNT_ID=4c3d190efbc88d52da77158fc8fa0689
railway variables set R2_ACCESS_KEY_ID=b85b33e4223b0056defb72a9950f3278
railway variables set R2_SECRET_ACCESS_KEY=981446f2b3fec5acd469422919cc1d0ea0de5596910cf307b755e8e245e7a4e0
railway variables set PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set R2_BUCKET_NAME=floraquiz-access-token
railway variables set R2_PUBLIC_URL=https://storage.floraquiz.com
railway variables set RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
railway variables set FROM_EMAIL=onboarding@resend.dev
railway variables set SENTRY_DSN="https://c2d1ff9ae1f35e5f2f6fb254e6715558@o451087347639910.ingest.de.sentry.io/4510873522536528"
railway variables set LOG_LEVEL=info

# Step 4: Deploy
echo ""
echo "Step 4: Deploying to Railway..."
railway up

# Step 5: Get URL
echo ""
echo "✅ Deployment complete!"
echo "🔗 Your Railway URL:"
railway variables get RAILWAY_PUBLIC_DOMAIN

echo ""
echo "📝 Copy the URL above and add it to Vercel as VITE_API_BASE_URL"
