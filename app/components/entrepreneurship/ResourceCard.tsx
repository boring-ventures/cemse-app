import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Resource } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { RatingDisplay } from './RatingDisplay';
import { ResourceBadge } from './ResourceBadge';

interface ResourceCardProps {
  resource: Resource;
  onPress?: () => void;
  onPreview?: () => void;
  onDownload?: () => void;
  onFavoritePress?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onPress,
  onPreview,
  onDownload,
  onFavoritePress,
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress?.();
  };

  const handlePreview = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPreview?.();
  };

  const handleDownload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDownload?.();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const renderTags = () => {
    const visibleTags = resource.tags.slice(0, 3);
    const remainingCount = resource.tags.length - 3;

    return (
      <View style={styles.tagsContainer}>
        {visibleTags.map((tag, index) => (
          <View key={index} style={[styles.tag, { backgroundColor: iconColor + '15' }]}>
            <ThemedText style={[styles.tagText, { color: iconColor }]}>
              {tag}
            </ThemedText>
          </View>
        ))}
        {remainingCount > 0 && (
          <View style={[styles.tag, { backgroundColor: secondaryTextColor + '15' }]}>
            <ThemedText style={[styles.tagText, { color: secondaryTextColor }]}>
              +{remainingCount}
            </ThemedText>
          </View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor, borderColor: borderColor + '40' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ResourceBadge type={resource.type} level={resource.level} />
          
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Ionicons 
              name={resource.isFavorite ? "heart" : "heart-outline"} 
              size={20} 
              color={resource.isFavorite ? "#FF3B30" : secondaryTextColor} 
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.main}>
          <ThemedText 
            type="defaultSemiBold" 
            style={[styles.title, { color: textColor }]}
            numberOfLines={2}
          >
            {resource.title}
          </ThemedText>
          
          <ThemedText 
            style={[styles.description, { color: secondaryTextColor }]}
            numberOfLines={3}
          >
            {resource.description}
          </ThemedText>

          {/* Category and Duration */}
          <View style={styles.categoryRow}>
            <View style={styles.categoryInfo}>
              <Ionicons name="folder-outline" size={14} color={secondaryTextColor} />
              <ThemedText style={[styles.categoryText, { color: secondaryTextColor }]}>
                {resource.category}
              </ThemedText>
            </View>
            
            <View style={styles.durationInfo}>
              <Ionicons name="time-outline" size={14} color={secondaryTextColor} />
              <ThemedText style={[styles.durationText, { color: secondaryTextColor }]}>
                {resource.duration}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Metrics */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsRow}>
            <RatingDisplay 
              rating={resource.rating} 
              ratingCount={resource.ratingCount}
              size="small"
            />
            
            <View style={styles.downloadsInfo}>
              <Ionicons name="download-outline" size={14} color={secondaryTextColor} />
              <ThemedText style={[styles.downloadsText, { color: secondaryTextColor }]}>
                {resource.downloads.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.fileInfoRow}>
            <ThemedText style={[styles.fileInfo, { color: secondaryTextColor }]}>
              {resource.fileInfo} • {resource.fileSize}
            </ThemedText>
            
            <ThemedText style={[styles.date, { color: secondaryTextColor }]}>
              {formatDate(resource.publishDate)}
            </ThemedText>
          </View>
        </View>

        {/* Tags */}
        {renderTags()}

        {/* Actions */}
        <View style={styles.actions}>
          <ThemedButton
            title="Vista Previa"
            onPress={handlePreview}
            type="outline"
            style={styles.previewButton}
          />
          
          <ThemedButton
            title="Descargar"
            onPress={handleDownload}
            type="primary"
            style={styles.downloadButton}
          />
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  favoriteButton: {
    padding: 4,
  },
  main: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  durationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricsSection: {
    marginBottom: 16,
    gap: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  downloadsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  fileInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileInfo: {
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 1,
  },
  downloadButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 