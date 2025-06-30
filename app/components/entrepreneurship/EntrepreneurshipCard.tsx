import { useThemeColor } from '@/app/hooks/useThemeColor';
import { FeatureCard } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';

interface EntrepreneurshipCardProps {
  feature: FeatureCard;
  onPress?: () => void;
}

export const EntrepreneurshipCard: React.FC<EntrepreneurshipCardProps> = ({ 
  feature, 
  onPress 
}) => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = feature.color || useThemeColor({}, 'tint');

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (feature.isAvailable) {
      router.push(feature.route as any);
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor, 
          borderColor: borderColor + '40',
          opacity: feature.isAvailable ? 1 : 0.6 
        }
      ]}
      onPress={handlePress}
      disabled={!feature.isAvailable}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
          <Ionicons 
            name={feature.icon as any} 
            size={32} 
            color={iconColor} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <ThemedText 
            type="defaultSemiBold" 
            style={[styles.title, { color: textColor }]}
          >
            {feature.title}
          </ThemedText>
          
          <ThemedText 
            style={[styles.description, { color: secondaryTextColor }]}
          >
            {feature.description}
          </ThemedText>
        </View>

        {feature.isAvailable && (
          <View style={styles.arrow}>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={secondaryTextColor} 
            />
          </View>
        )}

        {!feature.isAvailable && (
          <View style={[styles.comingSoon, { backgroundColor: iconColor + '20' }]}>
            <ThemedText style={[styles.comingSoonText, { color: iconColor }]}>
              Próximamente
            </ThemedText>
          </View>
        )}
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
  },
  content: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  arrow: {
    marginLeft: 8,
  },
  comingSoon: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: '600',
  },
}); 