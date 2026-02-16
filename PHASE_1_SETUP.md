# Phase 1: Foundation & Infrastructure - Setup Guide

## Overview

This guide walks you through Phase 1 of the complete architectural redesign:
- Database migration from Neon to Supabase
- Library installation
- Auth system migration
- Database access layer update

**Estimated Time:** 17 hours
**Risk Level:** Medium (database migration)

---

## Step 1: Create Supabase Project (30 minutes)

### 1.1 Sign Up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click "Start Your Project"
3. Sign in with GitHub or create account
4. Create new organization (or use existing)
5. Create new project:
   - **Project Name:** `floraquiz`
   - **Database Password:** (save this securely)
   - **Region:** Select closest to your location
   - **Pricing Plan:** Free tier (for now)

### 1.2 Get Connection Details
After project is created:
1. Go to Project Settings → Database
2. Copy and save these values:
   - `Host:` (without port)
   - `Port:` (usually 5432)
   - `Database:` (usually `postgres`)
   - `User:` (usually `postgres`)
   - `Password:` (from project creation)

3. Go to Project Settings → API
4. Copy these values:
   - `Project URL` → `SUPABASE_URL`
   - `Anon Public Key` → `SUPABASE_ANON_KEY`
   - `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 1.3 Enable Realtime (Optional but Recommended)
In Supabase dashboard:
1. Go to Replication → Publication
2. Enable realtime for these tables:
   - `quiz_attempts`
   - `user_gamification`
   - `leaderboard_cache`

---

## Step 2: Backup Current Database (20 minutes)

**CRITICAL:** Always backup before migrating!

```bash
# Export Neon database
pg_dump "$NEON_DATABASE_URL" > floraquiz_backup_$(date +%Y%m%d).sql

# Verify backup (should be > 1MB)
ls -lh floraquiz_backup_*.sql
```

Store this backup somewhere safe!

---

## Step 3: Create Supabase Schema (10 minutes)

### 3.1 Run Migration in Supabase Studio
1. In Supabase Dashboard, go to SQL Editor
2. Create new query
3. Copy entire contents of `backend/migrations/003_supabase_migration.sql`
4. Paste into Supabase SQL Editor
5. Click "Run" button
6. Wait for completion (should see no errors)

### 3.2 Verify Schema Created
In Supabase SQL Editor, run:

```sql
-- Verify all tables created
SELECT COUNT(*) as table_count FROM information_schema.tables
WHERE table_schema = 'public';

-- Should return: 16 tables

-- Verify RLS policies
SELECT COUNT(*) as policy_count FROM pg_policies;

-- Should return multiple policies
```

If both queries return results, your schema is ready!

---

## Step 4: Install Essential Libraries (30 minutes)

### 4.1 Frontend Libraries

```bash
cd frontend

# Install new libraries
npm install \
  framer-motion \
  recharts \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-tooltip \
  @radix-ui/react-tabs \
  @radix-ui/react-progress \
  react-hook-form \
  @hookform/resolvers \
  zod \
  react-hot-toast \
  react-countup \
  react-use

# Remove unused packages
npm uninstall confetti typescript

# Verify installation
npm ls | grep -E "framer-motion|recharts|@radix-ui|react-hook-form|zod"
```

**Expected Output:**
```
├── framer-motion@11.x.x
├── recharts@2.x.x
├── @radix-ui/react-dialog@1.x.x
├── @radix-ui/react-dropdown-menu@2.x.x
├── react-hook-form@7.x.x
├── zod@3.x.x
└── react-hot-toast@2.x.x
```

### 4.2 Backend Libraries

```bash
cd backend

# Install Supabase client
npm install @supabase/supabase-js

# Keep these (for now):
# - @neondatabase/serverless (will remove after testing)
# - bcryptjs (will remove after auth migration)

# Verify installation
npm ls @supabase/supabase-js
```

**Expected Output:**
```
└── @supabase/supabase-js@2.x.x
```

---

## Step 5: Update Environment Variables (15 minutes)

### 5.1 Backend .env

Update `backend/.env`:

```bash
# Database (Change from Neon to Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
# Use the connection string from Supabase → Project Settings → Database

