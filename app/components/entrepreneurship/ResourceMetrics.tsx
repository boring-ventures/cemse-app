import { useThemeColor } from '@/app/hooks/useThemeColor';
import { ResourceMetrics as ResourceMetricsType } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ResourceMetricsProps {
  metrics: ResourceMetricsType[];
  onMetricPress?: (metricId: string) => void;
}

export const ResourceMetrics: React.FC<ResourceMetricsProps> = ({
  metrics,
  onMetricPress,
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {metrics.map((metric, index) => (
          <TouchableOpacity
            key={metric.id}
            style={[
              styles.metricCard,
              {
                backgroundColor,
                borderColor: borderColor + '40',
                marginLeft: index === 0 ? 20 : 0,
                marginRight: index === metrics.length - 1 ? 20 : 12,
              }
            ]}
            onPress={() => onMetricPress?.(metric.id)}
            activeOpacity={0.7}
          >
            <View style={styles.metricContent}>
              <View style={[styles.iconContainer, { backgroundColor: metric.color + '20' }]}>
                <Ionicons 
                  name={metric.icon as any} 
                  size={24} 
                  color={metric.color} 
                />
              </View>
              
              <View style={styles.metricInfo}>
                <ThemedText style={[styles.metricValue, { color: textColor }]}>
                  {metric.value}
                </ThemedText>
                <ThemedText style={[styles.metricTitle, { color: secondaryTextColor }]}>
                  {metric.title}
                </ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  metricCard: {
    borderRadius: 16,
    borderWidth: 1,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricContent: {
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricInfo: {
    alignItems: 'center',
    gap: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 16,
  },
}); 