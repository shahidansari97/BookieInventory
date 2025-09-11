import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Dashboard: undefined;
  Profiles: undefined;
  Transactions: undefined;
  AddTransaction: undefined;
};

export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type DashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;
export type ProfilesScreenProps = NativeStackScreenProps<RootStackParamList, 'Profiles'>;
export type TransactionsScreenProps = NativeStackScreenProps<RootStackParamList, 'Transactions'>;
export type AddTransactionScreenProps = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;