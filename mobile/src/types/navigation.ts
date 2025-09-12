import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
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

export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type DashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;
export type AdminDashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;
export type ProfilesScreenProps = NativeStackScreenProps<RootStackParamList, 'Profiles'>;
export type TransactionsScreenProps = NativeStackScreenProps<RootStackParamList, 'Transactions'>;
export type AddTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;
export type ReportsScreenProps = NativeStackScreenProps<RootStackParamList, 'Reports'>;
export type SettlementScreenProps = NativeStackScreenProps<RootStackParamList, 'Settlement'>;
export type AuditLogsScreenProps = NativeStackScreenProps<RootStackParamList, 'AuditLogs'>;
export type UsersScreenProps = NativeStackScreenProps<RootStackParamList, 'Users'>;
export type AddUserScreenProps = NativeStackScreenProps<RootStackParamList, 'AddUser'>;