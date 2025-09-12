import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, createContext, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';

// Import screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import ProfilesScreen from './src/screens/ProfilesScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import AddTransactionScreen from './src/screens/AddTransactionScreen';
import ReportsScreen from './src/screens/ReportsScreen';
import SettlementScreen from './src/screens/SettlementScreen';
import AuditLogsScreen from './src/screens/AuditLogsScreen';
import UsersScreen from './src/screens/UsersScreen';
import AddUserScreen from './src/screens/AddUserScreen';

type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Dashboard: undefined;
  AdminDashboard: undefined;
  Profiles: undefined;
  Transactions: undefined;
  AddTransaction: undefined;
  Reports: undefined;
  Settlement: undefined;
  AuditLogs: undefined;
  Users: undefined;
  AddUser: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const queryClient = new QueryClient();

// Auth Context
interface AuthContextType {
  isAuthenticated: boolean;
  user: any | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const login = async (token: string) => {
    await SecureStore.setItemAsync('auth_token', token);
    // Get user data that was already stored during login
    const userData = await SecureStore.getItemAsync('user_data');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppNavigator() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'bookie';

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerStyle: { backgroundColor: '#3b82f6' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' }
      }}
    >
      {!isAuthenticated ? (
        // Auth Stack
        <>
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
        </>
      ) : (
        // App Stack - Role-based navigation
        <>
          {isAdmin ? (
            // Admin Dashboard
            <Stack.Screen 
              name="AdminDashboard" 
              component={AdminDashboardScreen}
              options={{ 
                title: 'Admin Panel',
                headerLeft: () => null // Disable back button
              }}
            />
          ) : (
            // User Dashboard
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ 
                title: 'Bookie System',
                headerLeft: () => null // Disable back button
              }}
            />
          )}
          
          {/* Common screens available to all users */}
          <Stack.Screen 
            name="Profiles" 
            component={ProfilesScreen}
            options={{ title: 'Profiles' }}
          />
          <Stack.Screen 
            name="Transactions" 
            component={TransactionsScreen}
            options={{ title: 'Transactions' }}
          />
          <Stack.Screen 
            name="AddTransaction" 
            component={AddTransactionScreen}
            options={{ title: 'Add Transaction' }}
          />
          <Stack.Screen 
            name="Reports" 
            component={ReportsScreen}
            options={{ title: 'Reports & Analytics' }}
          />
          <Stack.Screen 
            name="Settlement" 
            component={SettlementScreen}
            options={{ title: 'Settlement' }}
          />
          
          {/* Admin-only screens */}
          {isAdmin && (
            <>
              <Stack.Screen 
                name="AuditLogs" 
                component={AuditLogsScreen}
                options={{ title: 'Audit Trail' }}
              />
              <Stack.Screen 
                name="Users" 
                component={UsersScreen}
                options={{ title: 'User Management' }}
              />
              <Stack.Screen 
                name="AddUser" 
                component={AddUserScreen}
                options={{ title: 'Add User' }}
              />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
}