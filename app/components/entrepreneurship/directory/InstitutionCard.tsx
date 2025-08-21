import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Institution } from '@/app/types/entrepreneurship';

interface InstitutionCardProps {
  institution: Institution;
  onPress: () => void;
  style?: ViewStyle | ViewStyle[];
}

/**
 * Institution Card Component
 * Displays institution information in a compact card format
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const InstitutionCard: React.FC<InstitutionCardProps> = ({
  institution,
  onPress,
  style,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // Get institution type label
  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'GOBIERNOS_MUNICIPALES':
        return 'Gobierno Municipal';
      case 'CENTROS_DE_FORMACION':
        return 'Centro de Formación';
      case 'ONGS_Y_FUNDACIONES':
        return 'ONG/Fundación';
      default:
        return institution.customType || 'Institución';
    }
  };

  // Get institution type icon
  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'GOBIERNOS_MUNICIPALES':
        return 'business';
      case 'CENTROS_DE_FORMACION':
        return 'school';
      case 'ONGS_Y_FUNDACIONES':
        return 'heart';
      default:
        return 'business-outline';
    }
  };

  // Get institution type color
  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'GOBIERNOS_MUNICIPALES':
        return '#3b82f6'; // Blue
      case 'CENTROS_DE_FORMACION':
        return '#10b981'; // Green
      case 'ONGS_Y_FUNDACIONES':
        return '#f59e0b'; // Amber
      default:
        return tintColor;
    }
  };

  const typeColor = getTypeColor(institution.institutionType);
  const typeIcon = getTypeIcon(institution.institutionType);
  const typeLabel = getTypeLabel(institution.institutionType);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: cardBackground, borderColor }, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: `${typeColor}20` }]}>
            <Ionicons
              name={typeIcon as any}
              size={24}
              color={typeColor}
            />
          </View>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.name} numberOfLines={2}>
              {institution.name}
            </ThemedText>
            <View style={styles.typeContainer}>
              <View style={[styles.typeBadge, { backgroundColor: `${typeColor}15` }]}>
                <ThemedText style={[styles.typeText, { color: typeColor }]}>
                  {typeLabel}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Location Info */}
      <View style={styles.locationContainer}>
        <View style={styles.locationItem}>
          <Ionicons name="location" size={16} color={textColor} />
          <ThemedText style={styles.locationText}>
            {institution.department}
          </ThemedText>
        </View>
        
        {institution.region && (
          <View style={styles.locationItem}>
            <Ionicons name="map" size={16} color={textColor} />
            <ThemedText style={styles.locationText}>
              {institution.region}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View style={styles.footerItem}>
            <Ionicons name="business-outline" size={14} color={textColor} />
            <ThemedText style={styles.footerText}>
              Institución
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.footerRight}>
          <ThemedText style={[styles.exploreText, { color: tintColor }]}>
            Explorar →
          </ThemedText>
        </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 24,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chevronContainer: {
    padding: 4,
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 16,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.7,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.6,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exploreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default InstitutionCard;