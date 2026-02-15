# 🔐 CRITICAL SECURITY FIX GUIDE - FloraQuiz

## ⚠️ URGENT: Your .env file with LIVE API KEYS is in Git History!

All live API keys are exposed:
- Paystack Secret Key (LIVE)
- Database credentials
- Redis authentication token
- Cloudflare R2 keys
- API keys for Groq, Resend, Sentry

**IMMEDIATE ACTION REQUIRED** (Next 30 minutes)

### Step 1: Revoke All Exposed Keys (DO THIS FIRST!)

#### 1a. Paystack Dashboard
1. Go to https://dashboard.paystack.com
2. Settings → API Keys & Webhooks
3. Click "Regenerate Secret Key" → Copy new secret key
4. Click "Regenerate Public Key" → Copy new public key

#### 1b. Neon Database (PostgreSQL)
1. Go to https://console.neon.tech
2. Project → Settings → Connection String
3. Reset password: Go to "Branches" → main → "Reset password"
4. Copy new connection string as DATABASE_URL

#### 1c. Upstash Redis
1. Go to https://console.upstash.com
2. Your Redis database → Settings
3. Click "Reset database" or create new
4. Copy new REDIS_URL

#### 1d. Cloudflare R2
1. Go to https://dash.cloudflare.com
2. R2 → API Tokens → Create new token
3. Permissions: Object Read/Write
4. Update R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY

#### 1e. Groq API
1. Go to https://console.groq.com
2. API Keys → Delete old key → Create new key
3. Copy GROQ_API_KEY

#### 1f. Resend Email
1. Go to https://resend.com/api-keys
2. Delete old key → Create new key
3. Copy RESEND_API_KEY

#### 1g. Generate New JWT Secret
```bash
openssl rand -base64 32
```
Copy output as new JWT_SECRET

### Step 2: Create Clean .env File Locally

Replace all placeholder values with your NEW keys:

```
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend-url.onrender.com
JWT_SECRET=your_new_jwt_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_new_groq_key
DATABASE_URL=your_new_neon_url
REDIS_URL=your_new_redis_url
R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_new_r2_access_key
R2_SECRET_ACCESS_KEY=your_new_r2_secret_key
R2_BUCKET_NAME=floraquiz-files
R2_PUBLIC_URL=https://storage.floraquiz.com
PAYSTACK_SECRET_KEY=your_new_paystack_secret
PAYSTACK_PUBLIC_KEY=your_new_paystack_public
RESEND_API_KEY=your_new_resend_key
FROM_EMAIL=noreply@yourcompany.com
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### Step 3: Remove .env from Git History

**Option A: Using BFG Repo Cleaner (Recommended)**

```bash
# Download BFG from: https://rtyley.github.io/bfg-repo-cleaner/

# Back up your repo first
git clone --mirror https://github.com/JohnProgrammin/quiz-platform.git backup.git

# Remove .env file from history
bfg --delete-files backend/.env backup.git

# Force push
cd backup.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --mirror

# Update your local repo
cd /path/to/quiz-platform
git pull
```

**Option B: Using git-filter-branch**

```bash
# WARNING: This rewrites history
git filter-branch --tree-filter 'rm -f backend/.env' HEAD

# Force push to GitHub
git push -f --all
git push -f --tags
```

### Step 4: Update .gitignore

```bash
# Add to backend/.gitignore
echo ".env" >> backend/.gitignore
echo ".env.local" >> backend/.gitignore
echo ".env.*.local" >> backend/.gitignore

git add backend/.gitignore
git commit -m "chore: Add environment files to gitignore"
git push origin master
```

### Step 5: Create .env.example

Create `backend/.env.example` with placeholder values (NO REAL SECRETS):

```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
GROQ_API_KEY=your_groq_key_here
DATABASE_URL=your_neon_db_url
REDIS_URL=your_redis_url
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=floraquiz-files
R2_PUBLIC_URL=https://storage.floraquiz.com
PAYSTACK_SECRET_KEY=sk_live_your_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_public_key
RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@yourcompany.com
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### Step 6: Update Vercel Environment Variables

1. Go to https://vercel.com/dashboard
2. Select your project → Settings → Environment Variables
3. Update each variable with your NEW values:
   - GROQ_API_KEY
   - DATABASE_URL
   - REDIS_URL
   - R2_ACCESS_KEY_ID
   - R2_SECRET_ACCESS_KEY
   - PAYSTACK_SECRET_KEY
   - PAYSTACK_PUBLIC_KEY
   - RESEND_API_KEY
   - All others from your new .env

### Step 7: Update Render Environment Variables

1. Go to https://render.com/dashboard
2. Select backend service → Environment → Edit
3. Update all keys with new values from your .env
4. Deploy

### Step 8: Verify Everything Works

```bash
# Test locally
cd backend
npm install
npm start

# Test API endpoints in Postman or curl:
# 1. POST /api/v1/auth/signup (should work)
# 2. POST /api/v1/subscription/checkout (should convert currency correctly)
# 3. Database queries (should connect with new credentials)
```

### Step 9: Enable 2FA on All Accounts

- [ ] GitHub: Settings → Password & authentication → Enable 2FA
- [ ] Paystack: Dashboard → Account settings
- [ ] Neon: Account settings → Security
- [ ] Vercel: Settings → Security
- [ ] Cloudflare: Account Home → Security

### Step 10: Add Code Review Requirements

1. Go to GitHub repo → Settings → Branches
2. Add protection rule for "master":
   - Require pull request reviews (1)
   - Require status checks to pass
   - Include administrators

## ✅ VERIFICATION CHECKLIST

- [ ] All old API keys revoked
- [ ] New keys generated in all services
- [ ] .env removed from git history
- [ ] .env added to .gitignore
- [ ] .env.example created
- [ ] Vercel environment updated
- [ ] Render environment updated
- [ ] Local development works
- [ ] Staging/production deployment works
- [ ] Payment checkout converts currency correctly
- [ ] 2FA enabled on all accounts
- [ ] Git history is clean

## 🔍 VERIFY GIT HISTORY IS CLEAN

```bash
# Scan for exposed Paystack keys
git log --all -- "backend/.env" | grep "sk_live"
# Result should be: (nothing)

# Check if file exists in history
git log --all --full-history -- "backend/.env"
# Result should be: No such file

# Test that you can't recover it
git log --all --diff-filter=D -- "backend/.env"
# Result should be: (nothing)
```

## 🎯 NEXT STEPS AFTER FIXING

1. ✅ Fix payment pricing bug (use currencyService for conversion)
2. ✅ Add CSRF protection middleware
3. ✅ Implement JWT refresh tokens
4. ✅ Set up automated security scanning
5. ✅ Add request signing for webhooks
6. ✅ Implement API key rotation schedule (quarterly)

---

**Status**: URGENT
**Timeline**: 30 minutes to 1 hour
**Priority**: CRITICAL - DO THIS NOW
