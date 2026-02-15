# 🚀 FloraQuiz Deployment Checklist

**Start Time**: ___________
**End Time**: ___________
**Status**: 🟢 READY FOR DEPLOYMENT

---

## ✅ PRE-DEPLOYMENT (10 minutes)

### Code Verification
- [x] All changes committed (`git status` clean)
- [x] 10 commits ready to deploy
- [x] Frontend builds successfully (1820 modules)
- [x] Backend syntax validated
- [x] No console errors detected

### Database Preparation
- [ ] Backup current production database (CRITICAL!)
- [ ] Verify DATABASE_URL is set in Render
- [ ] Verify migration file exists: `backend/migrations/002_gamification.sql`
- [ ] Test migration on staging first (if possible)

### Environment Variables Verified
- [ ] `DATABASE_URL` ✓
- [ ] `REDIS_URL` ✓
- [ ] `JWT_SECRET` ✓
- [ ] `GROQ_API_KEY` ✓
- [ ] `PAYSTACK_*_KEY` ✓
- [ ] `R2_*_KEYS` ✓
- [ ] `SENTRY_DSN` ✓
- [ ] `FRONTEND_URL` ✓
- [ ] `BACKEND_URL` ✓

---

## 🗄️ STEP 1: DATABASE MIGRATION (5 minutes)

### Execute Migration
```bash
psql $DATABASE_URL < backend/migrations/002_gamification.sql
```

**Execution Time**: ___________

### Verify Tables Created
```bash
# Run these commands to verify
psql $DATABASE_URL -c "SELECT COUNT(*) FROM achievements;" # Should be 13
psql $DATABASE_URL -c "\dt" | grep gamification # Should show 4 tables
```

**Verification Results**:
- [ ] achievements table has 13 rows
- [ ] user_gamification table exists
- [ ] user_achievements table exists
- [ ] xp_transactions table exists

---

## 🔧 STEP 2: BACKEND DEPLOYMENT (Render) - 5 minutes

### Option A: Git Push (Auto-Deploy)
```bash
cd backend
git push origin master
```
**Pushed at**: ___________

### Option B: Manual Deploy
1. Go to https://dashboard.render.com
2. Select your backend service
3. Click "Settings" → "Deployed"
4. Click "Manual Deploy" → "Deploy latest commit"

**Deployed at**: ___________

### Verify Deployment
```bash
# Check backend is running
curl https://your-backend-url/api/v1/health

# Should return:
# {"status":"ok","timestamp":"2026-02-15T..."}
```

**Health Check Status**: ✅ Passed / ❌ Failed

**If Failed**:
- [ ] Check Render logs for error messages
- [ ] Verify DATABASE_URL is set
- [ ] Verify REDIS_URL is set
- [ ] Check npm dependencies installed

---

## 🎨 STEP 3: FRONTEND DEPLOYMENT (Vercel) - 5 minutes

### Option A: Git Push (Auto-Deploy)
```bash
cd frontend
git push origin master
```
**Pushed at**: ___________

### Option B: Manual Deploy
1. Go to https://vercel.com/dashboard
2. Select your frontend project
3. Go to "Deployments" tab
4. Click "Deploy" if not auto-deploying

**Deployed at**: ___________

### Verify Deployment
1. Visit https://your-frontend-url in browser
2. Open DevTools (F12) → Console tab
3. Should see no red errors

**Verification**:
- [ ] Frontend loads without errors
- [ ] Console shows no red errors
- [ ] No network errors (all 200 status)
- [ ] Page is responsive

**If Failed**:
- [ ] Check Vercel build logs
- [ ] Look for missing dependencies
- [ ] Verify API_URL is correct
- [ ] Check for import errors

---

## 🧪 STEP 4: POST-DEPLOYMENT TESTS (10 minutes)

### 4.1 API Tests
```bash
# Test authentication endpoint
curl -X POST https://your-backend-url/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Should return 401 (invalid) or 200 (if test user exists)
```

Status: ✅ Pass / ❌ Fail

### 4.2 User Flow Test
- [ ] **Sign up**: Create test user at https://your-frontend-url/signup
  - Username: `testuser123`
  - Email: `test@example.com`
  - Password: `TestPass123!`
  - Result: User created ✅ / Error ❌

- [ ] **Check gamification**: Go to Dashboard
  - Should see "Level 1", "0 XP"
  - Result: Gamification initialized ✅ / Missing ❌

- [ ] **Create note**: Click "Notes" → Upload PDF
  - Select any PDF file
  - Result: Note created ✅ / Error ❌

- [ ] **Generate quiz**: Click "Generate Quiz" on note
  - Should show loading skeleton
  - Should display questions
  - Result: Quiz generated ✅ / Error ❌

- [ ] **Submit quiz**: Answer all questions and submit
  - Should see XP notification (bottom right)
  - Should show: "+10 XP"
  - Result: Notification appeared ✅ / Missing ❌

- [ ] **Check XP awarded**: Go back to Dashboard
  - XP should have increased
  - Result: XP updated ✅ / Not updated ❌

