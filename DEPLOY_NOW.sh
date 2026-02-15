#!/bin/bash

# FloraQuiz Production Deployment Script
# Automated deployment to Vercel (frontend) + Render (backend) + Neon (database)
# Usage: bash DEPLOY_NOW.sh

set -e

echo "🚀 FloraQuiz Production Deployment"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify git status
echo -e "${BLUE}Step 1: Verifying git status...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${RED}❌ Error: Uncommitted changes found. Please commit first.${NC}"
    git status
    exit 1
fi
echo -e "${GREEN}✓ Git clean - all changes committed${NC}"
echo ""

# Step 2: Verify builds
echo -e "${BLUE}Step 2: Verifying frontend build...${NC}"
cd frontend
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 3: Push to repository
echo -e "${BLUE}Step 3: Pushing to repository...${NC}"
echo -e "${YELLOW}Note: Make sure you have git remote configured!${NC}"
echo ""
echo "Your commits to push:"
git log origin/master..HEAD --oneline
echo ""
read -p "Ready to push? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin master
    echo -e "${GREEN}✓ Pushed to repository${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped git push${NC}"
fi
echo ""

# Step 4: Database migration instructions
echo -e "${BLUE}Step 4: Database Migration Instructions${NC}"
echo -e "${YELLOW}IMPORTANT: Run this on your production database!${NC}"
echo ""
echo "Execute this command in your terminal:"
echo ""
echo -e "${GREEN}psql \$DATABASE_URL < backend/migrations/002_gamification.sql${NC}"
echo ""
echo "To verify tables were created:"
echo -e "${GREEN}psql \$DATABASE_URL -c \"SELECT COUNT(*) FROM achievements;\"${NC}"
echo ""
read -p "Press enter when database migration is complete..."
echo -e "${GREEN}✓ Database migration acknowledged${NC}"
echo ""

# Step 5: Backend deployment
echo -e "${BLUE}Step 5: Backend Deployment (Render)${NC}"
echo -e "${YELLOW}Follow these steps in your Render dashboard:${NC}"
echo "1. Go to https://dashboard.render.com"
echo "2. Select your backend service"
echo "3. Click 'Settings' → 'Deployed'"
echo "4. Click 'Manual Deploy' → 'Deploy latest commit'"
echo "5. Wait for build to complete (watch logs for errors)"
echo ""
echo "Or if auto-deploy is enabled, just push and watch:"
echo -e "${GREEN}git push origin master${NC}"
echo ""
read -p "Press enter when backend deployment is complete..."
echo -e "${GREEN}✓ Backend deployment acknowledged${NC}"
echo ""

# Step 6: Frontend deployment
echo -e "${BLUE}Step 6: Frontend Deployment (Vercel)${NC}"
echo -e "${YELLOW}Follow these steps in your Vercel dashboard:${NC}"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your frontend project"
echo "3. Go to 'Deployments' tab"
echo "4. Click 'Deploy' (if not auto-deploying)"
echo "5. Wait for build to complete"
echo ""
echo "Or if auto-deploy is enabled, just push and watch"
echo ""
read -p "Press enter when frontend deployment is complete..."
echo -e "${GREEN}✓ Frontend deployment acknowledged${NC}"
echo ""

# Step 7: Verification
echo -e "${BLUE}Step 7: Post-Deployment Verification${NC}"
echo ""
echo "✅ Checklist:"
echo "  [ ] Backend health check: curl https://your-backend-url/api/v1/health"
echo "  [ ] Frontend loads: https://your-frontend-url"
echo "  [ ] Sign up creates test user"
echo "  [ ] Dashboard shows gamification (Level 1, 0 XP)"
echo "  [ ] Create note and generate quiz"
echo "  [ ] Submit quiz and see XP notification"
echo "  [ ] Switch language in dashboard (should persist)"
echo "  [ ] Check Sentry for errors: https://sentry.io"
echo ""
read -p "Press enter when verification is complete..."
echo -e "${GREEN}✓ Post-deployment verification acknowledged${NC}"
echo ""

# Final status
echo -e "${GREEN}═════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE! 🎉${NC}"
echo -e "${GREEN}═════════════════════════════════════${NC}"
echo ""
echo "Your platform is now live in production!"
echo ""
echo "Next steps:"
echo "  1. Monitor Sentry dashboard for errors"
echo "  2. Check Render logs for backend issues"
echo "  3. Verify payment flow with Paystack"
echo "  4. Test with real users"
echo ""
echo "Git commits deployed:"
git log origin/master..@{-1} --oneline || echo "Check your deployment dashboard for details"
echo ""
echo "Happy launching! 🚀"
