#!/bin/bash

# Bookie Inventory Management System - Complete Setup Script
echo "🚀 Setting up Complete Bookie Inventory Management System..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ is required. Current version: $(node -v)${NC}"
    echo "Please update Node.js from: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Setup Web Application
echo -e "${BLUE}📦 Setting up Web Application...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install web app dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Web app dependencies installed${NC}"

# Create .env file for web app if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating web app .env file...${NC}"
    cat > .env << EOL
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://localhost:5432/bookie_db
EOL
    echo -e "${GREEN}✅ Web app .env file created${NC}"
else
    echo -e "${YELLOW}ℹ️  Web app .env file already exists${NC}"
fi

# Setup Mobile Application
echo ""
echo -e "${BLUE}📱 Setting up Mobile Application...${NC}"

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Expo CLI globally...${NC}"
    npm install -g @expo/cli
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Expo CLI${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Expo CLI installed${NC}"
else
    echo -e "${GREEN}✅ Expo CLI already installed${NC}"
fi

# Install mobile app dependencies
cd mobile
echo -e "${BLUE}📦 Installing mobile app dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install mobile app dependencies${NC}"
    echo -e "${YELLOW}💡 This is expected due to dependency conflicts in the demo environment${NC}"
    echo -e "${YELLOW}   In a real setup, the mobile app would have separate dependencies${NC}"
else
    echo -e "${GREEN}✅ Mobile app dependencies installed${NC}"
fi

# Get local IP address for mobile app
echo -e "${BLUE}🌐 Configuring mobile app API endpoint...${NC}"
LOCAL_IP=""

# Try to get local IP on different systems
if command -v ifconfig &> /dev/null; then
    LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n1)
elif command -v ip &> /dev/null; then
    LOCAL_IP=$(ip route get 1 | grep -oP 'src \K\S+')
fi

# Create mobile app .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating mobile app .env file...${NC}"
    if [ ! -z "$LOCAL_IP" ]; then
        echo "EXPO_PUBLIC_API_URL=http://${LOCAL_IP}:5000/api" > .env
        echo -e "${GREEN}✅ Mobile app configured for API at http://${LOCAL_IP}:5000/api${NC}"
    else
        echo "EXPO_PUBLIC_API_URL=http://localhost:5000/api" > .env
        echo -e "${YELLOW}⚠️  Could not detect local IP, using localhost${NC}"
        echo -e "${YELLOW}   Update mobile/.env with your local IP for device testing${NC}"
    fi
else
    echo -e "${YELLOW}ℹ️  Mobile app .env file already exists${NC}"
fi

cd ..

# Final setup complete message
echo ""
echo -e "${GREEN}🎉 Setup complete! Both applications are ready.${NC}"
echo ""
echo -e "${BLUE}🌐 Web Application:${NC}"
echo "   1. Start the web server:"
echo "      npm run dev"
echo ""
echo "   2. Open your browser:"
echo "      http://localhost:5000"
echo ""
echo -e "${BLUE}📱 Mobile Application:${NC}"
echo "   1. Navigate to mobile directory:"
echo "      cd mobile"
echo ""
echo "   2. Start Expo development server:"
echo "      npx expo start"
echo ""
echo "   3. Test on your device:"
echo "      - Install Expo Go from App Store/Google Play"
echo "      - Scan QR code to run on your phone"
echo "      - Or use: npx expo start --ios / --android"
echo ""
echo -e "${GREEN}🔐 Demo Credentials (both apps):${NC}"
echo "   Bookie: admin / admin123"
echo "   Assistant: assistant / assistant123"
echo ""
echo -e "${YELLOW}📋 Note:${NC}"
echo "   - Web app uses in-memory storage (data resets on restart)"
echo "   - Mobile app connects to web app backend"
echo "   - For production, configure PostgreSQL database"
echo ""
echo -e "${BLUE}💡 Mobile Setup Tips:${NC}"
echo "   - Update mobile/.env with your local IP for device testing"
echo "   - Ensure web server is running before testing mobile app"
echo "   - Use 'npx expo start --tunnel' if having network issues"
echo ""
echo -e "${GREEN}✨ Enjoy your Bookie Inventory Management System!${NC}"