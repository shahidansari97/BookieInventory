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
import { UsersScreenProps } from '../types/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';

export default function UsersScreen({ navigation }: UsersScreenProps) {
  const queryClient = useQueryClient();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.getUsers(),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => apiClient.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert('Success', 'User deleted successfully');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Failed to delete user');
    },
  });

  const handleDeleteUser = (user: any) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete user "${user.username}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteUserMutation.mutate(user.id),
        },
      ]
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'bookie': return '#3b82f6';
      case 'assistant': return '#22c55e';
      default: return '#64748b';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'bookie': return '👑';
      case 'assistant': return '👤';
      default: return '❓';
    }
  };

  const UserCard = ({ user }: { user: any }) => (
    <View style={styles.userCard} testID={`user-card-${user.id}`}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userIcon}>{getRoleIcon(user.role)}</Text>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.username}</Text>
            <Text style={styles.userEmail}>{user.email || 'No email'}</Text>
          </View>
        </View>
        <View style={[
          styles.roleBadge,
          { backgroundColor: `${getRoleColor(user.role)}20` }
        ]}>
          <Text style={[
            styles.roleText,
            { color: getRoleColor(user.role) }
          ]}>
            {user.role?.toUpperCase() || 'USER'}
          </Text>
        </View>
      </View>

      <View style={styles.userMeta}>
        <Text style={styles.metaText}>
          Created: {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN')}
        </Text>
        {user.lastLogin && (
          <Text style={styles.metaText}>
            Last Login: {new Date(user.lastLogin).toLocaleDateString('en-IN')}
          </Text>
        )}
      </View>

      <View style={styles.userActions}>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => {
            // Navigate to edit user screen (could be implemented)
            Alert.alert('Info', 'Edit user functionality can be implemented');
          }}
          testID={`edit-user-${user.id}`}
        >
          <Text style={styles.editButtonText}>✏️ Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(user)}
          disabled={deleteUserMutation.isPending}
          testID={`delete-user-${user.id}`}
        >
          {deleteUserMutation.isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const userStats = {
    total: users?.data?.length || 0,
    bookies: users?.data?.filter((u: any) => u.role === 'bookie').length || 0,
    assistants: users?.data?.filter((u: any) => u.role === 'assistant').length || 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>User Management</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              onPress={() => refetch()} 
              style={styles.refreshButton}
              testID="refresh-users"
            >
              <Text style={styles.refreshText}>🔄</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => navigation.navigate('AddUser')}
              testID="add-user-button"
            >
              <Text style={styles.addButtonText}>➕ Add User</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.total}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.bookies}</Text>
            <Text style={styles.statLabel}>Bookies</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.assistants}</Text>
            <Text style={styles.statLabel}>Assistants</Text>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : users?.success && users.data?.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>
                System Users ({users.data.length})
              </Text>
              {users.data.map((user: any, index: number) => (
                <UserCard key={user.id || index} user={user} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>👥</Text>
              <Text style={styles.emptyTitle}>No Users Found</Text>
              <Text style={styles.emptySubtitle}>
                No users in the system. Add a new user to get started.
              </Text>
              <TouchableOpacity 
                style={styles.emptyAddButton}
                onPress={() => navigation.navigate('AddUser')}
                testID="empty-add-user-button"
              >
                <Text style={styles.emptyAddButtonText}>Add First User</Text>
              </TouchableOpacity>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 12,
  },
  refreshText: {
    fontSize: 20,
  },
  addButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
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
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  userMeta: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  metaText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
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
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyAddButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});