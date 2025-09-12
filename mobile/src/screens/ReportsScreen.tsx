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
import { ReportsScreenProps } from '../types/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';

export default function ReportsScreen({ navigation }: ReportsScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-09');
  const [selectedType, setSelectedType] = useState('summary');

  const { data: reports, isLoading, refetch } = useQuery({
    queryKey: ['reports', selectedPeriod, selectedType],
    queryFn: () => apiClient.getReports(selectedPeriod, selectedType),
  });

  const periods = ['2025-09', '2025-08', '2025-07'];
  const reportTypes = [
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💱' },
    { id: 'commissions', label: 'Commissions', icon: '💰' },
    { id: 'balances', label: 'Balances', icon: '⚖️' },
  ];

  const PeriodSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Period</Text>
      <View style={styles.selectorButtons}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.selectorButton,
              selectedPeriod === period && styles.selectorButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
            testID={`period-${period}`}
          >
            <Text style={[
              styles.selectorButtonText,
              selectedPeriod === period && styles.selectorButtonTextActive
            ]}>
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const TypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Report Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.typeButtons}>
          {reportTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.typeButton,
                selectedType === type.id && styles.typeButtonActive
              ]}
              onPress={() => setSelectedType(type.id)}
              testID={`report-type-${type.id}`}
            >
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={[
                styles.typeButtonText,
                selectedType === type.id && styles.typeButtonTextActive
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const ReportCard = ({ title, value, subtitle, color = '#3b82f6' }: any) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportTitle}>{title}</Text>
      <Text style={[styles.reportValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.reportSubtitle}>{subtitle}</Text>}
    </View>
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            style={styles.refreshButton}
            testID="refresh-reports"
          >
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <PeriodSelector />

        {/* Type Selector */}
        <TypeSelector />

        {/* Reports Content */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Generating reports...</Text>
            </View>
          ) : reports?.success ? (
            <View>
              {/* Summary Reports */}
              {selectedType === 'summary' && (
                <View style={styles.summaryContainer}>
                  <Text style={styles.sectionTitle}>Period Summary - {selectedPeriod}</Text>
                  <View style={styles.reportsGrid}>
                    <ReportCard
                      title="Total Revenue"
                      value={formatCurrency(reports.data?.totalRevenue || 0)}
                      subtitle="All transactions"
                      color="#22c55e"
                    />
                    <ReportCard
                      title="Total Commission"
                      value={formatCurrency(reports.data?.totalCommission || 0)}
                      subtitle="Commission earned"
                      color="#f59e0b"
                    />
                    <ReportCard
                      title="Active Profiles"
                      value={reports.data?.activeProfiles || 0}
                      subtitle="Trading profiles"
                      color="#3b82f6"
                    />
                    <ReportCard
                      title="Transaction Count"
                      value={reports.data?.transactionCount || 0}
                      subtitle="Total transactions"
                      color="#8b5cf6"
                    />
                  </View>
                </View>
              )}

              {/* Transaction Reports */}
              {selectedType === 'transactions' && (
                <View style={styles.transactionsContainer}>
                  <Text style={styles.sectionTitle}>Transaction Analysis</Text>
                  {reports.data?.transactions?.map((transaction: any, index: number) => (
                    <View key={index} style={styles.transactionCard}>
                      <View style={styles.transactionHeader}>
                        <Text style={styles.transactionProfile}>{transaction.profileName}</Text>
                        <Text style={[
                          styles.transactionType,
                          { color: transaction.type === 'credit' ? '#22c55e' : '#ef4444' }
                        ]}>
                          {transaction.type.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.transactionDetails}>
                        <Text style={styles.transactionAmount}>
                          {formatCurrency(transaction.amount)}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Commission Reports */}
              {selectedType === 'commissions' && (
                <View style={styles.commissionsContainer}>
                  <Text style={styles.sectionTitle}>Commission Breakdown</Text>
                  {reports.data?.commissions?.map((commission: any, index: number) => (
                    <View key={index} style={styles.commissionCard}>
                      <Text style={styles.commissionProfile}>{commission.profileName}</Text>
                      <View style={styles.commissionDetails}>
                        <Text style={styles.commissionRate}>{commission.rate}%</Text>
                        <Text style={styles.commissionAmount}>
                          {formatCurrency(commission.amount)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Balance Reports */}
              {selectedType === 'balances' && (
                <View style={styles.balancesContainer}>
                  <Text style={styles.sectionTitle}>Balance Overview</Text>
                  {reports.data?.balances?.map((balance: any, index: number) => (
                    <View key={index} style={styles.balanceCard}>
                      <Text style={styles.balanceProfile}>{balance.profileName}</Text>
                      <Text style={[
                        styles.balanceAmount,
                        { color: balance.amount >= 0 ? '#22c55e' : '#ef4444' }
                      ]}>
                        {formatCurrency(balance.amount)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📊</Text>
              <Text style={styles.emptyTitle}>No Reports Available</Text>
              <Text style={styles.emptySubtitle}>
                No data found for the selected period and report type
              </Text>
            </View>
          )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 20,
  },
  selectorContainer: {
    marginBottom: 20,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  selectorButtons: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  selectorButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  selectorButtonActive: {
    backgroundColor: '#3b82f6',
  },
  selectorButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  selectorButtonTextActive: {
    color: '#ffffff',
  },
  typeButtons: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  typeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  typeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  typeIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  contentContainer: {
    marginBottom: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  summaryContainer: {
    marginBottom: 32,
  },
  reportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportCard: {
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
  reportTitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  reportValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  reportSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  transactionsContainer: {
    marginBottom: 32,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  transactionProfile: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  transactionType: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  transactionDate: {
    fontSize: 14,
    color: '#64748b',
  },
  commissionsContainer: {
    marginBottom: 32,
  },
  commissionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  commissionProfile: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  commissionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commissionRate: {
    fontSize: 14,
    color: '#64748b',
  },
  commissionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  balancesContainer: {
    marginBottom: 32,
  },
  balanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  balanceProfile: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});