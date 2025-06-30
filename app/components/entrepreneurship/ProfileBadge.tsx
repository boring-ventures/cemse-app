import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ProfileBadgeProps {
  items: string[];
  type: 'skills' | 'lookingFor' | 'expertise' | 'achievements';
  title: string;
  maxVisible?: number;
  icon?: string;
}

export const ProfileBadge: React.FC<ProfileBadgeProps> = ({
  items,
  type,
  title,
  maxVisible = 3,
  icon,
}) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const getTypeConfig = () => {
    const configs = {
      skills: { 
        bgColor: iconColor + '15', 
        textColor: iconColor,
        borderColor: iconColor + '30'
      },
      lookingFor: { 
        bgColor: '#007AFF' + '15', 
        textColor: '#007AFF',
        borderColor: '#007AFF' + '30'
      },
      expertise: { 
        bgColor: '#32D74B' + '15', 
        textColor: '#32D74B',
        borderColor: '#32D74B' + '30'
      },
      achievements: { 
        bgColor: '#FFD60A' + '15', 
        textColor: '#FF9500',
        borderColor: '#FFD60A' + '30'
      },
    };
    return configs[type];
  };

  const config = getTypeConfig();
  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {icon && <Ionicons name={icon as any} size={14} color={secondaryTextColor} />}
        <ThemedText style={[styles.title, { color: secondaryTextColor }]}>
          {title}
        </ThemedText>
      </View>
      
      <View style={styles.tagsContainer}>
        {visibleItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.tag,
              {
                backgroundColor: config.bgColor,
                borderColor: config.borderColor,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tagText,
                { color: config.textColor },
              ]}
            >
              {item}
            </ThemedText>
          </View>
        ))}
        
        {remainingCount > 0 && (
          <View
            style={[
              styles.tag,
              styles.countTag,
              {
                backgroundColor: secondaryTextColor + '15',
                borderColor: secondaryTextColor + '30',
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tagText,
                { color: secondaryTextColor },
              ]}
            >
              +{remainingCount}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  countTag: {
    minWidth: 32,
    alignItems: 'center',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 