@echo off
color 0A
cls

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║          🚀 FloraQuiz Platform - Starting Servers...         ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

REM Start backend in a new window
echo [1/2] Starting Backend Server (Port 3001)...
start "FloraQuiz Backend" /MIN cmd /k "cd /d c:\Users\HP\Documents\quiz-platform\backend && npm start"

timeout /t 5 /nobreak

REM Start frontend in a new window
echo [2/2] Starting Frontend Server (Port 3000)...
start "FloraQuiz Frontend" /MIN cmd /k "cd /d c:\Users\HP\Documents\quiz-platform\frontend && npm run dev"

echo.
echo ✅ Both servers are starting...
echo.
echo 📍 Frontend: http://localhost:3000
echo 📍 Backend:  http://localhost:3001
echo.
echo ⏳ Waiting for servers to be ready (30 seconds)...
timeout /t 30 /nobreak

echo.
echo ✅ Servers should be running now!
echo.
echo 📝 QUICK START:
echo    1. Open http://localhost:3000 in your browser
echo    2. Click "SIGN UP" to create a new account
echo    3. Fill in username, email, and password
echo    4. You'll be automatically logged in
echo    5. Then try uploading a note!
echo.
pause
