import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Post } from '@/app/types/entrepreneurship';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Post Card Component
 * Displays post information in a compact card format
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  style,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffDays > 0) {
        return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
      } else if (diffHours > 0) {
        return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      } else if (diffMinutes > 0) {
        return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
      } else {
        return 'hace un momento';
      }
    } catch (error) {
      return dateString;
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'convocatoria':
        return '#10b981'; // Green
      case 'evento':
        return '#f59e0b'; // Amber
      case 'noticia':
        return '#3b82f6'; // Blue
      case 'programa':
        return '#8b5cf6'; // Purple
      case 'recurso':
        return '#ef4444'; // Red
      default:
        return tintColor;
    }
  };

  const categoryColor = getCategoryColor(post.category);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardBackground, borderColor }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
            <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
              {post.category}
            </ThemedText>
          </View>
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={textColor} />
              <ThemedText style={styles.metaText} numberOfLines={1}>
                {post.author}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={textColor} />
              <ThemedText style={styles.metaText}>
                {formatDate(post.createdAt)}
              </ThemedText>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={16} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {post.title}
        </ThemedText>
        
        {post.content && (
          <ThemedText style={styles.content} numberOfLines={3}>
            {post.content}
          </ThemedText>
        )}

        {/* Image */}
        {post.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: post.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerStats}>
          <View style={styles.footerStat}>
            <Ionicons name="heart-outline" size={16} color={textColor} />
            <ThemedText style={styles.footerStatText}>
              {post.likes}
            </ThemedText>
          </View>
          
          <View style={styles.footerStat}>
            <Ionicons name="chatbubble-outline" size={16} color={textColor} />
            <ThemedText style={styles.footerStatText}>
              {post.comments}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.readMoreButton}>
          <ThemedText style={[styles.readMoreText, { color: tintColor }]}>
            Leer más →
          </ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  moreButton: {
    padding: 4,
    marginLeft: 12,
  },
  contentContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 12,
  },
  imageContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
  },
  image: {
    width: '100%',
    height: 200,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  footerStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerStatText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  readMoreButton: {
    padding: 4,
  },
  readMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default PostCard;