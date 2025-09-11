# Bookie Inventory Management System - Complete Local Setup

This package contains both the **Web Application** and **React Native Mobile App** for the Bookie Inventory Management System.

## 📦 What's Included

- **Web Application**: React frontend + Express backend
- **Mobile Application**: React Native app with Expo
- **Setup Scripts**: Automated installation for both platforms
- **Documentation**: Complete setup and usage guides
- **Demo Data**: Ready-to-use sample accounts and data

## 🚀 Quick Start

### 1. Extract the Complete Package

```bash
tar -xzf bookie-complete-system.tar.gz
cd bookie-complete-system
```

### 2. Setup Web Application

```bash
# Run the web setup script
chmod +x setup-local.sh
./setup-local.sh

# Start the web application
npm run dev
```

The web app will be available at: `http://localhost:5000`

### 3. Setup Mobile Application

```bash
# Navigate to mobile directory  
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

Test the mobile app by:
- Installing Expo Go on your phone
- Scanning the QR code from the terminal
- Or using `npx expo start --android` / `npx expo start --ios`

## 🔐 Demo Credentials

Both applications use the same authentication system:

| Role | Username | Password | Access Level |
|------|----------|----------|--------------|
| **Bookie** | `admin` | `admin123` | Full system access |
| **Assistant** | `assistant` | `assistant123` | Limited access |

## 🌐 Web Application Features

### ✅ Complete Feature Set
- **Landing Page**: Professional marketing page with feature showcase
- **Authentication**: Secure login with role-based access
- **Dashboard**: Real-time metrics, recent transactions, key insights
- **Profile Management**: Uplink and downline contact management
- **Transaction Tracking**: Automated calculations with commission handling
- **Ledger System**: Weekly balance calculations and profit/loss reports
- **Settlement Integration**: WhatsApp message simulation
- **Custom Reports**: Date range filtering and detailed analytics
- **User Management**: Role-based access control
- **Audit Trail**: Complete activity tracking

### 🖥️ Web App Navigation
```
Landing Page (/) → Login (/login) → Dashboard (/dashboard)
├── Profiles (/profiles)
├── Transactions (/transactions)  
├── Ledger (/ledger)
├── Settlement (/settlement)
├── Reports (/reports)
├── Users (/users)
└── Audit Trail (/audit)
```

## 📱 Mobile Application Features

### ✅ Native Mobile Experience
- **Welcome Screen**: Feature overview with compelling design
- **Secure Login**: Same authentication as web app
- **Dashboard**: Key metrics cards and recent transactions
- **Profiles**: Uplink/downline management with status indicators
- **Transactions**: Complete transaction history and creation
- **Add Transaction**: Real-time calculation with commission handling

### 📱 Mobile App Flow
```
Welcome Screen → Login Screen → Dashboard
├── Profiles Screen
├── Transactions Screen
└── Add Transaction Screen
```

## 🛠️ Technical Architecture

### Web Application Stack
- **Frontend**: React 18 + TypeScript + Wouter routing
- **Backend**: Express.js + TypeScript + RESTful API
- **UI**: Shadcn/ui + Tailwind CSS + Responsive design
- **State**: TanStack React Query + React Hook Form
- **Database**: In-memory storage (development) / PostgreSQL (production)

### Mobile Application Stack
- **Framework**: React Native + Expo SDK
- **Navigation**: React Navigation 6 with Auth/App stacks
- **State**: React Context + TanStack React Query
- **Storage**: Expo Secure Store for token management
- **UI**: Native components with custom styling

## 📋 Prerequisites

### For Web Application
- **Node.js 18+**
- **npm** (comes with Node.js)
- **PostgreSQL** (optional, for production)

### For Mobile Application
- **Node.js 18+**
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go app** on your phone (for testing)
- **iOS Simulator** or **Android Emulator** (optional)

## 🔧 Detailed Setup Instructions

### Web Application Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment configuration:**
   ```bash
   # .env file is created automatically
   NODE_ENV=development
   PORT=5000
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Open `http://localhost:5000`
   - Use demo credentials to login

