import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import type { AddTransactionScreenProps } from '../types/navigation';

export default function AddTransactionScreen({ navigation }: AddTransactionScreenProps) {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [transactionType, setTransactionType] = useState<'credit' | 'debit'>('credit');
  const [points, setPoints] = useState('');
  const [rate, setRate] = useState('');
  const [commission, setCommission] = useState('');

  const profiles = [
    'Mumbai Kings',
    'Chennai Express', 
    'Delhi Daredevils',
    'Kolkata Knights',
    'Rajasthan Royals'
  ];

  const calculateAmount = () => {
    const pointsNum = parseInt(points) || 0;
    const rateNum = parseInt(rate) || 0;
    return pointsNum * rateNum;
  };

  const calculateCommissionAmount = () => {
    const commissionNum = parseFloat(commission) || 0;
    return (calculateAmount() * commissionNum) / 100;
  };

  const handleSubmit = () => {
    if (!selectedProfile || !points || !rate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Here you would typically make an API call to save the transaction
    Alert.alert(
      'Success',
      'Transaction added successfully!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Transaction Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'credit' && styles.typeButtonActive
              ]}
              onPress={() => setTransactionType('credit')}
              testID="credit-type-button"
            >
              <Text style={[
                styles.typeButtonText,
                transactionType === 'credit' && styles.typeButtonTextActive
              ]}>
                Credit
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'debit' && styles.typeButtonActive
              ]}
              onPress={() => setTransactionType('debit')}
              testID="debit-type-button"
            >
              <Text style={[
                styles.typeButtonText,
                transactionType === 'debit' && styles.typeButtonTextActive
              ]}>
                Debit
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Profile *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.profileScroll}>
            <View style={styles.profileList}>
              {profiles.map((profile) => (
                <TouchableOpacity
                  key={profile}
                  style={[
                    styles.profileChip,
                    selectedProfile === profile && styles.profileChipActive
                  ]}
                  onPress={() => setSelectedProfile(profile)}
                  testID={`profile-${profile.replace(' ', '-').toLowerCase()}`}
                >
                  <Text style={[
                    styles.profileChipText,
                    selectedProfile === profile && styles.profileChipTextActive
                  ]}>
                    {profile}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Points *</Text>
            <TextInput
              style={styles.input}
              value={points}
              onChangeText={setPoints}
              placeholder="Enter points"
              keyboardType="numeric"
              testID="points-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Rate per Point (₹) *</Text>
            <TextInput
              style={styles.input}
              value={rate}
              onChangeText={setRate}
              placeholder="Enter rate"
              keyboardType="numeric"
              testID="rate-input"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Commission (%)</Text>
            <TextInput
              style={styles.input}
              value={commission}
              onChangeText={setCommission}
              placeholder="Enter commission percentage"
              keyboardType="numeric"
              testID="commission-input"
            />
          </View>
        </View>

        {/* Calculation Summary */}
        {points && rate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calculation Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Points:</Text>
                <Text style={styles.summaryValue}>{parseInt(points).toLocaleString()}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Rate:</Text>
                <Text style={styles.summaryValue}>₹{rate}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total Amount:</Text>
                <Text style={styles.summaryValuePrimary}>
                  ₹{calculateAmount().toLocaleString()}
                </Text>
              </View>
              
              {commission && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Commission ({commission}%):</Text>
                  <Text style={styles.summaryValueSecondary}>
                    ₹{calculateCommissionAmount().toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            testID="submit-transaction-button"
          >
            <Text style={styles.submitButtonText}>Add Transaction</Text>
          </TouchableOpacity>
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
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  typeButtonTextActive: {
    color: '#ffffff',
  },
  profileScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  profileList: {
    flexDirection: 'row',
    gap: 12,
  },
  profileChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
  },
  profileChipActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  profileChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  profileChipTextActive: {
    color: '#ffffff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  summaryValuePrimary: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#059669',
  },
  summaryValueSecondary: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3b82f6',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});