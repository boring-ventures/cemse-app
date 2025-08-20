import React, { useEffect } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { CollapsibleSectionProps } from '@/app/types/cv';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

/**
 * Collapsible Section Component
 * Mobile-optimized collapsible sections for CV Manager
 * Features: Smooth animations, touch-friendly interactions, accessibility support
 */

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  isCollapsed,
  onToggle,
  children,
  icon,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardColor = useThemeColor({}, 'card');

  // Animation values
  const rotation = useSharedValue(isCollapsed ? 0 : 180);
  const contentOpacity = useSharedValue(isCollapsed ? 0 : 1);
  const contentHeight = useSharedValue(isCollapsed ? 0 : 1);

  // Update animation values when collapsed state changes
  useEffect(() => {
    // Configure layout animation for smooth height transitions
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleY,
      },
    });

    rotation.value = withTiming(isCollapsed ? 0 : 180, { duration: 300 });
    contentOpacity.value = withTiming(isCollapsed ? 0 : 1, { duration: 300 });
    contentHeight.value = withTiming(isCollapsed ? 0 : 1, { duration: 300 });
  }, [isCollapsed, rotation, contentOpacity, contentHeight]);

  // Animated styles
  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      {
        scaleY: interpolate(contentHeight.value, [0, 1], [0.8, 1]),
      },
    ],
  }));

  const handlePress = () => {
    onToggle();
  };

  return (
    <ThemedView style={[styles.container, { borderColor }]}>
      {/* Header */}
      <Pressable
        style={[
          styles.header,
          { backgroundColor: cardColor || backgroundColor },
          isCollapsed && styles.headerCollapsed,
        ]}
        onPress={handlePress}
        android_ripple={{ color: tintColor, borderless: false }}
      >
        <View style={styles.headerContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <ThemedText style={[styles.title, { color: textColor }]}>{title}</ThemedText>
        </View>
        
        <Animated.View style={arrowAnimatedStyle}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={tintColor}
            style={styles.arrow}
          />
        </Animated.View>
      </Pressable>

      {/* Content */}
      {!isCollapsed && (
        <Animated.View
          style={[
            styles.content,
            { backgroundColor: cardColor || backgroundColor },
            contentAnimatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    minHeight: 56,
  },
  headerCollapsed: {
    borderBottomWidth: 0,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  arrow: {
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default CollapsibleSection;