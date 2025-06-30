import { useThemeColor } from '@/app/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface SkillTagProps {
  skill: string;
  variant?: 'default' | 'outlined' | 'technical';
  size?: 'small' | 'medium';
}

export const SkillTag: React.FC<SkillTagProps> = ({ 
  skill, 
  variant = 'default',
  size = 'medium' 
}) => {
  const iconColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'backgroundSecondary');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  const getTagStyle = () => {
    const isSmall = size === 'small';
    
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: borderColor,
          paddingHorizontal: isSmall ? 6 : 8,
          paddingVertical: isSmall ? 2 : 4,
        };
      case 'technical':
        return {
          backgroundColor: iconColor + '15',
          paddingHorizontal: isSmall ? 6 : 8,
          paddingVertical: isSmall ? 2 : 4,
        };
      default:
        return {
          backgroundColor: backgroundColor,
          paddingHorizontal: isSmall ? 6 : 8,
          paddingVertical: isSmall ? 2 : 4,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'technical':
        return iconColor;
      case 'outlined':
        return textColor;
      default:
        return secondaryTextColor;
    }
  };

  const isSmall = size === 'small';

  return (
    <View style={[
      styles.container,
      getTagStyle()
    ]}>
      <ThemedText style={[
        styles.text,
        {
          color: getTextColor(),
          fontSize: isSmall ? 10 : 12,
        }
      ]}>
        {skill}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '500',
    textAlign: 'center',
  },
}); 