### 4.3 Language Test
- [ ] **Switch language**: Click language button in Dashboard
  - Select "Français"
  - Page should change to French
  - Result: Language switched ✅ / Didn't switch ❌

- [ ] **Verify persistence**: Navigate to Quiz page
  - Should still be in Français
  - Result: Language persisted ✅ / Reset to English ❌

### 4.4 Free User Limits Test
- [ ] **Create 4th note**: Try uploading another note
  - Should show "Upgrade to Pro" modal
  - Result: Modal appeared ✅ / Allowed creation ❌

### 4.5 Payment Flow Test
- [ ] **Go to pricing**: Click "Pricing" in navigation
  - Page loads without errors
  - Result: Loads ✅ / Errors ❌

- [ ] **Click upgrade**: Click "Upgrade to Pro"
  - Paystack modal opens (test mode)
  - Result: Modal opens ✅ / Doesn't open ❌

---

## 📊 STEP 5: MONITORING (5 minutes)

### Sentry Dashboard
Go to https://sentry.io/organizations/your-org/issues/

**Verification**:
- [ ] No critical errors
- [ ] Error count = 0 or < 5
- [ ] Recent errors match expected (if any)

**Status**: 🟢 Healthy / 🟡 Warning / 🔴 Critical

### Render Logs
Go to https://dashboard.render.com → Select backend → "Logs"

**Verification**:
- [ ] Server started successfully
- [ ] No error messages
- [ ] Database connected
- [ ] Redis connected

**Status**: 🟢 Healthy / 🟡 Warning / 🔴 Critical

### Vercel Logs
Go to https://vercel.com/dashboard → Select project → Latest deployment

**Verification**:
- [ ] Build completed successfully
- [ ] No build errors
- [ ] No warnings (or only expected warnings)

**Status**: 🟢 Healthy / 🟡 Warning / 🔴 Critical

### Performance Check
```bash
# Run Lighthouse audit
1. Go to https://your-frontend-url
2. Press F12 → Lighthouse tab
3. Click "Analyze page load"
4. Expected score: >80
```

**Lighthouse Score**: __________ / 100

---

## 🎯 DEPLOYMENT SUCCESS CRITERIA

All items must be ✅ to consider deployment successful:

- [ ] Database migration completed (13 achievements)
- [ ] Backend health check returns 200
- [ ] Frontend loads without console errors
- [ ] User signup initializes gamification
- [ ] Quiz submission awards XP and shows notification
- [ ] Language switching works and persists
- [ ] Free user upgrade modal appears at limit
- [ ] No critical errors in Sentry
- [ ] Render logs show healthy status
- [ ] Vercel logs show successful build
- [ ] Lighthouse score > 80

---

## 🔄 ROLLBACK PROCEDURE (If Needed)

### Quick Rollback
1. **Backend (Render)**:
   - Go to Render dashboard
   - Click service → Deployments
   - Click previous deployment → "Redeploy"

2. **Frontend (Vercel)**:
   - Go to Vercel dashboard
   - Click project → Deployments
   - Click previous deployment → "Redeploy"

**Rollback Time**: ~5 minutes

### Git Rollback (If needed)
```bash
# Revert to previous commit
git revert HEAD
git push origin master

# Watch deployments rebuild with previous version
```

---

## 📝 NOTES & ISSUES

### Issues Encountered:
(List any problems and how they were resolved)

1. _______________________________________________
   Solution: _______________________________________________

2. _______________________________________________
   Solution: _______________________________________________

### Post-Deployment Notes:
_______________________________________________
_______________________________________________
_______________________________________________

---

## ✅ FINAL SIGN-OFF

- **Deployment Date**: ___________
- **Deployed By**: ___________
- **Verified By**: ___________
- **Status**: 🟢 SUCCESSFUL / 🟡 PARTIAL / 🔴 FAILED

### Comments:
_______________________________________________
_______________________________________________
_______________________________________________

---

## 📊 DEPLOYMENT SUMMARY

| Component | Status | Deployed At |
|-----------|--------|-------------|
| Database Migration | ✅ / ❌ | ___________ |
| Backend (Render) | ✅ / ❌ | ___________ |
| Frontend (Vercel) | ✅ / ❌ | ___________ |
| Health Checks | ✅ / ❌ | ___________ |
| Feature Tests | ✅ / ❌ | ___________ |
| Monitoring | ✅ / ❌ | ___________ |

**Overall Status**: 🟢 DEPLOYED / 🟡 DEPLOYED WITH ISSUES / 🔴 FAILED

---

## 🎉 YOU'RE LIVE!

Your FloraQuiz platform is now in production serving real users.

**Next Steps**:
1. Monitor Sentry for the next 24 hours
2. Check logs daily for first week
3. Gather user feedback
4. Plan next features
5. Celebrate! 🎊

---

**Deployment Guide Version**: 1.0
**Date Created**: February 15, 2026
**Last Updated**: February 15, 2026
