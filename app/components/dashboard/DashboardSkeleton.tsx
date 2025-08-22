import React from 'react';
import { View, StyleSheet } from 'react-native';
import Shimmer from '@/app/components/Shimmer';
import { useThemeColor } from '@/app/hooks/useThemeColor';

export const DashboardHeaderSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'card');
  const shimmerColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.headerContainer, { backgroundColor: '#667eea' }]}>
      <View style={styles.headerContent}>
        <Shimmer>
          <View style={[styles.titleSkeleton, { backgroundColor: 'rgba(255,255,255,0.3)' }]} />
        </Shimmer>
        <Shimmer>
          <View style={[styles.subtitleSkeleton, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
        </Shimmer>
      </View>
    </View>
  );
};

export const MetricCardSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const shimmerColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.metricCard, { backgroundColor, borderColor }]}>
      <View style={styles.metricCardContent}>
        <Shimmer>
          <View style={[styles.iconSkeleton, { backgroundColor: shimmerColor }]} />
        </Shimmer>
        <View style={styles.metricTextContainer}>
          <Shimmer>
            <View style={[styles.metricValueSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
          <Shimmer>
            <View style={[styles.metricTitleSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
        </View>
      </View>
    </View>
  );
};

export const QuickAccessCardSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'card');
  const shimmerColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.quickAccessCard, { backgroundColor }]}>
      <View style={styles.quickAccessHeader}>
        <Shimmer>
          <View style={[styles.quickAccessIconSkeleton, { backgroundColor: shimmerColor }]} />
        </Shimmer>
        <View style={styles.quickAccessTextContainer}>
          <Shimmer>
            <View style={[styles.quickAccessTitleSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
          <Shimmer>
            <View style={[styles.quickAccessDescSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
        </View>
      </View>
      
      <View style={styles.quickAccessMetrics}>
        {[1, 2, 3].map((item) => (
          <Shimmer key={item}>
            <View style={[styles.quickAccessMetricSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
        ))}
      </View>
      
      <View style={styles.quickAccessActions}>
        <Shimmer>
          <View style={[styles.primaryActionSkeleton, { backgroundColor: shimmerColor }]} />
        </Shimmer>
        <View style={styles.secondaryActions}>
          <Shimmer>
            <View style={[styles.secondaryActionSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
          <Shimmer>
            <View style={[styles.secondaryActionSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
        </View>
      </View>
    </View>
  );
};

export const NewsCardSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const shimmerColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.newsCard, { backgroundColor, borderColor }]}>
      <Shimmer>
        <View style={[styles.newsTypeSkeleton, { backgroundColor: shimmerColor }]} />
      </Shimmer>
      <Shimmer>
        <View style={[styles.newsTitleSkeleton, { backgroundColor: shimmerColor }]} />
      </Shimmer>
      <Shimmer>
        <View style={[styles.newsDateSkeleton, { backgroundColor: shimmerColor }]} />
      </Shimmer>
    </View>
  );
};

export const CVBuilderShortcutSkeleton: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const shimmerColor = useThemeColor({}, 'border');

  return (
    <View style={[styles.cvBuilderCard, { backgroundColor, borderColor }]}>
      <View style={styles.cvBuilderContent}>
        <Shimmer>
          <View style={[styles.cvBuilderIconSkeleton, { backgroundColor: shimmerColor }]} />
        </Shimmer>
        <View style={styles.cvBuilderTextContainer}>
          <Shimmer>
            <View style={[styles.cvBuilderTitleSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
          <Shimmer>
            <View style={[styles.cvBuilderDescSkeleton, { backgroundColor: shimmerColor }]} />
          </Shimmer>
        </View>
        <Shimmer>
          <View style={[styles.cvBuilderButtonSkeleton, { backgroundColor: shimmerColor }]} />
        </Shimmer>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Header Skeleton
  headerContainer: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  titleSkeleton: {
    width: 200,
    height: 28,
    borderRadius: 14,
    marginBottom: 8,
  },
  subtitleSkeleton: {
    width: 280,
    height: 16,
    borderRadius: 8,
  },

  // Metric Card Skeleton
  metricCard: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  metricTextContainer: {
    flex: 1,
  },
  metricValueSkeleton: {
    width: 40,
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
  },
  metricTitleSkeleton: {
    width: '80%',
    height: 14,
    borderRadius: 7,
  },

  // Quick Access Card Skeleton
  quickAccessCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  quickAccessHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  quickAccessIconSkeleton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  quickAccessTextContainer: {
    flex: 1,
  },
  quickAccessTitleSkeleton: {
    width: '60%',
    height: 20,
    borderRadius: 10,
    marginBottom: 6,
  },
  quickAccessDescSkeleton: {
    width: '90%',
    height: 14,
    borderRadius: 7,
  },
  quickAccessMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAccessMetricSkeleton: {
    width: '30%',
    height: 12,
    borderRadius: 6,
  },
  quickAccessActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryActionSkeleton: {
    width: 120,
    height: 36,
    borderRadius: 18,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionSkeleton: {
    width: 60,
    height: 32,
    borderRadius: 16,
  },

  // News Card Skeleton
  newsCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  newsTypeSkeleton: {
    width: 80,
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  newsTitleSkeleton: {
    width: '100%',
    height: 18,
    borderRadius: 9,
    marginBottom: 6,
  },
  newsDateSkeleton: {
    width: 100,
    height: 12,
    borderRadius: 6,
  },

  // CV Builder Shortcut Skeleton
  cvBuilderCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cvBuilderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cvBuilderIconSkeleton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },
  cvBuilderTextContainer: {
    flex: 1,
  },
  cvBuilderTitleSkeleton: {
    width: '70%',
    height: 22,
    borderRadius: 11,
    marginBottom: 8,
  },
  cvBuilderDescSkeleton: {
    width: '100%',
    height: 16,
    borderRadius: 8,
  },
  cvBuilderButtonSkeleton: {
    width: '100%',
    height: 48,
    borderRadius: 24,
  },
});