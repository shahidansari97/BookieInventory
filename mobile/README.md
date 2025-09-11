# Bookie System - React Native Mobile App

A native mobile application for the Bookie Inventory Management System, built with React Native and Expo.

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+ 
- Expo CLI: `npm install -g @expo/cli`
- Expo Go app on your phone (for testing)

### Installation

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Test on your device:**
   - Install Expo Go from App Store/Google Play
   - Scan the QR code shown in terminal
   - Or use `npx expo start --android` / `npx expo start --ios`

## 📱 App Features

### ✅ Authentication Flow
- **Welcome Screen**: Feature overview with call-to-action
- **Login Screen**: Secure authentication with demo credentials
- **Auto-login**: Persistent session management with secure storage

### ✅ Core Screens

#### Dashboard Screen
- Real-time key metrics (Total Profiles, Active Transactions, P&L, Settlements)
- Recent transactions list with amounts and statuses
- Quick action buttons for common tasks
- Logout functionality

#### Profiles Screen  
- **Uplinks Section**: View supplier profiles with rates
- **Downlines Section**: Manage agent profiles with commission structures
- Add new uplink/downline functionality
- Status indicators (Active/Inactive)

#### Transactions Screen
- Complete transaction history with filtering
- Transaction details: points, rates, amounts, commissions
- Status indicators (Completed/Pending)
- Credit/Debit type indicators

#### Add Transaction Screen
- Transaction type selection (Credit/Debit)
- Profile selection with horizontal scroll
- Points and rate input with validation
- Real-time calculation summary
- Commission calculation

## 🔧 Technical Architecture

### Navigation Structure
```
AuthStack (Not Authenticated):
├── Welcome Screen
└── Login Screen

AppStack (Authenticated):
├── Dashboard Screen  
├── Profiles Screen
├── Transactions Screen
└── Add Transaction Screen
```

### Key Technologies
- **React Native 0.72+** with TypeScript
- **Expo SDK 49+** for cross-platform development
- **React Navigation 6** for navigation management
- **TanStack React Query** for state management
- **Expo Secure Store** for secure token storage
- **Zod** for form validation

### API Integration
- Custom API client with automatic token management
- Demo authentication with admin/assistant roles
- RESTful API communication with the backend
- Error handling and loading states

## 🎨 Design System

### Color Palette
- Primary: `#3b82f6` (Blue)
- Success: `#10b981` (Green) 
- Warning: `#f59e0b` (Amber)
- Error: `#ef4444` (Red)
- Text: `#1e293b` (Slate)
- Muted: `#64748b` (Slate Light)

### Typography
- Headers: Bold, 16-24px
- Body: Regular, 14-16px
- Captions: 12px with muted colors

## 📊 Demo Credentials

| Role | Username | Password | Access |
|------|----------|----------|---------|
| Bookie | admin | admin123 | Full access |  
| Assistant | assistant | assistant123 | Limited access |

## 🧪 Testing

The app includes comprehensive `testID` attributes for end-to-end testing:

```typescript
// Examples
testID="login-button"
testID="metric-card-0" 
testID="transaction-123"
testID="add-uplink-button"
```

## 🔄 Data Flow

1. **Authentication**: Login → Store token → Navigate to app
2. **API Requests**: Auto-attach bearer token from secure storage
3. **State Management**: React Query for caching and synchronization
4. **Logout**: Clear token → Navigate to welcome screen

## 🚀 Build & Deploy

### Development Build
```bash
npx expo build:ios
npx expo build:android
```

### Production Build
```bash
# Configure app.json for production
npx expo build:ios --release-channel production
npx expo build:android --release-channel production
```

### App Store Deployment
1. Configure signing certificates in Expo
2. Build signed binaries
3. Upload to App Store Connect / Google Play Console
4. Submit for review

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the mobile directory:

```env
API_BASE_URL=http://localhost:5000/api
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### App Configuration (app.json)
- App name, bundle IDs, and version
- Icon and splash screen assets
- Platform-specific configurations
- Deep linking and permissions

## 🐛 Troubleshooting

### Common Issues

**Metro bundler errors:**
```bash
npx expo start --clear
```

**iOS simulator not loading:**
```bash
npx expo start --ios --clear
```

**Android build issues:**
```bash
npx expo start --android --clear
```

**Dependency conflicts:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📂 Project Structure

```
mobile/
├── App.tsx                 # Main app component with navigation
├── app.json               # Expo configuration
├── package.json           # Dependencies and scripts
└── src/
    ├── screens/           # All screen components
    │   ├── WelcomeScreen.tsx
    │   ├── LoginScreen.tsx
    │   ├── DashboardScreen.tsx
    │   ├── ProfilesScreen.tsx
    │   ├── TransactionsScreen.tsx
    │   └── AddTransactionScreen.tsx
    ├── types/             # TypeScript type definitions
    │   └── navigation.ts
    └── utils/             # Utilities and API client
        └── api.ts
```

## 🔗 Integration with Web App

The mobile app is designed to work with the existing web backend:

- **Shared API**: Uses the same REST endpoints as the web app
- **Consistent Data**: Same data models and validation schemas
- **Authentication**: Compatible token-based auth system
- **Real-time Sync**: React Query ensures data consistency

## 📱 Device Support

### iOS
- iOS 13.0 and above
- iPhone and iPad compatible
- Supports Dark Mode
- Optimized for all screen sizes

### Android  
- Android 6.0+ (API level 23)
- Supports Material Design
- Adaptive icons
- Edge-to-edge display support

## 🔒 Security Features

- **Secure Token Storage**: Uses Expo Secure Store for sensitive data
- **Input Validation**: Zod schemas for form validation
- **API Security**: Bearer token authentication
- **Session Management**: Automatic token refresh and cleanup