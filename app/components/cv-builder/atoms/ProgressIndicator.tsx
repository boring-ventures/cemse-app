/**
 * Progress Indicator Atom
 * Animated progress bar for CV completion status
 */

import { useThemeColor } from '@/app/hooks/useThemeColor';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  height?: number;
  animated?: boolean;
}

export const ProgressIndicator = React.memo<ProgressIndicatorProps>(({
  progress,
  label,
  showPercentage = true,
  height = 8,
  animated = true,
}) => {
  const progressValue = useSharedValue(0);
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  
  // Animate progress when it changes
  useEffect(() => {
    if (animated) {
      progressValue.value = withSpring(progress / 100, {
        damping: 15,
        stiffness: 150,
      });
    } else {
      progressValue.value = progress / 100;
    }
  }, [progress, animated, progressValue]);
  
  // Animated styles
  const progressBarStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressValue.value,
      [0, 1],
      [0, 100],
      Extrapolate.CLAMP
    );
    
    return {
      width: `${width}%`,
    };
  });
  
  // Dynamic color based on progress
  const getProgressColor = (progressPercent: number): string => {
    if (progressPercent < 25) return '#FF3B30'; // Red
    if (progressPercent < 50) return '#FF9500'; // Orange
    if (progressPercent < 75) return '#FFCC02'; // Yellow
    return '#34C759'; // Green
  };
  
  const progressColor = getProgressColor(progress);
  
  const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    labelContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: label ? 8 : 0,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: textColor,
    },
    percentage: {
      fontSize: 14,
      fontWeight: '600',
      color: progressColor,
    },
    progressBarContainer: {
      height: height,
      backgroundColor: borderColor,
      borderRadius: height / 2,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      backgroundColor: progressColor,
      borderRadius: height / 2,
    },
    progressSteps: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    stepIndicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: borderColor,
    },
    stepIndicatorActive: {
      backgroundColor: progressColor,
    },
  });
  
  // Progress steps for visual feedback
  const steps = [0, 25, 50, 75, 100];
  
  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && (
            <Text style={styles.label}>
              {label}
            </Text>
          )}
          {showPercentage && (
            <Text style={styles.percentage}>
              {Math.round(progress)}%
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.progressBarContainer}>
        <Animated.View style={[styles.progressBar, progressBarStyle]} />
      </View>
      
      {/* Progress steps indicators */}
      <View style={styles.progressSteps}>
        {steps.map((step, index) => (
          <View
            key={step}
            style={[
              styles.stepIndicator,
              progress >= step && styles.stepIndicatorActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';