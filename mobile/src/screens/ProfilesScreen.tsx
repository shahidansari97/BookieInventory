import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import type { ProfilesScreenProps } from '../types/navigation';

export default function ProfilesScreen({ navigation }: ProfilesScreenProps) {
  const uplinks = [
    { id: 1, name: 'Premium Uplink', contact: '+91 9876543210', rate: '₹95/point', status: 'Active' },
    { id: 2, name: 'Elite Sports', contact: '+91 8765432109', rate: '₹92/point', status: 'Active' },
    { id: 3, name: 'Super Betting', contact: '+91 7654321098', rate: '₹90/point', status: 'Inactive' },
  ];

  const downlinks = [
    { id: 1, name: 'Mumbai Kings', contact: '+91 9988776655', rate: '₹100/point', commission: '5%', status: 'Active' },
    { id: 2, name: 'Chennai Express', contact: '+91 8877665544', rate: '₹98/point', commission: '3%', status: 'Active' },
    { id: 3, name: 'Delhi Daredevils', contact: '+91 7766554433', rate: '₹96/point', commission: '4%', status: 'Active' },
    { id: 4, name: 'Kolkata Knights', contact: '+91 6655443322', rate: '₹95/point', commission: '2%', status: 'Inactive' },
  ];

  const ProfileCard = ({ profile, type }: { profile: any; type: 'uplink' | 'downlink' }) => (
    <TouchableOpacity style={styles.profileCard} testID={`${type}-${profile.id}`}>
      <View style={styles.profileHeader}>
        <View>
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileContact}>{profile.contact}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: profile.status === 'Active' ? '#dcfce7' : '#fef2f2' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: profile.status === 'Active' ? '#16a34a' : '#dc2626' }
          ]}>
            {profile.status}
          </Text>
        </View>
      </View>
      
      <View style={styles.profileDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Rate</Text>
          <Text style={styles.detailValue}>{profile.rate}</Text>
        </View>
        {profile.commission && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Commission</Text>
            <Text style={styles.detailValue}>{profile.commission}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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