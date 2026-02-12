#!/bin/bash

# FloraQuiz - Direct Vercel Deployment Script
# No GitHub required - deploy directly from your machine

echo "════════════════════════════════════════════════════════════════"
echo "🚀 FloraQuiz - Direct Vercel Deployment"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check Node.js
echo "✅ Checking Node.js..."
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Please install it first."
  exit 1
fi
echo "   Node.js: $(node --version)"
npm --version > /dev/null
echo "   npm: $(npm --version)"

# Step 2: Install Vercel CLI
echo ""
echo "✅ Installing Vercel CLI..."
npm install -g vercel

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "🎯 Next Steps:"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Run this command to start deployment:"
echo ""
echo "   vercel"
echo ""
echo "2. When prompted:"
echo "   • Login with your Vercel account (or create one)"
echo "   • Project name: quiz-platform"
echo "   • Framework: Vite"
echo "   • Root directory: ./ (current)"
echo "   • Build command: cd frontend && npm run build"
echo "   • Output directory: frontend/dist"
echo ""
echo "3. After deployment, you'll get a URL"
echo ""
echo "4. Go to Vercel dashboard and add these environment variables:"
echo "   DATABASE_URL"
echo "   JWT_SECRET"
echo "   GROQ_API_KEY"
echo "   REDIS_URL"
echo "   PAYSTACK_SECRET_KEY"
echo "   R2_ACCOUNT_ID"
echo "   R2_ACCESS_KEY_ID"
echo "   R2_SECRET_ACCESS_KEY"
echo "   SENDGRID_API_KEY"
echo "   SENTRY_DSN"
echo ""
echo "5. Redeploy after adding environment variables"
echo ""
echo "════════════════════════════════════════════════════════════════"
