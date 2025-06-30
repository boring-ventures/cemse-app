import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ResourceBadgeProps {
  type: 'Video' | 'Plantilla' | 'Guía' | 'Herramienta' | 'Podcast';
  level?: 'Principiante' | 'Intermedio' | 'Avanzado';
  size?: 'small' | 'medium';
}

export const ResourceBadge: React.FC<ResourceBadgeProps> = ({ 
  type, 
  level, 
  size = 'medium' 
}) => {
  const textColor = useThemeColor({}, 'text');

  const getTypeConfig = (resourceType: string) => {
    const configs = {
      'Video': { icon: 'play-circle', color: '#FF3B30', bgColor: '#FF3B30' },
      'Plantilla': { icon: 'document-text', color: '#007AFF', bgColor: '#007AFF' },
      'Guía': { icon: 'book', color: '#32D74B', bgColor: '#32D74B' },
      'Herramienta': { icon: 'construct', color: '#FF9500', bgColor: '#FF9500' },
      'Podcast': { icon: 'headset', color: '#5856D6', bgColor: '#5856D6' },
    };
    return configs[resourceType as keyof typeof configs] || configs['Guía'];
  };

  const getLevelConfig = (resourceLevel: string) => {
    const configs = {
      'Principiante': { color: '#32D74B', bgColor: '#32D74B' },
      'Intermedio': { color: '#FF9500', bgColor: '#FF9500' },
      'Avanzado': { color: '#FF3B30', bgColor: '#FF3B30' },
    };
    return configs[resourceLevel as keyof typeof configs] || configs['Principiante'];
  };

  const typeConfig = getTypeConfig(type);
  const levelConfig = level ? getLevelConfig(level) : null;
  
  const isSmall = size === 'small';
  const iconSize = isSmall ? 14 : 16;
  const fontSize = isSmall ? 11 : 12;
  const padding = isSmall ? 4 : 6;

  return (
    <View style={styles.container}>
      {/* Type Badge */}
      <View style={[
        styles.badge,
        {
          backgroundColor: typeConfig.bgColor + '20',
          paddingHorizontal: padding + 2,
          paddingVertical: padding,
        }
      ]}>
        <Ionicons 
          name={typeConfig.icon as any} 
          size={iconSize} 
          color={typeConfig.color} 
          style={styles.icon}
        />
        <ThemedText style={[
          styles.badgeText,
          { 
            color: typeConfig.color,
            fontSize,
            fontWeight: '600',
          }
        ]}>
          {type}
        </ThemedText>
      </View>

      {/* Level Badge */}
      {level && levelConfig && (
        <View style={[
          styles.badge,
          {
            backgroundColor: levelConfig.bgColor + '20',
            paddingHorizontal: padding + 2,
            paddingVertical: padding,
          }
        ]}>
          <ThemedText style={[
            styles.badgeText,
            { 
              color: levelConfig.color,
              fontSize,
              fontWeight: '600',
            }
          ]}>
            {level}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    gap: 4,
  },
  icon: {
    marginRight: 2,
  },
  badgeText: {
    fontWeight: '600',
    textTransform: 'uppercase',
  },
}); 