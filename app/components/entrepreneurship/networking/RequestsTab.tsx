import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { ContactRequest } from '@/app/types/entrepreneurship';

interface RequestsTabProps {
  requests: ContactRequest[];
  onAccept: (requestId: string) => Promise<boolean>;
  onReject: (requestId: string) => Promise<boolean>;
  loading?: boolean;
  error?: string | null;
  refreshControl?: React.ReactElement<any>;
}

/**
 * Requests Tab Component
 * Manage incoming and outgoing contact requests
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const RequestsTab: React.FC<RequestsTabProps> = ({
  requests,
  onAccept,
  onReject,
  loading = false,
  error = null,
  refreshControl,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // State
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  // Handle accept request
  const handleAccept = async (request: ContactRequest) => {
    Alert.alert(
      'Aceptar solicitud',
      `¿Quieres aceptar la solicitud de conexión de ${request.senderName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Aceptar',
          onPress: async () => {
            setProcessingRequests(prev => new Set(prev).add(request.id));
            
            try {
              const success = await onAccept(request.id);
              if (success) {
                Alert.alert(
                  'Solicitud aceptada',
                  `Ahora estás conectado con ${request.senderName}`
                );
              }
            } finally {
              setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  // Handle reject request
  const handleReject = async (request: ContactRequest) => {
    Alert.alert(
      'Rechazar solicitud',
      `¿Estás seguro de que quieres rechazar la solicitud de ${request.senderName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequests(prev => new Set(prev).add(request.id));
            
            try {
              const success = await onReject(request.id);
              if (success) {
                Alert.alert(
                  'Solicitud rechazada',
                  'La solicitud ha sido rechazada'
                );
              }
            } finally {
              setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(request.id);
                return newSet;
              });
            }
          }
        }
      ]
    );
  };

  // Render request item
  const renderRequest = ({ item }: { item: ContactRequest }) => {
    const isProcessing = processingRequests.has(item.id);
    
    return (
      <View style={[styles.requestCard, { backgroundColor: cardBackground, borderColor }]}>
        {/* User Info */}
        <View style={styles.requestInfo}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {item.senderAvatar ? (
              <Image source={{ uri: item.senderAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: `${tintColor}20` }]}>
                <ThemedText style={[styles.avatarText, { color: tintColor }]}>
                  {item.senderName.split(' ').map((n: string) => n[0]).join('')}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.requestDetails}>
            <ThemedText style={styles.requestName}>
              {item.senderName}
            </ThemedText>
            
            {item.senderInstitution && (
              <ThemedText style={styles.requestInstitution} numberOfLines={1}>
                {item.senderInstitution}
              </ThemedText>
            )}

            {item.message && (
              <ThemedText style={styles.requestMessage} numberOfLines={2}>
                "{item.message}"
              </ThemedText>
            )}

            <View style={styles.requestMeta}>
              <Ionicons name="time" size={14} color={textColor} />
              <ThemedText style={styles.requestTime}>
                {new Date(item.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.requestActions}>
          {item.status === 'pending' ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.rejectButton,
                  { borderColor: '#ef4444', opacity: isProcessing ? 0.6 : 1 }
                ]}
                onPress={() => handleReject(item)}
                disabled={isProcessing}
              >
                <Ionicons name="close" size={16} color="#ef4444" />
                <ThemedText style={[styles.actionButtonText, { color: '#ef4444' }]}>
                  Rechazar
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.acceptButton,
                  { backgroundColor: tintColor, opacity: isProcessing ? 0.6 : 1 }
                ]}
                onPress={() => handleAccept(item)}
                disabled={isProcessing}
              >
                <Ionicons name="checkmark" size={16} color="white" />
                <ThemedText style={[styles.actionButtonText, { color: 'white' }]}>
                  Aceptar
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                {
                  backgroundColor: item.status === 'accepted' ? `${tintColor}20` : '#ef444420'
                }
              ]}>
                <Ionicons
                  name={item.status === 'accepted' ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={item.status === 'accepted' ? tintColor : '#ef4444'}
                />
                <ThemedText style={[
                  styles.statusText,
                  { color: item.status === 'accepted' ? tintColor : '#ef4444' }
                ]}>
                  {item.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Filter requests by status
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="mail-outline" size={64} color={textColor} />
      <ThemedText style={styles.emptyTitle}>
        No hay solicitudes
      </ThemedText>
      <ThemedText style={styles.emptyMessage}>
        Las solicitudes de conexión aparecerán aquí
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Solicitudes pendientes ({pendingRequests.length})
            </ThemedText>
          </View>
          <FlatList
            data={pendingRequests}
            renderItem={renderRequest}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {/* Processed Requests Section */}
      {processedRequests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              Historial ({processedRequests.length})
            </ThemedText>
          </View>
          <FlatList
            data={processedRequests}
            renderItem={renderRequest}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}

      {/* Empty state when no requests */}
      {requests.length === 0 && (
        <FlatList
          data={[]}
          renderItem={() => null}
          refreshControl={refreshControl}
          ListEmptyComponent={EmptyState}
          contentContainerStyle={styles.emptyContent}
        />
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  separator: {
    height: 16,
  },
  requestCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestInstitution: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    opacity: 0.9,
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 18,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestTime: {
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.7,
  },
  requestActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  actionButtons: {
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    minWidth: 100,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  acceptButton: {
    borderWidth: 0,
  },
  rejectButton: {
    backgroundColor: 'transparent',
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
});

export default RequestsTab;