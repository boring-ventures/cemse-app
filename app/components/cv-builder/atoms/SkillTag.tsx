/**
 * Skill Tag Atom Component
 * Displays individual skills with level indicator and remove functionality
 */

import { Skill, SkillLevel, SkillTagProps } from '@/app/types/cv';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  'Beginner': '#FFA500',
  'Skillful': '#4169E1',
  'Experienced': '#32CD32',
  'Expert': '#9370DB',
};

const SKILL_LEVEL_ICONS: Record<SkillLevel, string> = {
  'Beginner': 'star-outline',
  'Skillful': 'star-half',
  'Experienced': 'star',
  'Expert': 'trophy',
} as const;

export const SkillTag = memo<SkillTagProps>(({
  skill,
  onRemove,
  onLevelChange,
  editable = true,
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handleRemove = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove(skill.name);
    });
  }, [skill.name, onRemove, scaleAnim]);
  
  const handleLevelChange = useCallback(() => {
    if (!editable) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Cycle through skill levels
    const levels: SkillLevel[] = ['Beginner', 'Skillful', 'Experienced', 'Expert'];
    const currentIndex = levels.indexOf(skill.experienceLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    
    onLevelChange(skill.name, levels[nextIndex]);
  }, [skill, onLevelChange, editable]);
  
  const levelColor = SKILL_LEVEL_COLORS[skill.experienceLevel];
  const levelIcon = SKILL_LEVEL_ICONS[skill.experienceLevel];
  
  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      borderWidth: 1.5,
      borderColor: borderColor,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 8,
      marginBottom: 8,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    contentContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    levelIndicator: {
      marginRight: 6,
    },
    skillName: {
      fontSize: 14,
      fontWeight: '600',
      color: textColor,
      marginRight: 4,
    },
    categoryBadge: {
      fontSize: 11,
      color: levelColor,
      fontWeight: '500',
      marginLeft: 4,
    },
    levelButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 4,
      borderRadius: 12,
      backgroundColor: `${levelColor}15`,
      marginLeft: 6,
    },
    levelText: {
      fontSize: 11,
      color: levelColor,
      fontWeight: '600',
      marginLeft: 4,
    },
    removeButton: {
      marginLeft: 8,
      padding: 4,
    },
    yearsText: {
      fontSize: 10,
      color: textColor,
      opacity: 0.7,
      marginLeft: 4,
    },
  });
  
  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] }
      ]}
      testID={`skill-tag-${skill.name}`}
    >
      <View style={styles.contentContainer}>
        <Ionicons 
          name={levelIcon as any} 
          size={16} 
          color={levelColor} 
          style={styles.levelIndicator}
        />
        
        <Text style={styles.skillName}>
          {skill.name}
        </Text>
        
        {skill.yearsOfExperience && (
          <Text style={styles.yearsText}>
            ({skill.yearsOfExperience}y)
          </Text>
        )}
        
        {editable && (
          <Pressable 
            onPress={handleLevelChange}
            style={styles.levelButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.levelText}>
              {skill.experienceLevel}
            </Text>
          </Pressable>
        )}
      </View>
      
      {editable && (
        <Pressable
          onPress={handleRemove}
          style={styles.removeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          testID={`remove-skill-${skill.name}`}
        >
          <Ionicons 
            name="close-circle" 
            size={18} 
            color="#FF3B30" 
          />
        </Pressable>
      )}
    </Animated.View>
  );
});

SkillTag.displayName = 'SkillTag';