import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { AddUserScreenProps } from '../types/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';

export default function AddUserScreen({ navigation }: AddUserScreenProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'bookie' | 'assistant'>('assistant');
  
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => apiClient.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert(
        'Success', 
        'User created successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to create user');
    },
  });

  const validateForm = () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return false;
    }
    
    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return false;
    }
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      Alert.alert('Error', 'Password is required');
      return false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const userData = {
      username: username.trim(),
      email: email.trim() || undefined,
      password,
      role,
    };
    
    createUserMutation.mutate(userData);
  };

  const RoleSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>User Role</Text>
      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'assistant' && styles.roleButtonActive
          ]}
          onPress={() => setRole('assistant')}
          testID="role-assistant"
        >
          <Text style={styles.roleIcon}>👤</Text>
          <Text style={[
            styles.roleButtonText,
            role === 'assistant' && styles.roleButtonTextActive
          ]}>
            Assistant
          </Text>
          <Text style={styles.roleDescription}>Limited access</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.roleButton,
            role === 'bookie' && styles.roleButtonActive
          ]}
          onPress={() => setRole('bookie')}
          testID="role-bookie"
        >
          <Text style={styles.roleIcon}>👑</Text>
          <Text style={[
            styles.roleButtonText,
            role === 'bookie' && styles.roleButtonTextActive
          ]}>
            Bookie
          </Text>
          <Text style={styles.roleDescription}>Full access</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add New User</Text>
          <Text style={styles.headerSubtitle}>Create a new system user account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Username */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username *</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              autoCapitalize="none"
              autoComplete="username"
              testID="username-input"
            />
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email address"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              testID="email-input"
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password (min 6 characters)"
              secureTextEntry
              autoComplete="new-password"
              testID="password-input"
            />
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              secureTextEntry
              autoComplete="new-password"
              testID="confirm-password-input"
            />
          </View>

          {/* Role Selector */}
          <RoleSelector />

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              createUserMutation.isPending && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={createUserMutation.isPending}
            testID="create-user-button"
          >
            {createUserMutation.isPending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Create User</Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            testID="cancel-button"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesContainer}>
          <Text style={styles.guidelinesTitle}>User Guidelines</Text>
          <View style={styles.guidelinesList}>
            <Text style={styles.guideline}>• Username must be unique and at least 3 characters</Text>
            <Text style={styles.guideline}>• Password must be at least 6 characters long</Text>
            <Text style={styles.guideline}>• Assistants have limited system access</Text>
            <Text style={styles.guideline}>• Bookies have full administrative access</Text>
            <Text style={styles.guideline}>• Email is optional but recommended for notifications</Text>
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
  },
  header: {
    paddingVertical: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  roleButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  roleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  roleButtonTextActive: {
    color: '#3b82f6',
  },
  roleDescription: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  guidelinesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  guidelinesList: {
    paddingLeft: 8,
  },
  guideline: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 4,
  },
});