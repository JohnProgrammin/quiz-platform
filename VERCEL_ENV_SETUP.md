# Vercel Environment Variables - REQUIRED FOR PRODUCTION

**Your Render Backend URL:** `https://quiz-platform-eseq.onrender.com`

---

## 🔧 ADD THESE TO VERCEL

Go to: **Vercel Dashboard → quiz-platform → Settings → Environment Variables**

Add/Update these 4 variables:

### 1. VITE_API_URL
```
VITE_API_URL=https://quiz-platform-eseq.onrender.com/api
```
✅ **This connects your frontend to your backend**

### 2. VITE_PAYSTACK_PUBLIC_KEY
```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_6d3d4ea0dae07ad7d08a4bee7e4d512e1cb34416
```
✅ **Payment processing**

### 3. VITE_SUPABASE_URL
```
VITE_SUPABASE_URL=https://oxbjguswfijanmzxbrd.supabase.co
```
✅ **Database connection**

### 4. VITE_SUPABASE_ANON_KEY
```
VITE_SUPABASE_ANON_KEY=<copy from your frontend/.env>
```
✅ **Database authentication**

---

## 📋 STEPS:

1. Open Vercel Dashboard
2. Click on `quiz-platform` project
3. Go to **Settings** (not "Deployments")
4. Click **Environment Variables** (left sidebar)
5. For each variable above:
   - Click **"Add New"**
   - Paste the name (e.g., `VITE_API_URL`)
   - Paste the value
   - Select environments: **Production** (and Development if you want)
   - Click **Save**

6. **IMPORTANT:** After adding all 4 variables:
   - Go to **Deployments** tab
   - Click the "..." on your latest deployment
   - Select **Redeploy**
   - Wait for it to rebuild

---

## ✅ Testing After Deployment

Once redeployed:

1. Open your Vercel URL in browser
2. Open **Developer Console** (F12 → Console)
3. Try to **Sign Up**:
   - Email: test@example.com
   - Password: Test@1234
4. If successful:
   - ✅ You should see "success" in console
   - ✅ Redirect to Dashboard
5. If failed:
   - Check console for error message
   - Verify all 4 env vars are set in Vercel

---

## 🔴 ALSO NEEDED: Update Render Backend

Your Render backend also needs these Supabase variables:

Go to: **Render Dashboard → quiz-platform-backend → Environment**

Add (copy from your backend/.env):
```
SUPABASE_URL=<from backend/.env>
SUPABASE_ANON_KEY=<from backend/.env>
SUPABASE_SERVICE_ROLE_KEY=<from backend/.env>
FRONTEND_URL=https://<your-vercel-domain>.vercel.app
BACKEND_URL=https://quiz-platform-eseq.onrender.com
```

Replace `<your-vercel-domain>` with your actual Vercel domain (e.g., `quiz-platform-prod.vercel.app`)

---

## 🆘 Still Not Working?

Check these in order:

1. **Are all 4 Vercel env vars set?**
   - Go to Settings → Environment Variables
   - Verify all 4 exist

2. **Did you redeploy after adding env vars?**
   - Go to Deployments
   - Click ... on latest → Redeploy
   - Wait for "Ready" status

3. **Check browser console for errors**
   - F12 → Console tab
   - Try signing up again
   - Share the error message

4. **Check Vercel build logs**
   - Click on latest deployment
   - Go to "Logs" tab
   - Look for any build errors

5. **Check backend is running**
   - Open `https://quiz-platform-eseq.onrender.com/api/health`
   - Should see a response (not 404 or timeout)

---

**Once these 4 variables are set and Vercel redeploys, sign in/up should work!** ✅
