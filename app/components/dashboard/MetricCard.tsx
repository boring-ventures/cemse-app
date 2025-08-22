import { useThemeColor } from '@/app/hooks/useThemeColor';
import { DashboardMetric } from '@/app/types/dashboard';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions } from 'react-native';
import { ThemedText } from '../ThemedText';

const { width } = Dimensions.get('window');

interface MetricCardProps {
  metric: DashboardMetric;
  onPress?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metric, onPress }) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  const getTrendColor = () => {
    switch (metric.trend) {
      case 'up':
        return useThemeColor({}, 'success');
      case 'down':
        return useThemeColor({}, 'error');
      default:
        return secondaryTextColor;
    }
  };

  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return 'trending-up-outline';
      case 'down':
        return 'trending-down-outline';
      default:
        return 'remove-outline';
    }
  };

  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      style={[
        styles.container,
        { backgroundColor, borderColor }
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.header}>
        <Ionicons name={metric.icon as any} size={24} color={iconColor} />
        {metric.trend && metric.trendValue && (
          <View style={styles.trendContainer}>
            <Ionicons 
              name={getTrendIcon() as any} 
              size={16} 
              color={getTrendColor()} 
            />
            <ThemedText 
              style={[styles.trendText, { color: getTrendColor() }]}
            >
              {metric.trendValue}
            </ThemedText>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <ThemedText 
          type="title" 
          style={[styles.value, { color: textColor }]}
        >
          {metric.value}
        </ThemedText>
        <ThemedText 
          style={[styles.title, { color: secondaryTextColor }]}
          numberOfLines={2}
        >
          {metric.title}
        </ThemedText>
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - 48 - 16) / 2, // 2 cards per row with proper spacing
    padding: 18, // Increased padding for mobile
    borderRadius: 16, // Larger border radius
    borderWidth: 1,
    margin: 8,
    minHeight: 120, // Increased height for better mobile experience
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Increased margin
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 3,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  value: {
    fontSize: 26, // Larger value for better readability
    fontWeight: 'bold',
    marginBottom: 6,
  },
  title: {
    fontSize: 13, // Slightly larger title
    fontWeight: '500',
    lineHeight: 16,
  },
}); 