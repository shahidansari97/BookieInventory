#!/bin/bash

# Bookie Inventory Management System - Local Setup Script
echo "🚀 Setting up Bookie Inventory Management System locally..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "Please update Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://localhost:5432/bookie_db
EOL
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

echo ""
echo "🎉 Setup complete! To start the application:"
echo ""
echo "1. Start the development server:"
echo "   npm run dev"
echo ""
echo "2. Open your browser and go to:"
echo "   http://localhost:5000"
echo ""
echo "3. Use these demo credentials to login:"
echo "   Bookie: admin / admin123"
echo "   Assistant: assistant / assistant123"
echo ""
echo "📋 The system uses in-memory storage by default."
echo "   All data will reset when you restart the server."
echo ""
echo "💡 For production setup with PostgreSQL:"
echo "   1. Install PostgreSQL"
echo "   2. Create a database named 'bookie_db'"
echo "   3. Update DATABASE_URL in .env file"
echo "   4. The app will automatically create tables"
echo ""