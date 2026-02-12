@echo off
echo ================================
echo AI Quiz Platform Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js v16 or higher.
    pause
    exit /b 1
)

echo Node.js version:
node --version
echo.

REM Backend setup
echo Setting up backend...
cd backend

if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Please edit backend\.env and add your Groq API key (FREE from console.groq.com)
)

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo X Backend installation failed
    pause
    exit /b 1
)

echo Backend setup complete
echo.

REM Frontend setup
echo Setting up frontend...
cd ..\frontend

echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo X Frontend installation failed
    pause
    exit /b 1
)

echo Frontend setup complete
echo.

REM Final instructions
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Get FREE Groq API key from https://console.groq.com
echo 2. Edit backend\.env and add your Groq API key
echo 3. Start the backend: cd backend ^&^& npm start
echo 4. In another terminal, start frontend: cd frontend ^&^& npm run dev
echo 5. Open http://localhost:3000 in your browser
echo.
echo For detailed instructions, see README.md or GROQ_API_SETUP.md
echo.
pause
