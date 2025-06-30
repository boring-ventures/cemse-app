import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Resource } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface ResourceCardProps {
  resource: Resource;
  onPress?: () => void;
  onDownload?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({ 
  resource, 
  onPress,
  onDownload 
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Planificación': '#007AFF',
      'Validación': '#32D74B',
      'Finanzas': '#FFD60A',
      'Marketing': '#FF3B30',
      'Legal': '#8E8E93',
      'Operaciones': '#5856D6',
    };
    return colors[type] || iconColor;
  };

  const getFileTypeIcon = (fileType: string) => {
    const icons: Record<string, string> = {
      'document': 'document-text-outline',
      'video': 'play-circle-outline',
      'template': 'copy-outline',
      'calculator': 'calculator-outline',
      'guide': 'book-outline',
    };
    return icons[fileType] || 'document-outline';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={12} color="#FFD60A" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={12} color="#FFD60A" />
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={12} color="#8E8E93" />
      );
    }

    return stars;
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor, borderColor: borderColor + '40' }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.typeTag, { backgroundColor: getTypeColor(resource.type) + '20' }]}>
            <ThemedText style={[styles.typeText, { color: getTypeColor(resource.type) }]}>
              {resource.type}
            </ThemedText>
          </View>
          
          <View style={styles.fileTypeIcon}>
            <Ionicons 
              name={getFileTypeIcon(resource.fileType) as any} 
              size={20} 
              color={iconColor} 
            />
          </View>
        </View>

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
            numberOfLines={2}
          >
            {resource.description}
          </ThemedText>

          <View style={styles.metadata}>
            <View style={styles.rating}>
              <View style={styles.stars}>
                {renderStars(resource.rating)}
              </View>
              <ThemedText style={[styles.ratingText, { color: secondaryTextColor }]}>
                {resource.rating}
              </ThemedText>
            </View>

            <View style={styles.downloads}>
              <Ionicons name="download-outline" size={14} color={secondaryTextColor} />
              <ThemedText style={[styles.downloadsText, { color: secondaryTextColor }]}>
                {resource.downloads.toLocaleString()} descargas
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.downloadButton, { backgroundColor: iconColor + '20' }]}
            onPress={onDownload}
          >
            <Ionicons name="download" size={16} color={iconColor} />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fileTypeIcon: {
    padding: 4,
  },
  main: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    marginBottom: 6,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  downloads: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadsText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    alignItems: 'flex-end',
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 