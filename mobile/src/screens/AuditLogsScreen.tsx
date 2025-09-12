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
import { AuditLogsScreenProps } from '../types/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../utils/api';

export default function AuditLogsScreen({ navigation }: AuditLogsScreenProps) {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: auditLogs, isLoading, refetch } = useQuery({
    queryKey: ['auditLogs', page],
    queryFn: () => apiClient.getAuditLogs(page, limit),
  });

  const getActionColor = (action: string) => {
    const colors = {
      CREATE: '#22c55e',
      UPDATE: '#f59e0b',
      DELETE: '#ef4444',
      LOGIN: '#3b82f6',
      CALCULATE: '#8b5cf6',
    };
    return colors[action as keyof typeof colors] || '#64748b';
  };

  const getActionIcon = (action: string) => {
    const icons = {
      CREATE: '✅',
      UPDATE: '✏️',
      DELETE: '❌',
      LOGIN: '🔐',
      CALCULATE: '🧮',
    };
    return icons[action as keyof typeof icons] || '📝';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('en-IN'),
      time: date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };
  };

  const AuditLogCard = ({ log }: { log: any }) => {
    const timestamp = formatTimestamp(log.createdAt);
    
    return (
      <View style={styles.logCard} testID={`audit-log-${log.id}`}>
        <View style={styles.logHeader}>
          <View style={styles.actionContainer}>
            <Text style={styles.actionIcon}>{getActionIcon(log.action)}</Text>
            <View style={[
              styles.actionBadge,
              { backgroundColor: `${getActionColor(log.action)}20` }
            ]}>
              <Text style={[
                styles.actionText,
                { color: getActionColor(log.action) }
              ]}>
                {log.action}
              </Text>
            </View>
          </View>
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampDate}>{timestamp.date}</Text>
            <Text style={styles.timestampTime}>{timestamp.time}</Text>
          </View>
        </View>

        <View style={styles.logContent}>
          <View style={styles.logRow}>
            <Text style={styles.logLabel}>User:</Text>
            <Text style={styles.logValue}>{log.userId || 'System'}</Text>
          </View>

          <View style={styles.logRow}>
            <Text style={styles.logLabel}>Resource:</Text>
            <Text style={styles.logValue}>{log.resource}</Text>
          </View>

          {log.resourceId && (
            <View style={styles.logRow}>
              <Text style={styles.logLabel}>Resource ID:</Text>
              <Text style={styles.logValue}>{log.resourceId}</Text>
            </View>
          )}

          {log.details && (
            <View style={styles.logRow}>
              <Text style={styles.logLabel}>Details:</Text>
              <Text style={styles.logDetailsValue}>{log.details}</Text>
            </View>
          )}

          <View style={styles.logRow}>
            <Text style={styles.logLabel}>IP Address:</Text>
            <Text style={styles.logValue}>{log.ipAddress || 'Unknown'}</Text>
          </View>
        </View>
      </View>
    );
  };

  const loadMore = () => {
    if (auditLogs?.data?.pagination?.hasNext) {
      setPage(prev => prev + 1);
    }
  };

  const loadPrevious = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Audit Trail</Text>
          <TouchableOpacity 
            onPress={() => refetch()} 
            style={styles.refreshButton}
            testID="refresh-audit-logs"
          >
            <Text style={styles.refreshText}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        {auditLogs?.data?.pagination && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{auditLogs.data.pagination.total}</Text>
              <Text style={styles.statLabel}>Total Logs</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>Page {auditLogs.data.pagination.page}</Text>
              <Text style={styles.statLabel}>of {auditLogs.data.pagination.totalPages}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{auditLogs.data.data.length}</Text>
              <Text style={styles.statLabel}>This Page</Text>
            </View>
          </View>
        )}

        {/* Audit Logs */}
        <View style={styles.contentContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text style={styles.loadingText}>Loading audit logs...</Text>
            </View>
          ) : auditLogs?.success && auditLogs.data?.data?.length > 0 ? (
            <View>
              <Text style={styles.sectionTitle}>
                System Activity Log
              </Text>
              {auditLogs.data.data.map((log: any, index: number) => (
                <AuditLogCard key={log.id || index} log={log} />
              ))}

              {/* Pagination */}
              <View style={styles.paginationContainer}>
                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    page === 1 && styles.paginationButtonDisabled
                  ]}
                  onPress={loadPrevious}
                  disabled={page === 1}
                  testID="audit-previous-page"
                >
                  <Text style={[
                    styles.paginationButtonText,
                    page === 1 && styles.paginationButtonTextDisabled
                  ]}>
                    ← Previous
                  </Text>
                </TouchableOpacity>

                <Text style={styles.paginationInfo}>
                  Page {page} of {auditLogs.data.pagination.totalPages}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.paginationButton,
                    !auditLogs.data.pagination.hasNext && styles.paginationButtonDisabled
                  ]}
                  onPress={loadMore}
                  disabled={!auditLogs.data.pagination.hasNext}
                  testID="audit-next-page"
                >
                  <Text style={[
                    styles.paginationButtonText,
                    !auditLogs.data.pagination.hasNext && styles.paginationButtonTextDisabled
                  ]}>
                    Next →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>📝</Text>
              <Text style={styles.emptyTitle}>No Audit Logs</Text>
              <Text style={styles.emptySubtitle}>
                No system activity logs found
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
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
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
    fontSize: 16,
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
  logCard: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  actionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestampContainer: {
    alignItems: 'flex-end',
  },
  timestampDate: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  timestampTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  logContent: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  logRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  logLabel: {
    fontSize: 14,
    color: '#64748b',
    width: 80,
    marginRight: 12,
  },
  logValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
    fontWeight: '500',
  },
  logDetailsValue: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 18,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  paginationButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  paginationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  paginationButtonTextDisabled: {
    color: '#94a3b8',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#64748b',
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
  },
});