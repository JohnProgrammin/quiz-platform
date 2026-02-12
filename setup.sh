#!/bin/bash

echo "================================"
echo "AI Quiz Platform Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend

if [ ! -f ".env" ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env and add your Groq API key (FREE from console.groq.com)"
fi

echo "Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Backend installation failed"
    exit 1
fi

echo "✅ Backend setup complete"
echo ""

# Frontend setup
echo "📦 Setting up frontend..."
cd ../frontend

echo "Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Frontend installation failed"
    exit 1
fi

echo "✅ Frontend setup complete"
echo ""

# Final instructions
echo "================================"
echo "Setup Complete! 🎉"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Get FREE Groq API key from https://console.groq.com"
echo "2. Edit backend/.env and add your Groq API key"
echo "3. Start the backend: cd backend && npm start"
echo "4. In another terminal, start frontend: cd frontend && npm run dev"
echo "5. Open http://localhost:3000 in your browser"
echo ""
echo "For detailed instructions, see README.md or GROQ_API_SETUP.md"
