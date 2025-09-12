import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SettlementScreenProps } from '../types/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';

export default function SettlementScreen({ navigation }: SettlementScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('2025-09');

  const { data: ledgerEntries, isLoading, refetch } = useQuery({
    queryKey: ['ledger', selectedPeriod],
    queryFn: () => apiClient.getLedgerEntries(selectedPeriod),
  });

  const periods = ['2025-09', '2025-08', '2025-07'];

  const calculateLedger = async () => {
    try {
      const response = await apiClient.calculateLedger(selectedPeriod);
      if (response.success) {
        Alert.alert('Success', 'Ledger calculated successfully');
        refetch();
      } else {
        Alert.alert('Error', response.error || 'Failed to calculate ledger');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate ledger');
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled': return '#22c55e';
      case 'pending': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getBalanceColor = (balance: string | number) => {
    const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    return numBalance >= 0 ? '#22c55e' : '#ef4444';
  };

  const PeriodSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>Settlement Period</Text>
      <View style={styles.selectorButtons}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.selectorButton,
              selectedPeriod === period && styles.selectorButtonActive
            ]}
            onPress={() => setSelectedPeriod(period)}
            testID={`settlement-period-${period}`}
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

  const SettlementCard = ({ entry }: { entry: any }) => (
    <View style={styles.settlementCard}>
      <View style={styles.settlementHeader}>
        <Text style={styles.profileName}>{entry.profileName || entry.profileId}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: `${getStatusColor(entry.status)}20` }
        ]}>
          <Text style={[
            styles.statusText,
            { color: getStatusColor(entry.status) }
          ]}>
            {entry.status?.toUpperCase() || 'PENDING'}
          </Text>
        </View>
      </View>

      <View style={styles.settlementDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total Points:</Text>
          <Text style={styles.detailValue}>{entry.totalPoints || 0}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Average Rate:</Text>
          <Text style={styles.detailValue}>₹{entry.averageRate || '0.00'}</Text>
        </View>

        {entry.commission && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Commission:</Text>
            <Text style={styles.detailValue}>{formatCurrency(entry.commission)}</Text>
          </View>
        )}

        <View style={[styles.detailRow, styles.balanceRow]}>
          <Text style={styles.detailLabel}>Net Balance:</Text>
          <Text style={[
            styles.balanceValue,
            { color: getBalanceColor(entry.balance) }
          ]}>
            {formatCurrency(entry.balance)}
          </Text>
        </View>
      </View>

      <View style={styles.settlementFooter}>
        <Text style={styles.periodText}>Period: {entry.period}</Text>
        <TouchableOpacity 
          style={styles.messageButton}
          testID={`settlement-message-${entry.id}`}
        >
          <Text style={styles.messageButtonText}>📱 Send WhatsApp</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settlement Management</Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            style={styles.refreshButton}
            testID="refresh-settlement"
          >
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Period Selector */}
        <PeriodSelector />

        {/* Calculate Ledger Button */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.calculateButton} 
            onPress={calculateLedger}
            testID="calculate-settlement-button"
          >
            <Text style={styles.calculateButtonText}>🧮 Calculate Ledger for {selectedPeriod}</Text>
          </TouchableOpacity>
        </View>

        {/* Settlement Entries */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading settlements...</Text>
            </View>
          ) : ledgerEntries?.success && ledgerEntries.data?.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>
                Settlement Entries ({ledgerEntries.data.length})
              </Text>
              {ledgerEntries.data.map((entry: any, index: number) => (
                <SettlementCard key={entry.id || index} entry={entry} />
              ))}
              
              {/* Summary */}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryTitle}>Settlement Summary</Text>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Entries:</Text>
                    <Text style={styles.summaryValue}>{ledgerEntries.data.length}</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Pending:</Text>
                    <Text style={styles.summaryValue}>
                      {ledgerEntries.data.filter((e: any) => e.status === 'pending').length}
                    </Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Settled:</Text>
                    <Text style={styles.summaryValue}>
                      {ledgerEntries.data.filter((e: any) => e.status === 'settled').length}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>💰</Text>
              <Text style={styles.emptyTitle}>No Settlements Found</Text>
              <Text style={styles.emptySubtitle}>
                No settlement entries for {selectedPeriod}. Calculate the ledger to generate settlements.
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
  actionContainer: {
    marginBottom: 24,
  },
  calculateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  settlementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settlementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  settlementDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  balanceRow: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    marginTop: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settlementFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  messageButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  messageButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  summaryContainer: {
    marginTop: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
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
    paddingHorizontal: 32,
  },
});