import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { ContactStats } from '@/app/types/entrepreneurship';

interface NetworkingStatsProps {
  stats: ContactStats;
  style?: ViewStyle;
}

/**
 * Networking Stats Component
 * Displays networking statistics in a compact card format
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const NetworkingStats: React.FC<NetworkingStatsProps> = ({
  stats,
  style,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // Stats configuration
  const statsItems = [
    {
      id: 'contacts',
      title: 'Contactos',
      value: stats.totalContacts,
      icon: 'people',
      color: '#10b981',
      description: 'Conexiones activas',
    },
    {
      id: 'pendingReceived',
      title: 'Recibidas',
      value: stats.pendingReceived,
      icon: 'mail',
      color: '#3b82f6',
      description: 'Solicitudes pendientes',
    },
    {
      id: 'pendingSent',
      title: 'Enviadas',
      value: stats.pendingSent,
      icon: 'send',
      color: '#f59e0b',
      description: 'Solicitudes enviadas',
    },
    {
      id: 'totalRequests',
      title: 'Total',
      value: stats.totalRequests,
      icon: 'swap-horizontal',
      color: '#8b5cf6',
      description: 'Solicitudes totales',
    },
  ];

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground, borderColor }, style]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="stats-chart" size={20} color={tintColor} />
          <ThemedText style={styles.title}>Estadísticas de Red</ThemedText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        {statsItems.map((item) => (
          <View key={item.id} style={styles.statItem}>
            <View style={[styles.statIcon, { backgroundColor: `${item.color}15` }]}>
              <Ionicons
                name={item.icon as any}
                size={16}
                color={item.color}
              />
            </View>
            
            <View style={styles.statContent}>
              <ThemedText style={[styles.statValue, { color: item.color }]}>
                {item.value}
              </ThemedText>
              <ThemedText style={styles.statTitle}>
                {item.title}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Progress indicator */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText style={styles.progressTitle}>Progreso de red</ThemedText>
          <ThemedText style={styles.progressPercent}>
            {Math.round((stats.totalContacts / Math.max(stats.totalContacts + stats.pendingReceived + stats.pendingSent, 1)) * 100)}%
          </ThemedText>
        </View>
        
        <View style={[styles.progressBar, { backgroundColor: `${tintColor}20` }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: tintColor,
                width: `${Math.round((stats.totalContacts / Math.max(stats.totalContacts + stats.pendingReceived + stats.pendingSent, 1)) * 100)}%`,
              }
            ]}
          />
        </View>
        
        <ThemedText style={styles.progressDescription}>
          {stats.totalContacts > 0 
            ? `Tienes ${stats.totalContacts} conexión${stats.totalContacts !== 1 ? 'es' : ''} activa${stats.totalContacts !== 1 ? 's' : ''}`
            : 'Comienza a construir tu red de contactos'
          }
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  progressSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default NetworkingStats;