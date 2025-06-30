import { useThemeColor } from '@/app/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ProgressBarProps {
  progress: number; // 0-100
  height?: number;
  showLabel?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  showLabel = true,
  color
}) => {
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const defaultColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  
  const progressColor = color || defaultColor;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <View style={styles.container}>
      <View style={[
        styles.track,
        {
          backgroundColor,
          height,
        }
      ]}>
        <View style={[
          styles.fill,
          {
            width: `${clampedProgress}%`,
            backgroundColor: progressColor,
            height,
          }
        ]} />
      </View>
      {showLabel && (
        <ThemedText style={[styles.label, { color: textColor }]}>
          {Math.round(clampedProgress)}%
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  track: {
    flex: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 4,
  },
  label: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
  },
}); 