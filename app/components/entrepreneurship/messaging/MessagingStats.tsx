import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { MessagingStats as MessagingStatsType } from '@/app/types/entrepreneurship';

interface MessagingStatsProps {
  stats: MessagingStatsType;
  onClose: () => void;
  visible?: boolean;
}

/**
 * Messaging Stats Component
 * Displays messaging statistics in a modal overlay
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const MessagingStats: React.FC<MessagingStatsProps> = ({
  stats,
  onClose,
  visible = true,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // Stats data
  const statsItems = [
    {
      id: 'conversations',
      title: 'Conversaciones',
      value: stats.totalConversations,
      icon: 'chatbubbles-outline',
      color: '#3b82f6',
      description: 'Total de conversaciones activas',
    },
    {
      id: 'unread',
      title: 'Sin leer',
      value: stats.unreadMessages,
      icon: 'mail-unread-outline',
      color: '#ef4444',
      description: 'Mensajes pendientes por leer',
    },
    {
      id: 'sent',
      title: 'Enviados',
      value: stats.totalMessagesSent,
      icon: 'send-outline',
      color: '#10b981',
      description: 'Mensajes que has enviado',
    },
    {
      id: 'received',
      title: 'Recibidos',
      value: stats.totalMessagesReceived,
      icon: 'download-outline',
      color: '#f59e0b',
      description: 'Mensajes que has recibido',
    },
  ];

  // Calculate additional metrics
  const totalMessages = stats.totalMessagesSent + stats.totalMessagesReceived;
  const averagePerConversation = stats.totalConversations > 0 
    ? Math.round(totalMessages / stats.totalConversations) 
    : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={[styles.container, { backgroundColor }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: borderColor }]}>
          <ThemedText style={styles.headerTitle}>Estadísticas de Mensajes</ThemedText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.content}>
          <View style={styles.statsGrid}>
            {statsItems.map((item) => (
              <View
                key={item.id}
                style={[styles.statCard, { backgroundColor: cardBackground, borderColor }]}
              >
                <View style={[styles.statIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.color}
                  />
                </View>
                
                <View style={styles.statContent}>
                  <ThemedText style={[styles.statValue, { color: item.color }]}>
                    {item.value.toLocaleString()}
                  </ThemedText>
                  <ThemedText style={styles.statTitle}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.statDescription}>
                    {item.description}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>

          {/* Additional Insights */}
          <View style={[styles.insightsCard, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText style={styles.insightsTitle}>Resumen de Actividad</ThemedText>
            
            <View style={styles.insightItem}>
              <View style={styles.insightIconContainer}>
                <Ionicons name="stats-chart" size={20} color={tintColor} />
              </View>
              <View style={styles.insightContent}>
                <ThemedText style={styles.insightLabel}>Total de mensajes</ThemedText>
                <ThemedText style={styles.insightValue}>
                  {totalMessages.toLocaleString()}
                </ThemedText>
              </View>
            </View>

            <View style={styles.insightItem}>
              <View style={styles.insightIconContainer}>
                <Ionicons name="calculator" size={20} color={tintColor} />
              </View>
              <View style={styles.insightContent}>
                <ThemedText style={styles.insightLabel}>Promedio por conversación</ThemedText>
                <ThemedText style={styles.insightValue}>
                  {averagePerConversation} mensajes
                </ThemedText>
              </View>
            </View>

            {stats.unreadMessages > 0 && (
              <View style={styles.insightItem}>
                <View style={styles.insightIconContainer}>
                  <Ionicons name="time" size={20} color="#f59e0b" />
                </View>
                <View style={styles.insightContent}>
                  <ThemedText style={styles.insightLabel}>Mensajes pendientes</ThemedText>
                  <ThemedText style={[styles.insightValue, { color: '#f59e0b' }]}>
                    {stats.unreadMessages} sin leer
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* Engagement Tips */}
          <View style={[styles.tipsCard, { backgroundColor: `${tintColor}10`, borderColor: tintColor }]}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color={tintColor} />
              <ThemedText style={[styles.tipsTitle, { color: tintColor }]}>
                Consejos para mejorar tu networking
              </ThemedText>
            </View>
            
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <ThemedText style={styles.tipBullet}>•</ThemedText>
                <ThemedText style={styles.tipText}>
                  Responde a los mensajes dentro de las primeras 24 horas
                </ThemedText>
              </View>
              
              <View style={styles.tipItem}>
                <ThemedText style={styles.tipBullet}>•</ThemedText>
                <ThemedText style={styles.tipText}>
                  Inicia conversaciones con preguntas específicas sobre emprendimiento
                </ThemedText>
              </View>
              
              <View style={styles.tipItem}>
                <ThemedText style={styles.tipBullet}>•</ThemedText>
                <ThemedText style={styles.tipText}>
                  Comparte recursos y experiencias que puedan ayudar a otros
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      </ThemedView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
  insightsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  insightIconContainer: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  insightValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  tipsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsList: {
    gap: 8,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default MessagingStats;