import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import type { TransactionsScreenProps } from '../types/navigation';

export default function TransactionsScreen({ navigation }: TransactionsScreenProps) {
  const transactions = [
    {
      id: 1,
      profile: 'Mumbai Kings',
      type: 'credit',
      points: 2500,
      rate: 100,
      amount: 250000,
      commission: 12500,
      date: '2024-01-15',
      time: '14:30',
      status: 'completed'
    },
    {
      id: 2,
      profile: 'Chennai Express',
      type: 'debit',
      points: 1200,
      rate: 98,
      amount: 117600,
      commission: 3528,
      date: '2024-01-15',
      time: '12:15',
      status: 'completed'
    },
    {
      id: 3,
      profile: 'Delhi Daredevils',
      type: 'credit',
      points: 3800,
      rate: 96,
      amount: 364800,
      commission: 14592,
      date: '2024-01-14',
      time: '16:45',
      status: 'completed'
    },
    {
      id: 4,
      profile: 'Kolkata Knights',
      type: 'debit',
      points: 900,
      rate: 95,
      amount: 85500,
      commission: 1710,
      date: '2024-01-14',
      time: '10:20',
      status: 'pending'
    },
  ];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const TransactionCard = ({ transaction }: { transaction: any }) => (
    <TouchableOpacity 
      style={styles.transactionCard} 
      testID={`transaction-${transaction.id}`}
    >
      <View style={styles.transactionHeader}>
        <View>
          <Text style={styles.profileName}>{transaction.profile}</Text>
          <Text style={styles.transactionDate}>
            {transaction.date} • {transaction.time}
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
            <Text style={styles.detailValue}>{transaction.points.toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Rate</Text>
            <Text style={styles.detailValue}>₹{transaction.rate}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Amount</Text>
            <Text style={[styles.detailValue, styles.amountText]}>
              {formatAmount(transaction.amount)}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Commission</Text>
            <Text style={[styles.detailValue, styles.commissionText]}>
              {formatAmount(transaction.commission)}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Transactions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddTransaction')}
          testID="add-transaction-button"
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.transactionsList}>
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </View>
        
        {/* Load More Button */}
        <TouchableOpacity style={styles.loadMoreButton} testID="load-more-button">
          <Text style={styles.loadMoreText}>Load More Transactions</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
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
  loadMoreButton: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  loadMoreText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },
});