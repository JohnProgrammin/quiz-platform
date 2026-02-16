# 🚀 Your FloraQuiz Setup Guide

**Your URLs:**
- 🌐 Frontend: `https://floraquiz-epozak9om-okafor-johns-projects.vercel.app`
- 🔌 Backend: `https://quiz-platform-eseq.onrender.com`
- 🗄️ Database: `https://oxbjguswfijanmzxbrd.supabase.co`

---

## ✅ STEP 1: Configure Vercel (5 minutes)

**Go to:** https://vercel.com/dashboard

1. Click `quiz-platform` project
2. Go to **Settings** (top menu)
3. Click **Environment Variables** (left sidebar)
4. Click **"Add New"** and add these 4 variables:

### Variable 1: API URL
```
Name:  VITE_API_URL
Value: https://quiz-platform-eseq.onrender.com/api
```
Select: **Production** ✓ (and Development if you want)
Click **Save**

### Variable 2: Paystack Public Key
```
Name:  VITE_PAYSTACK_PUBLIC_KEY
Value: <copy from your frontend/.env>
```
Select: **Production** ✓
Click **Save**

### Variable 3: Supabase URL
```
Name:  VITE_SUPABASE_URL
Value: <copy from your frontend/.env>
```
Select: **Production** ✓
Click **Save**

### Variable 4: Supabase Key
```
Name:  VITE_SUPABASE_ANON_KEY
Value: <copy from your frontend/.env>
```
Select: **Production** ✓
Click **Save**

### ⚡ After Adding All 4:
1. Go to **Deployments** tab
2. Find your latest deployment
3. Click the **"..."** menu
4. Select **Redeploy**
5. ⏳ Wait for it to say "Ready" (2-3 minutes)

---

## ✅ STEP 2: Configure Render Backend (5 minutes)

**Go to:** https://dashboard.render.com

1. Click `quiz-platform-backend` service
2. Go to **Settings** (top menu)
3. Scroll to **Environment** section
4. Add these variables:

### Variable 1: Supabase URL
```
SUPABASE_URL = <copy from your backend/.env>
```

### Variable 2: Supabase Anon Key
```
SUPABASE_ANON_KEY = <copy from your backend/.env>
```

### Variable 3: Supabase Service Role Key
```
SUPABASE_SERVICE_ROLE_KEY = <copy from your backend/.env>
```

### Variable 4: Frontend URL
```
FRONTEND_URL = https://floraquiz-epozak9om-okafor-johns-projects.vercel.app
```

### Variable 5: Backend URL
```
BACKEND_URL = https://quiz-platform-eseq.onrender.com
```

### ⚡ After Adding All 5:
1. Click **Save Changes**
2. ⏳ Wait for service to redeploy (2-3 minutes)
3. Check logs - should show "Listening on port 3001"

---

## ✅ STEP 3: Test Authentication (2 minutes)

### Test Sign Up:

1. **Open** https://floraquiz-epozak9om-okafor-johns-projects.vercel.app
2. **Open DevTools:** Press `F12`
3. **Go to Console tab** (where errors show)
4. **Click "Sign Up"** button
5. **Fill in form:**
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test@1234`
6. **Click "Create Account"**

### ✅ If it works:
- Console shows no red errors
- Page redirects to **Dashboard**
- You see your XP bar and gamification widgets

### 🔴 If it fails:
- Check console for red error message
- Share the error with me
- Common issues below ⬇️

---

## 🆘 Troubleshooting

### Issue 1: "Failed to fetch" or Network Error
**Cause:** Vercel can't reach Render backend

**Fix:**
1. Check Vercel env var: `VITE_API_URL`
2. Verify it's exactly: `https://quiz-platform-eseq.onrender.com/api`
3. Redeploy in Vercel

### Issue 2: "Cannot read property 'user'"
**Cause:** Supabase not responding

**Fix:**
1. Check Render has these env vars:
   - `SUPABASE_URL` ✓
   - `SUPABASE_ANON_KEY` ✓
   - `SUPABASE_SERVICE_ROLE_KEY` ✓
2. Redeploy Render service

### Issue 3: Still stuck on Sign Up page after clicking "Create Account"
**Cause:** Timeout or slow response

**Fix:**
1. Wait 5-10 seconds (Render free tier is slow)
2. Check browser Network tab (F12 → Network)
3. Look for failed requests (red X)
4. Share the error URL with me

---

## ✨ Success Checklist

After completing all 3 steps, verify:

- [ ] Vercel has all 4 env vars
- [ ] Render has all 5 env vars
- [ ] Both have redeployed ("Ready" status)
- [ ] Frontend loads without errors
- [ ] Can click "Sign Up" button
- [ ] Can fill in form
- [ ] Can submit form
- [ ] No red errors in console
- [ ] Dashboard appears after signup
- [ ] See XP bar, streak, level badge

---

## 📞 Next Steps

1. **Complete Steps 1 & 2 above**
2. **Test in browser**
3. **If it works:** 🎉 Share success screenshot!
4. **If it doesn't:** Share the console error and I'll debug

**You're almost there!** The sign in/up is just waiting for these environment variables. Once set, it should work immediately! 🚀
