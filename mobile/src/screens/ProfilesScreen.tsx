import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { ProfilesScreenProps } from '../types/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';

export default function ProfilesScreen({ navigation }: ProfilesScreenProps) {
  const { data: profilesResponse, isLoading, refetch, error } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => apiClient.getProfiles(),
  });

  // Handle API response consistently
  const profiles = profilesResponse?.success ? profilesResponse.data : [];
  const hasError = !profilesResponse?.success || !!error;

  // Filter profiles by type
  const uplinks = profiles.filter((profile: any) => profile.type === 'uplink') || [];
  const downlinks = profiles.filter((profile: any) => profile.type === 'downlink') || [];

  const ProfileCard = ({ profile, type }: { profile: any; type: 'uplink' | 'downlink' }) => (
    <TouchableOpacity style={styles.profileCard} testID={`${type}-${profile.id}`}>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileContact}>{profile.phone || profile.contact || 'No contact'}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: profile.status === 'active' ? '#dcfce7' : '#fef2f2' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: profile.status === 'active' ? '#16a34a' : '#dc2626' }
          ]}>
            {profile.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>
      
      <View style={styles.profileDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>₹{profile.ratePerPoint}/point</Text>
        </View>
        {profile.commissionPercentage && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Commission</Text>
            <Text style={styles.detailValue}>{profile.commissionPercentage}%</Text>
          </View>
        )}
        {profile.email && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{profile.email}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profiles Management</Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            style={styles.refreshButton}
            testID="refresh-profiles"
          >
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Error State */}
        {hasError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>
              {profilesResponse?.error || 'Failed to load profiles'}
            </Text>
            <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading profiles...</Text>
          </View>
        ) : !hasError ? (
          <>
            {/* Uplinks Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Uplinks</Text>
                <Text style={styles.sectionCount}>({uplinks.length})</Text>
              </View>
          <Text style={styles.sectionDescription}>
            Your inventory suppliers with negotiated rates
          </Text>
          
          <View style={styles.profilesList}>
            {uplinks.map((uplink) => (
              <ProfileCard key={uplink.id} profile={uplink} type="uplink" />
            ))}
          </View>
          
          <TouchableOpacity style={styles.addButton} testID="add-uplink-button">
            <Text style={styles.addButtonText}>+ Add Uplink</Text>
          </TouchableOpacity>
        </View>

        {/* Downlinks Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Downlines</Text>
            <Text style={styles.sectionCount}>({downlinks.length})</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Your agents with commission structures
          </Text>
          
          <View style={styles.profilesList}>
            {downlinks.map((downlink) => (
              <ProfileCard key={downlink.id} profile={downlink} type="downlink" />
            ))}
          </View>
          
          <TouchableOpacity style={styles.addButton} testID="add-downlink-button">
            <Text style={styles.addButtonText}>+ Add Downline</Text>
          </TouchableOpacity>
        </View>
            </>
          )}

        {/* Empty State */}
        {!isLoading && profiles?.data?.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🏢</Text>
            <Text style={styles.emptyTitle}>No Profiles Found</Text>
            <Text style={styles.emptySubtitle}>
              No profiles configured. Add uplinks and downlines to start trading.
            </Text>
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sectionCount: {
    fontSize: 16,
    color: '#64748b',
    marginLeft: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  profilesList: {
    gap: 12,
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileContact: {
    fontSize: 14,
    color: '#64748b',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  profileDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 10,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  addButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
});