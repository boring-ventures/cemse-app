import { useThemeColor } from '@/app/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface AvailabilityIndicatorProps {
  isOnline: boolean;
  lastSeen?: string;
  responseTime?: string;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export const AvailabilityIndicator: React.FC<AvailabilityIndicatorProps> = ({
  isOnline,
  lastSeen,
  responseTime,
  size = 'medium',
  showText = false,
}) => {
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  const getStatusColor = () => {
    if (isOnline) return '#32D74B'; // Green for online
    if (lastSeen) {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffHours = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 1) return '#FF9500'; // Orange for recently active
      return '#8E8E93'; // Gray for offline
    }
    return '#8E8E93';
  };

  const getStatusText = () => {
    if (isOnline) return 'En línea';
    if (lastSeen) {
      const lastSeenDate = new Date(lastSeen);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
      
      if (diffMinutes < 60) {
        return `Hace ${diffMinutes} min`;
      }
      
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return `Hace ${diffHours}h`;
      }
      
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays}d`;
    }
    return 'Desconectado';
  };

  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { dotSize: 8, fontSize: 11 };
      case 'large':
        return { dotSize: 14, fontSize: 14 };
      case 'medium':
      default:
        return { dotSize: 10, fontSize: 12 };
    }
  };

  const { dotSize, fontSize } = getSizeConfig();
  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.statusDot,
          {
            width: dotSize,
            height: dotSize,
            backgroundColor: statusColor,
            borderRadius: dotSize / 2,
          },
        ]}
      />
      {showText && (
        <ThemedText style={[styles.statusText, { fontSize, color: secondaryTextColor }]}>
          {getStatusText()}
        </ThemedText>
      )}
      {responseTime && !showText && (
        <ThemedText style={[styles.responseTime, { fontSize, color: secondaryTextColor }]}>
          Responde en: {responseTime}
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontWeight: '500',
  },
  responseTime: {
    fontWeight: '500',
  },
}); 