# Supabase API Keys
SUPABASE_URL="https://[PROJECT_ID].supabase.co"
SUPABASE_ANON_KEY="eyJ...xxx"
SUPABASE_SERVICE_ROLE_KEY="eyJ...xxx"  # Keep secret!

# Keep existing variables
NODE_ENV=production
PORT=3001
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
JWT_SECRET=qp_s3cur3_jwt_k3y_2024_r4nd0m_str1ng_x7k9m2
JWT_EXPIRES_IN=7d
GROQ_API_KEY=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
REDIS_URL=redis://...
R2_ACCOUNT_ID=4c3d190efbc88d52da77158fc8fa0689
R2_ACCESS_KEY_ID=b85b33e4223b0056defb72a9950f3278
R2_SECRET_ACCESS_KEY=981446f2b3fec5acd469422919cc1d0ea0de5596910cf307b755e8e245e7a4e0
R2_BUCKET_NAME=floraquiz-access-token
R2_PUBLIC_URL=https://storage.floraquiz.com
PAYSTACK_SECRET_KEY=sk_live_c732aee2f3235473fe037d1328c651d315684eb8
PAYSTACK_PUBLIC_KEY=pk_live_ef1f90bb45b428cdb1fc3eb2c0fc6c8ccd173fe8
RESEND_API_KEY=re_7yNA7T4t_E7xy7GTYVwfMN3VXUg1bvNHj
FROM_EMAIL=onboarding@resend.dev
SENTRY_DSN=https://c2d1ff9ae1f35e5f2f6fb254e6715558@o451087347639910.ingest.de.sentry.io/4510873522536528
LOG_LEVEL=info
```

### 5.2 Frontend .env

Update `frontend/.env`:

```bash
VITE_API_URL=http://localhost:3001/api
VITE_PAYSTACK_PUBLIC_KEY=pk_test_6d3d4ea0dae07ad7d08a4bee7e4d512e1cb34416
```

---

## Step 6: Create Supabase Client Config (45 minutes)

Create `backend/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export { supabase };
```

---

## Step 7: Test Supabase Connection (30 minutes)

Create `backend/test-supabase.js`:

```javascript
import { supabase } from './config/supabase.js';

async function testConnection() {
  console.log('Testing Supabase connection...');

  try {
    // Test 1: Check connection
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Query failed:', error.message);
      process.exit(1);
    }

    console.log('✅ Connection successful');

    // Test 2: Verify tables exist
    const tables = [
      'users',
      'subscriptions',
      'notes',
      'quizzes',
      'quiz_questions',
      'quiz_attempts',
      'user_gamification',
      'achievements',
      'user_achievements',
      'xp_transactions',
      'leaderboard_cache',
      'payment_events',
      'feature_flags',
    ];

    console.log('\n✅ Checking tables...');
    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error?.code === 'PGRST116') {
        console.log(`  ✅ ${table}`);
      } else if (error) {
        console.log(`  ❌ ${table}: ${error.message}`);
      } else {
        console.log(`  ✅ ${table}`);
      }
    }

    console.log('\n✅ All tests passed! Supabase is ready.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testConnection();
```

Run the test:

```bash
cd backend
node test-supabase.js
```

**Expected Output:**
```
Testing Supabase connection...
✅ Connection successful

✅ Checking tables...
  ✅ users
  ✅ subscriptions
  ✅ notes
  ✅ quizzes
  ✅ quiz_questions
  ✅ quiz_attempts
  ✅ user_gamification
  ✅ achievements
  ✅ user_achievements
  ✅ xp_transactions
  ✅ leaderboard_cache
  ✅ payment_events
  ✅ feature_flags

✅ All tests passed! Supabase is ready.
```

---

## Step 8: Migrate Auth Middleware (2 hours)

This is the most critical step. We'll replace JWT middleware with Supabase Auth.

### 8.1 Update Auth Middleware

Replace `backend/middleware/auth.js` with Supabase Auth verification:

```javascript
import { supabase } from '../config/supabase.js';

export async function verifyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const token = authHeader.substring(7);

    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Get user subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    // Attach user to request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      ...userProfile,
      subscription: subscription || { tier: 'free', status: 'active' },
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

export function requireTier(tier) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const tiers = { free: 0, pro: 1, premium: 2 };
    const userTierLevel = tiers[req.user.subscription?.tier] || 0;
    const requiredTierLevel = tiers[tier] || 0;

    if (userTierLevel < requiredTierLevel) {
      return res.status(403).json({
        error: `This feature requires ${tier} plan`,
      });
    }

    next();
  };
}
```

### 8.2 Update Login Endpoint

Update `backend/routes/auth.routes.js` or `backend/server.js`:

```javascript
import { supabase } from '../config/supabase.js';

