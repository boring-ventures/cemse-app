import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Mentor } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { AvailabilityIndicator } from './AvailabilityIndicator';
import { ProfileBadge } from './ProfileBadge';
import { RatingDisplay } from './RatingDisplay';

interface MentorCardProps {
  mentor: Mentor;
  onPress?: () => void;
  onMessage?: () => void;
  onSchedule?: () => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ 
  mentor, 
  onPress,
  onMessage,
  onSchedule,
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

  const handleMessage = () => {
    if (onMessage) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onMessage();
    }
  };

  const handleSchedule = () => {
    if (onSchedule) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSchedule();
    }
  };

  const getAvatarColor = (name: string) => {
    const professionalColors = ['#1E3A8A', '#7C2D12', '#065F46', '#7C2D12', '#1F2937', '#581C87', '#991B1B'];
    const index = name.charCodeAt(0) % professionalColors.length;
    return professionalColors[index];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatMenteeCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const getPricingDisplay = () => {
    if (mentor.pricing === 'Gratuito') {
      return {
        text: 'Gratuito',
        color: '#32D74B',
        bgColor: '#32D74B' + '20',
      };
    }
    return {
      text: mentor.pricing,
      color: '#FF9500',
      bgColor: '#FF9500' + '20',
    };
  };

  const pricingConfig = getPricingDisplay();

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
            {/* Avatar with Verification */}
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: getAvatarColor(mentor.name) }]}>
                <ThemedText style={styles.avatarText}>
                  {getInitials(mentor.name)}
                </ThemedText>
              </View>
              {mentor.isVerified && (
                <View style={styles.verificationBadge}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </View>

            {/* Profile Info */}
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={[styles.name, { color: textColor }]}
                  numberOfLines={1}
                >
                  {mentor.name}
                </ThemedText>
                
                <AvailabilityIndicator 
                  isOnline={mentor.isOnline}
                  lastSeen={mentor.lastSeen}
                  size="small"
                />
              </View>

              <ThemedText 
                style={[styles.title, { color: iconColor }]}
                numberOfLines={1}
              >
                {mentor.title}
              </ThemedText>

              <ThemedText 
                style={[styles.company, { color: secondaryTextColor }]}
                numberOfLines={1}
              >
                {mentor.company}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Rating and Stats */}
        <View style={styles.ratingSection}>
          <RatingDisplay 
            rating={mentor.rating}
            ratingCount={mentor.reviewCount}
            size="small"
            showCount={true}
          />
          
          <View style={styles.menteeStats}>
            <Ionicons name="people-outline" size={14} color={secondaryTextColor} />
            <ThemedText style={[styles.menteeText, { color: secondaryTextColor }]}>
              {formatMenteeCount(mentor.menteeCount)} mentees
            </ThemedText>
          </View>
        </View>

        {/* Description */}
        <ThemedText 
          style={[styles.description, { color: textColor }]}
          numberOfLines={3}
        >
          {mentor.description}
        </ThemedText>

        {/* Expertise Section */}
        <ProfileBadge 
          items={mentor.expertise}
          type="expertise"
          title="Expertise"
          icon="lightbulb-outline"
          maxVisible={3}
        />

        {/* Availability and Pricing */}
        <View style={styles.availabilitySection}>
          <View style={styles.responseTime}>
            <Ionicons name="time-outline" size={14} color={secondaryTextColor} />
            <ThemedText style={[styles.responseText, { color: secondaryTextColor }]}>
              Responde en: {mentor.responseTime}
            </ThemedText>
          </View>
          
          <View style={[styles.pricingBadge, { backgroundColor: pricingConfig.bgColor }]}>
            <ThemedText style={[styles.pricingText, { color: pricingConfig.color }]}>
              {pricingConfig.text}
            </ThemedText>
          </View>
        </View>

        {/* Achievements */}
        {mentor.achievements.length > 0 && (
          <ProfileBadge 
            items={mentor.achievements}
            type="achievements"
            title="Logros"
            icon="trophy-outline"
            maxVisible={2}
          />
        )}

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <ThemedButton
            title="Mensaje"
            onPress={handleMessage}
            type="outline"
            style={styles.messageButton}
          />
          
          <ThemedButton
            title="Agendar"
            onPress={handleSchedule}
            type="primary"
            style={styles.scheduleButton}
          />
        </View>
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
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
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
  verificationBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
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
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  company: {
    fontSize: 13,
    fontWeight: '500',
  },
  ratingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  menteeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  menteeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  availabilitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  responseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responseText: {
    fontSize: 12,
    fontWeight: '500',
  },
  pricingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pricingText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  messageButton: {
    flex: 1,
  },
  scheduleButton: {
    flex: 1,
  },
}); 