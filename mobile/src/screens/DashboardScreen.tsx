import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import type { DashboardScreenProps } from '../types/navigation';
import { apiClient } from '../utils/api';
import { useAuth } from '../../App';

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // Navigation happens automatically via auth context state change
  };

  const metricsData = [
    { title: 'Total Profiles', value: '24', icon: '👥', color: '#3b82f6' },
    { title: 'Active Transactions', value: '12', icon: '💱', color: '#10b981' },
    { title: 'Weekly P&L', value: '+₹5,240', icon: '📈', color: '#f59e0b' },
    { title: 'Pending Settlements', value: '3', icon: '📤', color: '#ef4444' },
  ];

  const recentTransactions = [
    { id: 1, profile: 'Mumbai Kings', type: 'Credit', amount: '+₹2,500', time: '2 hours ago' },
    { id: 2, profile: 'Chennai Express', type: 'Debit', amount: '-₹1,200', time: '4 hours ago' },
    { id: 3, profile: 'Delhi Daredevils', type: 'Credit', amount: '+₹3,800', time: '6 hours ago' },
    { id: 4, profile: 'Kolkata Knights', type: 'Debit', amount: '-₹900', time: '8 hours ago' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.headerTitle}>Dashboard Overview</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} testID="logout-button">
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Metrics Cards */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            {metricsData.map((metric, index) => (
              <View key={index} style={styles.metricCard} testID={`metric-card-${index}`}>
                <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
                  <Text style={styles.metricIconText}>{metric.icon}</Text>
                </View>
                <Text style={[styles.metricValue, { color: metric.color }]}>
                  {metric.value}
                </Text>
                <Text style={styles.metricTitle}>{metric.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Transactions')}
              testID="view-all-transactions-button"
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.transactionItem} testID={`transaction-${transaction.id}`}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionProfile}>{transaction.profile}</Text>
                  <Text style={styles.transactionTime}>{transaction.time}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text 
                    style={[
                      styles.transactionAmountText,
                      { color: transaction.type === 'Credit' ? '#10b981' : '#ef4444' }
                    ]}
                  >
                    {transaction.amount}
                  </Text>
                  <Text style={styles.transactionType}>{transaction.type}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Transactions')}
              testID="add-transaction-button"
            >
              <Text style={styles.actionButtonIcon}>💱</Text>
              <Text style={styles.actionButtonText}>Add Transaction</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Profiles')}
              testID="manage-profiles-button"
            >
              <Text style={styles.actionButtonIcon}>👥</Text>
              <Text style={styles.actionButtonText}>Manage Profiles</Text>
            </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    width: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  metricIconText: {
    fontSize: 20,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsList: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionProfile: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 12,
    color: '#64748b',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
    textAlign: 'center',
  },
});