### Mobile Application Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install Expo CLI globally (if not installed):**
   ```bash
   npm install -g @expo/cli
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Configure API endpoint:**
   ```bash
   # Create .env in mobile/ directory
   echo "EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:5000/api" > .env
   # Replace YOUR_LOCAL_IP with your computer's IP address
   ```

5. **Start Expo development server:**
   ```bash
   npx expo start
   ```

6. **Test on device:**
   - Install Expo Go from App Store/Google Play
   - Scan QR code to run on your phone
   - Or use simulators: `npx expo start --ios` or `npx expo start --android`

## 🌐 Network Configuration for Mobile

For the mobile app to communicate with your local web server:

1. **Find your local IP address:**
   ```bash
   # On macOS/Linux
   ifconfig | grep inet
   
   # On Windows
   ipconfig
   ```

2. **Update mobile environment:**
   ```bash
   # In mobile/.env file
   EXPO_PUBLIC_API_URL=http://192.168.1.100:5000/api
   ```

3. **Ensure web server accepts external connections:**
   The web app is configured to bind to `0.0.0.0:5000` for mobile compatibility.

## 📊 Data & Storage

### Development (Default)
- **Web App**: In-memory storage with sample data
- **Mobile App**: Connects to web app backend
- **Data Reset**: All data resets when server restarts

### Production Setup
- **Database**: PostgreSQL with persistent storage
- **Configuration**: Update DATABASE_URL in .env
- **Migrations**: Automatic table creation on startup

## 🧪 Testing & Validation

### Web Application Testing
1. **Access landing page**: `http://localhost:5000`
2. **Login functionality**: Use demo credentials
3. **Navigate sections**: Dashboard, Profiles, Transactions, etc.
4. **Responsive design**: Test on different screen sizes
5. **Logout**: Verify session cleanup

### Mobile Application Testing
1. **Welcome screen**: Feature showcase and navigation
2. **Login flow**: Same credentials as web app
3. **Dashboard**: Metrics cards and recent data
4. **Navigation**: Between all screens
5. **Transaction creation**: Form validation and calculations
6. **Logout**: Secure token cleanup

## 🔒 Security Features

### Authentication
- **Session-based**: Secure login with role validation
- **Token Storage**: Mobile uses secure storage for tokens
- **Auto-logout**: Session cleanup on logout
- **Role-based Access**: Different permissions for Bookie/Assistant

### Data Protection
- **Input Validation**: Form validation with Zod schemas
- **XSS Protection**: Sanitized inputs and secure rendering
- **API Security**: Bearer token authentication
- **Audit Logging**: Complete activity tracking

## 🚀 Deployment Options

### Web Application
- **Development**: `npm run dev` (port 5000)
- **Production**: `npm run build` → `npm start`
- **Cloud**: Vercel, Railway, DigitalOcean, Heroku

### Mobile Application
- **Development**: Expo Go app for testing
- **Production**: Build native binaries for App Store/Google Play
- **Distribution**: Expo Application Services (EAS)

### Build Commands
```bash
# Web production build
npm run build

# Mobile production build
cd mobile
npx expo build:ios --release-channel production
npx expo build:android --release-channel production
```

## 🛠️ Troubleshooting

### Common Issues

**Web App - Port already in use:**
```bash
npx kill-port 5000
npm run dev
```

**Web App - Database connection:**
```bash
# Check DATABASE_URL in .env
# Verify PostgreSQL is running (if using database)
```

**Mobile App - Can't connect to server:**
```bash
# Check mobile/.env has correct IP address
# Ensure web server is running on 0.0.0.0:5000
# Verify firewall allows connections
```

**Mobile App - Expo issues:**
```bash
npx expo start --clear
# Or restart with tunnel: npx expo start --tunnel
```

**Dependencies issues:**
```bash
# Web app
rm -rf node_modules package-lock.json
npm install

# Mobile app  
cd mobile
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

### Development Tips
1. **Use browser dev tools** for web app debugging
2. **Check React Native debugger** for mobile issues
3. **Monitor network requests** for API communication
4. **Use Expo Dev Tools** for mobile development
5. **Check server logs** for backend issues

### File Structure
```
bookie-complete-system/
├── client/                 # React web frontend
├── server/                 # Express backend
├── shared/                 # Shared TypeScript types
├── mobile/                 # React Native mobile app
│   ├── src/screens/       # Mobile app screens
│   ├── src/utils/         # API client and utilities
│   └── App.tsx            # Main mobile app component
├── package.json           # Web app dependencies
├── setup-local.sh         # Web app setup script
└── COMPLETE-SETUP.md      # This documentation
```

## ✅ Success Checklist

### Web Application
- [ ] Server starts without errors on port 5000
- [ ] Landing page loads with professional design
- [ ] Login works with demo credentials
- [ ] Dashboard shows metrics and recent transactions
- [ ] All navigation sections are accessible
- [ ] Responsive design works on mobile browsers
- [ ] Logout returns to landing page

### Mobile Application
- [ ] Expo development server starts successfully
- [ ] Welcome screen displays feature showcase
- [ ] Login works with same demo credentials
- [ ] Dashboard shows metrics cards
- [ ] Navigation between screens works smoothly
- [ ] Transaction creation form works correctly
- [ ] Logout clears session and returns to welcome

---

## 🎯 Ready to Use!

You now have a complete **Bookie Inventory Management System** with:
- **Professional web application** with full feature set
- **Native mobile application** for iOS and Android
- **Comprehensive documentation** for setup and usage
- **Demo accounts** ready for immediate testing
- **Production-ready architecture** for scaling

Both applications work together seamlessly and are ready for immediate use and customization!