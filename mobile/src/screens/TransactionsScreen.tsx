import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { TransactionsScreenProps } from '../types/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';

export default function TransactionsScreen({ navigation }: TransactionsScreenProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: transactionsResponse, isLoading, refetch, error } = useQuery({
    queryKey: ['transactions', page],
    queryFn: () => apiClient.getTransactions(page, limit),
  });

  // Handle API response consistently
  const transactions = transactionsResponse?.success ? transactionsResponse.data.data : [];
  const pagination = transactionsResponse?.success ? transactionsResponse.data.pagination : null;
  const hasError = !transactionsResponse?.success || !!error;

  const formatAmount = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const TransactionCard = ({ transaction }: { transaction: any }) => {
    const formattedDate = formatDate(transaction.createdAt || transaction.date);
    
    return (
      <TouchableOpacity 
        style={styles.transactionCard} 
        testID={`transaction-${transaction.id}`}
      >
        <View style={styles.transactionHeader}>
          <View>
            <Text style={styles.profileName}>{transaction.profileName || transaction.profile}</Text>
            <Text style={styles.transactionDate}>
              {formattedDate.date} • {formattedDate.time}
            </Text>
          </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: transaction.status === 'completed' ? '#dcfce7' : '#fef3c7' }
          ]}>
            <Text style={[
              styles.statusText,
              { color: transaction.status === 'completed' ? '#16a34a' : '#d97706' }
            ]}>
              {transaction.status === 'completed' ? 'Completed' : 'Pending'}
            </Text>
          </View>
          
          <View style={[
            styles.typeBadge,
            { backgroundColor: transaction.type === 'credit' ? '#dbeafe' : '#fecaca' }
          ]}>
            <Text style={[
              styles.typeText,
              { color: transaction.type === 'credit' ? '#2563eb' : '#dc2626' }
            ]}>
              {transaction.type === 'credit' ? 'Credit' : 'Debit'}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Points</Text>
            <Text style={styles.detailValue}>{(transaction.points || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rate</Text>
            <Text style={styles.detailValue}>₹{transaction.rate || 0}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={[styles.detailValue, styles.amountText]}>
              {formatAmount(transaction.amount || 0)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Commission</Text>
            <Text style={[styles.detailValue, styles.commissionText]}>
              {formatAmount(transaction.commission || 0)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            style={styles.refreshButton}
            testID="refresh-transactions"
          >
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>
              {transactionsResponse?.error || 'Failed to load transactions'}
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : !hasError && transactions.length > 0 ? (
          <>
            <View style={styles.transactionsList}>
              {transactions.map((transaction) => (
                <TransactionCard key={transaction.id} transaction={transaction} />
              ))}
            </View>

            {/* Pagination Controls */}
            {pagination && (
              <View style={styles.paginationContainer}>
                <TouchableOpacity 
                  style={[styles.paginationButton, !pagination.hasPrevious && styles.paginationButtonDisabled]} 
                  onPress={() => pagination.hasPrevious && setPage(page - 1)}
                  disabled={!pagination.hasPrevious}
                  testID="prev-page"
                >
                  <Text style={[styles.paginationText, !pagination.hasPrevious && styles.paginationTextDisabled]}>
                    ← Previous
                  </Text>
                </TouchableOpacity>
                
                <Text style={styles.pageInfo}>
                  Page {pagination.page} of {Math.ceil(pagination.total / limit)}
                </Text>
                
                <TouchableOpacity 
                  style={[styles.paginationButton, !pagination.hasNext && styles.paginationButtonDisabled]} 
                  onPress={() => pagination.hasNext && setPage(page + 1)}
                  disabled={!pagination.hasNext}
                  testID="next-page"
                >
                  <Text style={[styles.paginationText, !pagination.hasNext && styles.paginationTextDisabled]}>
                    Next →
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : !hasError && transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptyText}>No transactions found for the selected period.</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    minWidth: 80,
  },
  paginationButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
  paginationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paginationTextDisabled: {
    color: '#9ca3af',
  },
  pageInfo: {
    color: '#6b7280',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  refreshButton: {
    padding: 8,
  },
  refreshText: {
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  transactionsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  transactionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  statusContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  transactionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  commissionText: {
    color: '#3b82f6',
  },
});