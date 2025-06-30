import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';

interface RatingDisplayProps {
  rating: number;
  ratingCount?: number;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  ratingCount,
  size = 'medium',
  showCount = true,
}) => {
  const secondaryTextColor = useThemeColor({}, 'textSecondary');

  const getSizes = () => {
    switch (size) {
      case 'small':
        return { starSize: 12, fontSize: 11, gap: 2 };
      case 'large':
        return { starSize: 16, fontSize: 16, gap: 6 };
      case 'medium':
      default:
        return { starSize: 14, fontSize: 13, gap: 4 };
    }
  };

  const { starSize, fontSize, gap } = getSizes();

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={starSize} color="#FFD60A" />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={starSize} color="#FFD60A" />
      );
    }

    // Empty stars
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Ionicons 
          key={`empty-${i}`} 
          name="star-outline" 
          size={starSize} 
          color="#8E8E93" 
        />
      );
    }

    return stars;
  };

  return (
    <View style={[styles.container, { gap }]}>
      <View style={[styles.starsContainer, { gap: 2 }]}>
        {renderStars()}
      </View>
      
      <ThemedText style={[
        styles.ratingText,
        { 
          color: secondaryTextColor,
          fontSize,
        }
      ]}>
        {rating.toFixed(1)}
      </ThemedText>

      {showCount && ratingCount && (
        <ThemedText style={[
          styles.countText,
          { 
            color: secondaryTextColor,
            fontSize: fontSize - 1,
          }
        ]}>
          ({ratingCount.toLocaleString()})
        </ThemedText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '600',
  },
  countText: {
    fontWeight: '500',
  },
}); 