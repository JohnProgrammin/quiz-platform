@echo off
echo Killing existing Node processes...
taskkill /IM node.exe /F 2>nul
timeout /t 3 /nobreak

echo.
echo Starting Backend Server...
cd /d c:\Users\HP\Documents\quiz-platform\backend
npm start
