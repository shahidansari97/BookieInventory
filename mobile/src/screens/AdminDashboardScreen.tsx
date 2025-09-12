import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { AdminDashboardScreenProps } from '../types/navigation';
import { useAuth } from '../../App';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const { logout, user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('2025-09');

  const { data: profilesResponse, isLoading: profilesLoading, error: profilesError } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => apiClient.getProfiles(),
  });

  const { data: transactionsResponse, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => apiClient.getTransactions(1, 5),
  });

  const { data: usersResponse, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  // Handle API responses consistently
  const profiles = profilesResponse?.success ? profilesResponse.data : [];
  const transactions = transactionsResponse?.success ? transactionsResponse.data.data : [];
  const users = usersResponse?.success ? usersResponse.data : [];
  
  const hasProfilesError = !profilesResponse?.success || !!profilesError;
  const hasTransactionsError = !transactionsResponse?.success || !!transactionsError;
  const hasUsersError = !usersResponse?.success || !!usersError;

  const handleLogout = async () => {
    await logout();
  };

  const calculateLedger = async () => {
    try {
      const response = await apiClient.calculateLedger(selectedPeriod);
      if (response.success) {
        // Refresh data after calculation
        navigation.navigate('Settlement');
      }
    } catch (error) {
      console.error('Ledger calculation failed:', error);
    }
  };

  const adminActions = [
    { id: 'users', title: 'User Management', icon: '👥', screen: 'Users', description: 'Manage system users' },
    { id: 'profiles', title: 'Profiles', icon: '🏢', screen: 'Profiles', description: 'Manage uplinks & downlines' },
    { id: 'transactions', title: 'Transactions', icon: '💱', screen: 'Transactions', description: 'View all transactions' },
    { id: 'settlement', title: 'Settlement', icon: '💰', screen: 'Settlement', description: 'Process settlements' },
    { id: 'reports', title: 'Reports', icon: '📊', screen: 'Reports', description: 'Generate reports' },
    { id: 'audit', title: 'Audit Trail', icon: '📝', screen: 'AuditLogs', description: 'View audit logs' },
  ];

  const systemStats = [
    { 
      title: 'Total Users', 
      value: hasUsersError ? 'Error' : users.length, 
      icon: '👥', 
      color: '#3b82f6',
      loading: usersLoading,
      hasError: hasUsersError
    },
    { 
      title: 'Active Profiles', 
      value: hasProfilesError ? 'Error' : profiles.filter(p => p.status === 'active').length, 
      icon: '🏢', 
      color: '#10b981',
      loading: profilesLoading,
      hasError: hasProfilesError
    },
    { 
      title: 'Recent Transactions', 
      value: hasTransactionsError ? 'Error' : transactions.length, 
      icon: '💱', 
      color: '#f59e0b',
      loading: transactionsLoading,
      hasError: hasTransactionsError
    },
    { 
      title: 'System Status', 
      value: 'Online', 
      icon: '✅', 
      color: '#22c55e',
      loading: false
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Admin Panel</Text>
            <Text style={styles.headerTitle}>System Management</Text>
            <Text style={styles.userInfo}>Welcome, {user?.username}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} testID="admin-logout-button">
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* System Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>System Overview</Text>
          <View style={styles.statsGrid}>
            {systemStats.map((stat, index) => (
              <View key={index} style={styles.statCard} testID={`admin-stat-card-${index}`}>
                <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                  <Text style={styles.statIconText}>{stat.icon}</Text>
                </View>
                {stat.loading ? (
                  <ActivityIndicator size="small" color={stat.color} />
                ) : stat.hasError ? (
                  <Text style={[styles.statValue, { color: '#dc2626' }]}>
                    Error
                  </Text>
                ) : (
                  <Text style={[styles.statValue, { color: stat.color }]}>
                    {stat.value}
                  </Text>
                )}
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.ledgerButton} 
            onPress={calculateLedger}
            testID="calculate-ledger-button"
          >
            <Text style={styles.ledgerButtonText}>🧮 Calculate Ledger for {selectedPeriod}</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Menu */}
        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>Administrative Functions</Text>
          <View style={styles.menuGrid}>
            {adminActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.menuCard}
                onPress={() => navigation.navigate(action.screen as any)}
                testID={`admin-menu-${action.id}`}
              >
                <View style={styles.menuIconContainer}>
                  <Text style={styles.menuIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.menuTitle}>{action.title}</Text>
                <Text style={styles.menuDescription}>{action.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* API Status */}
        <View style={styles.apiContainer}>
          <Text style={styles.sectionTitle}>API Status</Text>
          <View style={styles.apiCard}>
            <View style={styles.apiItem}>
              <Text style={styles.apiLabel}>Base URL:</Text>
              <Text style={styles.apiValue}>http://localhost:5000/api</Text>
            </View>
            <View style={styles.apiItem}>
              <Text style={styles.apiLabel}>Status:</Text>
              <Text style={[styles.apiValue, { color: '#22c55e' }]}>✅ Online</Text>
            </View>
            <View style={styles.apiItem}>
              <Text style={styles.apiLabel}>Authentication:</Text>
              <Text style={[styles.apiValue, { color: '#22c55e' }]}>✅ Active</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  userInfo: {
    fontSize: 14,
    color: '#475569',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
    padding: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  actionsContainer: {
    marginBottom: 32,
  },
  ledgerButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  ledgerButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  menuContainer: {
    marginBottom: 32,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#64748b',
  },
  apiContainer: {
    marginBottom: 32,
  },
  apiCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  apiItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  apiLabel: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  apiValue: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
});