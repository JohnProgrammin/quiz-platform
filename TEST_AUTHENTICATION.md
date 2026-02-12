# 🧪 Authentication Testing Checklist

## Pre-Test Verification
- [ ] Backend server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] `.env` file has `FRONTEND_URL=http://localhost:3000` ✅ (Just fixed!)
- [ ] Both servers restarted after .env change

## Test 1: Backend Health Check
```
URL: http://localhost:3001/health
Expected Response:
{
  "status": "ok",
  "timestamp": "2024-02-10T..."
}
Result: ✅ / ❌
```

## Test 2: Signup (Create Account)
```
Method: POST
URL: http://localhost:3000 → Click "SIGN UP"
Request Data:
{
  "username": "testuser123",
  "email": "jokator809@gmail.com",
  "password": "TestPassword123!",
  "fullName": "Test User"
}

Expected Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "testuser123",
    "email": "jokator809@gmail.com",
    "fullName": "Test User",
    "subscriptionTier": "free"
  }
}

Result: ✅ / ❌
```

## Test 3: Login with Newly Created Account
```
Method: POST
URL: http://localhost:3000 → Click "LOG IN"
Request Data:
{
  "username": "jokator809@gmail.com",  // Can use email OR username
  "password": "TestPassword123!"
}

Expected Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "testuser123",
    "email": "jokator809@gmail.com",
    "subscriptionTier": "free"
  }
}

Result: ✅ / ❌
```

## Test 4: Get Current User Profile
```
Method: GET
URL: http://localhost:3001/api/v1/users/me
Headers:
  Authorization: Bearer <token_from_login>

Expected Response:
{
  "id": "uuid",
  "username": "testuser123",
  "email": "jokator809@gmail.com",
  "fullName": "Test User",
  "bio": null,
  "subscriptionTier": "free",
  "createdAt": "2024-02-10T..."
}

Result: ✅ / ❌
```

## Test 5: Note Upload
```
Method: POST
URL: http://localhost:3000 → Go to "Notes" → Upload
Expected:
  - File uploads successfully
  - Note appears in list
  - No database errors

Result: ✅ / ❌
```

## Test 6: Quiz Generation
```
Method: POST
URL: http://localhost:3000 → Select note → Generate Quiz
Expected:
  - Quiz generates with questions
  - Uses Groq AI (check backend logs for "Quiz generated successfully")
  - 10 questions for free tier

Result: ✅ / ❌
```

## Test 7: Feature Gating (Free Tier)
```
Free tier limits:
  - Max 5 quizzes per month ✅
  - Max 3 notes ✅
  - 10 MCQ only (no text answers) ✅
  - No AI Teaching (Premium only) ✅

Result: ✅ / ❌
```

## Common Error Messages & Solutions

### "Login failed" after signup
- [ ] Check backend logs for errors
- [ ] Verify FRONTEND_URL=http://localhost:3000
- [ ] Restart both servers
- [ ] Check browser console for CORS errors

### "This function can now be called only as a tagged-template function"
- [ ] Old database query syntax issue
- [ ] Should be FIXED in all controllers
- [ ] Restart backend to reload changes

### "Network request failed"
- [ ] Check if backend is running: `http://localhost:3001/health`
- [ ] Check if frontend is running: `http://localhost:3000`
- [ ] Check CORS in backend logs

### "Invalid credentials"
- [ ] Email/username doesn't exist
- [ ] Password is incorrect
- [ ] Try signing up instead of logging in

## Backend Debug Checklist

After startup, you should see:
```
✅ Database connection successful (Neon Serverless)
✅ Redis connection established (or warning if offline - OK)
✅ R2 storage connection test (or warning if offline - OK)
✅ Server running on http://localhost:3001
```

## Frontend Debug Checklist

After startup, you should see:
```
VITE v5.x.x  ready in XXXms
➜  Local:   http://localhost:3000/
```

Then browser should show:
- Navbar with "floraquiz" logo
- Landing page with "Start Learning Free" button
- Login/Signup forms working

---

## Success Criteria
✅ All 7 tests passing
✅ No errors in browser console
✅ No "Login failed" errors
✅ Can complete signup → login → upload note → generate quiz flow

## If Tests Fail
1. Check backend logs: Look for database, JWT, or CORS errors
2. Check frontend console: Look for network or parsing errors
3. Review AUTHENTICATION_FIX.md for solutions
4. Restart both servers completely
5. Clear browser cache (Ctrl+Shift+Delete)
