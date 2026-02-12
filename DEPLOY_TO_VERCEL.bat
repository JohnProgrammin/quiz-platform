@echo off
REM FloraQuiz - Direct Vercel Deployment (Windows)
REM No GitHub required - deploy directly from your machine

echo.
echo ════════════════════════════════════════════════════════════════
echo 🚀 FloraQuiz - Direct Vercel Deployment
echo ════════════════════════════════════════════════════════════════
echo.

REM Check Node.js
echo ✅ Checking Node.js...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
  echo ❌ Node.js not found. Please install it first.
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i

echo    Node.js: %NODE_VERSION%
echo    npm: %NPM_VERSION%
echo.

REM Install Vercel CLI
echo ✅ Installing Vercel CLI (one-time)...
call npm install -g vercel

echo.
echo ════════════════════════════════════════════════════════════════
echo 🎯 NEXT STEP - Run this in your terminal:
echo ════════════════════════════════════════════════════════════════
echo.
echo    vercel
echo.
echo Then answer these questions:
echo    • Login with your Vercel account (or create one)
echo    • Project name: quiz-platform
echo    • Framework: Vite
echo    • Root directory: ./ (current)
echo    • Build command: cd frontend ^&^& npm run build
echo    • Output directory: frontend/dist
echo.
echo After getting your URL, go to Vercel dashboard and add:
echo.
echo ════════════════════════════════════════════════════════════════
echo ENVIRONMENT VARIABLES TO ADD:
echo ════════════════════════════════════════════════════════════════
echo.
echo    DATABASE_URL
echo    JWT_SECRET
echo    GROQ_API_KEY
echo    REDIS_URL
echo    PAYSTACK_SECRET_KEY
echo    R2_ACCOUNT_ID
echo    R2_ACCESS_KEY_ID
echo    R2_SECRET_ACCESS_KEY
echo    SENDGRID_API_KEY
echo    SENTRY_DSN
echo.
echo Then Vercel will auto-redeploy with your environment variables!
echo.
echo ════════════════════════════════════════════════════════════════
echo.
pause
