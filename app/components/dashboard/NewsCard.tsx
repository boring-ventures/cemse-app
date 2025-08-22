import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface NewsItem {
  id: string;
  type: 'business' | 'institutional';
  title: string;
  summary: string;
  date: string;
  url?: string;
  priority: 'high' | 'medium' | 'low';
}

interface NewsCardProps {
  news: NewsItem;
  onPress?: (news: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ news, onPress }) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'tint');

  const getNewsTypeConfig = (type: NewsItem['type']) => {
    switch (type) {
      case 'business':
        return {
          label: 'Empresarial',
          icon: 'business-outline' as const,
          color: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
        };
      case 'institutional':
        return {
          label: 'Institucional',
          icon: 'library-outline' as const,
          color: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
        };
      default:
        return {
          label: 'General',
          icon: 'information-circle-outline' as const,
          color: primaryColor,
          backgroundColor: `${primaryColor}20`,
        };
    }
  };

  const typeConfig = getNewsTypeConfig(news.type);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(news);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
      } else {
        return date.toLocaleDateString('es-CL', { 
          day: 'numeric', 
          month: 'short',
          year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    }
  };

  return (
    <Pressable
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={handlePress}
      android_ripple={{ color: `${primaryColor}20` }}
    >
      <View style={styles.header}>
        <View style={[styles.typeTag, { backgroundColor: typeConfig.backgroundColor }]}>
          <Ionicons 
            name={typeConfig.icon} 
            size={12} 
            color={typeConfig.color} 
            style={styles.typeIcon}
          />
          <Text style={[styles.typeText, { color: typeConfig.color }]}>
            {typeConfig.label}
          </Text>
        </View>
        
        {news.priority === 'high' && (
          <View style={styles.priorityIndicator}>
            <Ionicons name="flame" size={14} color="#ff6b6b" />
          </View>
        )}
      </View>

      <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
        {news.title}
      </Text>

      <Text style={[styles.summary, { color: secondaryTextColor }]} numberOfLines={1}>
        {news.summary}
      </Text>

      <View style={styles.footer}>
        <Text style={[styles.date, { color: secondaryTextColor }]}>
          {formatDate(news.date)}
        </Text>
        
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={secondaryTextColor} 
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeIcon: {
    marginRight: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 6,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  date: {
    fontSize: 11,
    fontWeight: '500',
  },
});