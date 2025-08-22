/**
 * Collapsible Section Molecule
 * Expandable/collapsible container for CV sections with smooth animations
 */

import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS
} from 'react-native-reanimated';

interface CollapsibleSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: number;
  icon?: keyof typeof Ionicons.glyphMap;
  required?: boolean;
  completed?: boolean;
}

export const CollapsibleSection = React.memo<CollapsibleSectionProps>(({
  title,
  isCollapsed,
  onToggle,
  children,
  badge,
  icon,
  required = false,
  completed = false,
}) => {
  const animatedHeight = useSharedValue(isCollapsed ? 0 : 1);
  const animatedRotation = useSharedValue(isCollapsed ? 0 : 1);
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');
  
  useEffect(() => {
    animatedHeight.value = withSpring(isCollapsed ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
    animatedRotation.value = withSpring(isCollapsed ? 0 : 1, {
      damping: 15,
      stiffness: 150,
    });
  }, [isCollapsed]);
  
  const animatedContentStyle = useAnimatedStyle(() => {
    const height = interpolate(
      animatedHeight.value,
      [0, 1],
      [0, 1000], // Large enough to accommodate content
      Extrapolate.CLAMP
    );
    
    return {
      maxHeight: height,
      opacity: animatedHeight.value,
    };
  });
  
  const animatedChevronStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      animatedRotation.value,
      [0, 1],
      [0, 180]
    );
    
    return {
      transform: [{ rotate: `${rotation}deg` }],
    };
  });
  
  const styles = StyleSheet.create({
    container: {
      marginVertical: 8,
      borderRadius: 12,
      backgroundColor: surfaceColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: isCollapsed ? 0 : 1,
      borderBottomColor: borderColor,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      marginRight: 12,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 12,
    },
    statusIndicatorRequired: {
      backgroundColor: '#FF3B30',
    },
    statusIndicatorCompleted: {
      backgroundColor: '#34C759',
    },
    statusIndicatorOptional: {
      backgroundColor: secondaryTextColor,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
    },
    subtitle: {
      fontSize: 12,
      color: secondaryTextColor,
      marginTop: 2,
    },
    badge: {
      backgroundColor: primaryColor,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      marginLeft: 8,
      minWidth: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    chevron: {
      marginLeft: 8,
    },
    content: {
      overflow: 'hidden',
    },
    contentInner: {
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
  });
  
  const getStatusIndicatorStyle = () => {
    if (completed) return styles.statusIndicatorCompleted;
    if (required) return styles.statusIndicatorRequired;
    return styles.statusIndicatorOptional;
  };
  
  const getSubtitle = () => {
    if (completed) return 'Completado';
    if (required) return 'Requerido';
    return 'Opcional';
  };
  
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={onToggle}
        android_ripple={{ color: borderColor }}
      >
        <View style={styles.headerLeft}>
          {/* Status indicator */}
          <View style={[styles.statusIndicator, getStatusIndicatorStyle()]} />
          
          {/* Icon */}
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color={completed ? '#34C759' : primaryColor}
              style={styles.icon}
            />
          )}
          
          {/* Title and subtitle */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
              {title}
            </Text>
            <Text style={styles.subtitle}>
              {getSubtitle()}
            </Text>
          </View>
        </View>
        
        {/* Badge */}
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        
        {/* Chevron */}
        <Animated.View style={[styles.chevron, animatedChevronStyle]}>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={secondaryTextColor} 
          />
        </Animated.View>
      </Pressable>
      
      {/* Collapsible content */}
      <Animated.View style={[styles.content, animatedContentStyle]}>
        <View style={styles.contentInner}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
});

CollapsibleSection.displayName = 'CollapsibleSection';