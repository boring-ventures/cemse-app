import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Entrepreneur } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { AvailabilityIndicator } from './AvailabilityIndicator';
import { ConnectionButton } from './ConnectionButton';
import { ProfileBadge } from './ProfileBadge';
import { RatingDisplay } from './RatingDisplay';

interface EntrepreneurCardProps {
  entrepreneur: Entrepreneur;
  connectionStatus?: 'none' | 'pending' | 'connected' | 'declined';
  onPress?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

export const EntrepreneurCard: React.FC<EntrepreneurCardProps> = ({ 
  entrepreneur, 
  connectionStatus = 'none',
  onPress,
  onConnect,
  onMessage,
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatConnectionsCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor, borderColor: borderColor + '40' }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(entrepreneur.name) }]}>
              <ThemedText style={styles.avatarText}>
                {getInitials(entrepreneur.name)}
              </ThemedText>
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={[styles.name, { color: textColor }]}
                  numberOfLines={1}
                >
                  {entrepreneur.name}
                </ThemedText>
                
                <AvailabilityIndicator 
                  isOnline={entrepreneur.isOnline}
                  lastSeen={entrepreneur.lastSeen}
                  size="small"
                />
              </View>

              <ThemedText 
                style={[styles.company, { color: iconColor }]}
                numberOfLines={1}
              >
                {entrepreneur.company}
              </ThemedText>

              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color={secondaryTextColor} />
                <ThemedText style={[styles.location, { color: secondaryTextColor }]}>
                  {entrepreneur.location}
                </ThemedText>
                
                <RatingDisplay 
                  rating={entrepreneur.rating}
                  ratingCount={entrepreneur.ratingCount}
                  size="small"
                  showCount={false}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Description */}
        <ThemedText 
          style={[styles.description, { color: textColor }]}
          numberOfLines={3}
        >
          {entrepreneur.description}
        </ThemedText>

        {/* Skills Section */}
        <ProfileBadge 
          items={entrepreneur.skills}
          type="skills"
          title="Habilidades"
          icon="code-outline"
          maxVisible={3}
        />

        {/* Looking For Section */}
        <ProfileBadge 
          items={entrepreneur.lookingFor}
          type="lookingFor"
          title="Busca"
          icon="search-outline"
          maxVisible={2}
        />

        {/* Stats and Status */}
        <View style={styles.statsSection}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color={secondaryTextColor} />
              <ThemedText style={[styles.statText, { color: secondaryTextColor }]}>
                {formatConnectionsCount(entrepreneur.connections)} conexiones
              </ThemedText>
            </View>

            {entrepreneur.isAvailableForNetworking && (
              <View style={[styles.availabilityBadge, { backgroundColor: '#32D74B' + '20' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#32D74B" />
                <ThemedText style={[styles.availabilityText, { color: '#32D74B' }]}>
                  Disponible para networking
                </ThemedText>
              </View>
            )}
          </View>
        </View>

        {/* Connection Actions */}
        <ConnectionButton
          connectionStatus={connectionStatus}
          onConnect={onConnect}
          onMessage={onMessage}
          isAvailableForNetworking={entrepreneur.isAvailableForNetworking}
        />
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontSize: 18,
    flex: 1,
  },
  company: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  statsSection: {
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  availabilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  availabilityText: {
    fontSize: 11,
    fontWeight: '600',
  },
}); 