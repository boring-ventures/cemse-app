import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Certificate } from '@/app/types/training';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { StatusBadge } from './StatusBadge';

interface CertificateCardProps {
  certificate: Certificate;
  onDownload?: () => void;
  onShare?: () => void;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
  onDownload,
  onShare
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const handleDownload = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDownload?.();
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShare?.();
  };

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      {/* Header with status */}
      <View style={styles.header}>
        <StatusBadge status="Completado" />
        <View style={[styles.certificateIcon, { backgroundColor: '#FFD60A20' }]}>
          <Ionicons name="trophy" size={24} color="#FFD60A" />
        </View>
      </View>

      {/* Certificate info */}
      <View style={styles.content}>
        <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
          {certificate.courseTitle}
        </ThemedText>
        
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={secondaryTextColor} />
            <ThemedText style={[styles.detailText, { color: secondaryTextColor }]}>
              Completado: {certificate.completionDate}
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="person-outline" size={16} color={secondaryTextColor} />
            <ThemedText style={[styles.detailText, { color: secondaryTextColor }]}>
              {certificate.instructor}
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="star-outline" size={16} color={secondaryTextColor} />
            <ThemedText style={[styles.detailText, { color: secondaryTextColor }]}>
              Calificación: {certificate.grade}%
            </ThemedText>
          </View>
          
          <View style={styles.detailRow}>
            <Ionicons name="shield-checkmark-outline" size={16} color={secondaryTextColor} />
            <ThemedText style={[styles.detailText, { color: secondaryTextColor }]}>
              ID: {certificate.credentialId}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <ThemedButton
          title="Descargar"
          onPress={handleDownload}
          style={styles.actionButton}
          type="primary"
        />
        <ThemedButton
          title="Compartir"
          onPress={handleShare}
          style={styles.actionButton}
          type="secondary"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  certificateIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 12,
    lineHeight: 22,
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
  },
}); 