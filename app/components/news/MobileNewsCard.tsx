/**
 * Mobile News Card Component
 * Displays news articles in an optimized mobile-friendly format
 * Based on NEWS_MOBILE_SPEC.md specification
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MobileNewsCardProps } from '@/app/types/news';
import { useThemeColor } from '@/app/hooks/useThemeColor';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - 32; // 16px margin on each side

export const MobileNewsCard: React.FC<MobileNewsCardProps> = ({
  news,
  compact = false,
  onPress
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "URGENT": return "#ef4444";
      case "HIGH": return "#f97316";
      case "MEDIUM": return "#3b82f6";
      case "LOW": return "#6b7280";
      default: return "#6b7280";
    }
  };

  // Get priority label
  const getPriorityLabel = (priority: string): string => {
    switch (priority) {
      case "URGENT": return "Urgente";
      case "HIGH": return "Alta";
      case "MEDIUM": return "Media";
      case "LOW": return "Baja";
      default: return "Media";
    }
  };

  // Get author type icon
  const getAuthorTypeIcon = (authorType: string): keyof typeof Ionicons.glyphMap => {
    switch (authorType) {
      case "COMPANY": return "business";
      case "GOVERNMENT": return "shield";
      case "NGO": return "heart";
      default: return "information-circle";
    }
  };

  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handlePress = () => {
    if (onPress) {
      onPress(news);
    }
  };

  const dynamicStyles = StyleSheet.create({
    card: {
      backgroundColor: cardBackgroundColor,
      borderColor: borderColor,
    },
    title: {
      color: textColor,
    },
    summary: {
      color: secondaryTextColor,
    },
    authorName: {
      color: textColor,
    },
    metricText: {
      color: secondaryTextColor,
    },
    dateText: {
      color: secondaryTextColor,
    },
    categoryText: {
      color: textColor,
    }
  });

  return (
    <TouchableOpacity
      style={[
        styles.card,
        dynamicStyles.card,
        compact && styles.compactCard
      ]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        {news.imageUrl ? (
          <Image
            source={{ uri: news.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.image, styles.noImageContainer]}>
            <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          </View>
        )}
        
        {/* Image Overlay Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        
        {/* Priority Badge */}
        <View style={[
          styles.priorityBadge,
          { backgroundColor: getPriorityColor(news.priority) }
        ]}>
          <Text style={styles.priorityText}>
            {getPriorityLabel(news.priority)}
          </Text>
        </View>
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={[styles.categoryText, dynamicStyles.categoryText]}>
            {news.category}
          </Text>
        </View>
        
        {/* Featured Badge */}
        {news.featured && (
          <View style={styles.featuredBadge}>
            <Ionicons name="star" size={12} color="#ffffff" />
            <Text style={styles.featuredText}>Destacado</Text>
          </View>
        )}
      </View>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Author Row */}
        <View style={styles.authorRow}>
          <View style={styles.authorInfo}>
            {news.authorLogo ? (
              <Image
                source={{ uri: news.authorLogo }}
                style={styles.authorAvatar}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.authorAvatar, styles.authorAvatarFallback]}>
                <Ionicons 
                  name={getAuthorTypeIcon(news.authorType)} 
                  size={16} 
                  color="#6b7280" 
                />
              </View>
            )}
            <Text 
              style={[styles.authorName, dynamicStyles.authorName]}
              numberOfLines={1}
            >
              {news.authorName}
            </Text>
          </View>
          
          <View style={styles.dateContainer}>
            <Ionicons name="time" size={12} color={secondaryTextColor} />
            <Text style={[styles.dateText, dynamicStyles.dateText]}>
              {formatDate(news.publishedAt)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            dynamicStyles.title,
            compact && styles.compactTitle
          ]}
          numberOfLines={compact ? 2 : 3}
        >
          {news.title}
        </Text>

        {/* Summary */}
        {!compact && (
          <Text
            style={[styles.summary, dynamicStyles.summary]}
            numberOfLines={2}
          >
            {news.summary}
          </Text>
        )}

        {/* Tags */}
        {news.tags && news.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {news.tags.slice(0, compact ? 1 : 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Ionicons name="eye-outline" size={14} color={secondaryTextColor} />
            <Text style={[styles.metricText, dynamicStyles.metricText]}>
              {formatViewCount(news.viewCount)}
            </Text>
          </View>
          
          <View style={styles.metric}>
            <Ionicons name="heart-outline" size={14} color={secondaryTextColor} />
            <Text style={[styles.metricText, dynamicStyles.metricText]}>
              {news.likeCount}
            </Text>
          </View>
          
          <View style={styles.metric}>
            <Ionicons name="chatbubble-outline" size={14} color={secondaryTextColor} />
            <Text style={[styles.metricText, dynamicStyles.metricText]}>
              {news.commentCount}
            </Text>
          </View>
          
          {/* Read Time Indicator */}
          <View style={styles.readTimeContainer}>
            <Ionicons name="time-outline" size={12} color={secondaryTextColor} />
            <Text style={[styles.readTimeText, dynamicStyles.metricText]}>
              {news.readTime || Math.max(1, Math.ceil(news.content.length / 1000))} min
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: Platform.OS === 'ios' ? 0.5 : 0,
  },
  compactCard: {
    width: cardWidth * 0.8,
    marginVertical: 6,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  compactImageContainer: {
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  priorityBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#ffffff',
  },
  featuredBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  contentContainer: {
    padding: 16,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  authorAvatarFallback: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    marginLeft: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 14,
    marginBottom: 6,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  readTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeText: {
    fontSize: 11,
    marginLeft: 4,
  },
  noImageContainer: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MobileNewsCard;