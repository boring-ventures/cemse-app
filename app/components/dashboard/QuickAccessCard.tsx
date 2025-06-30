import { useThemeColor } from '@/app/hooks/useThemeColor';
import { QuickAccessCard as QuickAccessCardType } from '@/app/types/dashboard';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface QuickAccessCardProps {
  card: QuickAccessCardType;
}

export const QuickAccessCard: React.FC<QuickAccessCardProps> = ({ card }) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  const handleActionPress = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={card.icon as any} size={24} color={iconColor} />
          </View>
          <View style={styles.titleTextContainer}>
            <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
              {card.title}
            </ThemedText>
            <ThemedText style={[styles.description, { color: secondaryTextColor }]}>
              {card.description}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Metrics */}
      <View style={styles.metricsContainer}>
        {card.metrics.map((metric, index) => (
          <View key={index} style={styles.metricItem}>
            <View style={[styles.metricDot, { backgroundColor: iconColor }]} />
            <ThemedText style={[styles.metricText, { color: secondaryTextColor }]}>
              {metric}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.actionsContainer}
        contentContainerStyle={styles.actionsContent}
      >
        {card.actions.map((action, index) => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.actionButton,
              action.variant === 'primary' ? 
                { backgroundColor: iconColor } : 
                { backgroundColor: backgroundColor, borderColor, borderWidth: 1 }
            ]}
            onPress={() => handleActionPress(action.action)}
            activeOpacity={0.7}
          >
            <ThemedText 
              style={[
                styles.actionButtonText,
                action.variant === 'primary' ? 
                  { color: '#FFFFFF' } : 
                  { color: iconColor }
              ]}
            >
              {action.title}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginVertical: 8,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 6,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    opacity: 0.8,
  },
  metricsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  metricText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginBottom: 0,
  },
  actionsContent: {
    paddingRight: 16,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 