// Login endpoint
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        ...userProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Signup endpoint
app.post('/api/v1/auth/signup', async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        username,
        full_name: fullName,
      })
      .select()
      .single();

    if (profileError) {
      return res.status(400).json({ error: profileError.message });
    }

    // Create free subscription
    await supabase
      .from('subscriptions')
      .insert({
        user_id: authData.user.id,
        tier: 'free',
        status: 'active',
      });

    res.json({
      token: authData.session?.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        ...userProfile,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
});
```

### 8.3 Apply Auth Middleware

Update all protected routes:

```javascript
// Before
app.get('/api/v1/quizzes', verifyJWT, getQuizzes);

// After
app.get('/api/v1/quizzes', verifyAuth, getQuizzes);
```

---

## Step 9: Update Database Access Layer (1 hour)

Replace all Neon queries with Supabase queries:

### Example: Quiz Controller

**Before (Neon):**
```javascript
import { sql } from '@neondatabase/serverless';

const quizzes = await sql`SELECT * FROM quizzes WHERE user_id = ${userId}`;
```

**After (Supabase):**
```javascript
import { supabase } from '../config/supabase.js';

const { data: quizzes } = await supabase
  .from('quizzes')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

---

## Step 10: Test Locally (30 minutes)

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser: http://localhost:5173
# Test signup, login, create note, generate quiz
```

**Expected Flow:**
1. ✅ Sign up with email/password
2. ✅ Login successful
3. ✅ Dashboard loads
4. ✅ Upload note
5. ✅ Generate quiz
6. ✅ Complete quiz
7. ✅ See results

---

## Rollback Plan (If Something Goes Wrong)

If you encounter issues:

1. **Keep Neon running** for 1 week as fallback
2. **Have backup SQL file** saved locally
3. **Git revert** if code changes broke things

```bash
# Revert to previous version
git revert HEAD

# Restore from backup (if data migration failed)
pg_restore $NEON_URL < floraquiz_backup_20240214.sql
```

---

## Success Criteria ✅

Phase 1 is complete when:

- [ ] Supabase project created and running
- [ ] Migration SQL executed without errors
- [ ] Libraries installed (npm ls shows no errors)
- [ ] Environment variables configured
- [ ] Supabase test script runs successfully
- [ ] Backend starts without errors
- [ ] Frontend builds successfully
- [ ] Can sign up new user
- [ ] Can login with credentials
- [ ] Dashboard loads (shows user info)
- [ ] Can create note
- [ ] Can generate quiz
- [ ] Can submit quiz
- [ ] Sentry receives events
- [ ] All API tests pass

---

## Next Steps

After Phase 1 is complete, proceed to:
- **Phase 2:** UI Component Foundation (Radix UI, React Hook Form, etc.)

---

## Troubleshooting

### "Missing environment variables"
- Make sure `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are in `backend/.env`
- Restart backend server after updating

### "Connection refused"
- Verify Supabase project is running
- Check database credentials in `.env`
- Test with: `psql "postgresql://..."`

### "Table already exists"
- If running migration twice, add `IF NOT EXISTS` or drop tables first
- Or run migration in fresh Supabase project

### "RLS policy denies access"
- Make sure you're authenticated before querying
- Check RLS policies in Supabase dashboard
- Temporarily disable RLS for testing: Dashboard → RLS → Disable

### Auth token invalid
- Make sure to send token in `Authorization: Bearer <token>` header
- Token expires after 1 hour (implement refresh token)

---

## Questions?

- Check Supabase docs: https://supabase.com/docs
- Check plan file: `PHASE_1_SETUP.md` (this file)
- Review migration SQL: `backend/migrations/003_supabase_migration.sql`

---

**Phase 1 is your foundation. Take time to ensure everything works before moving to Phase 2.**

Good luck! 🚀
