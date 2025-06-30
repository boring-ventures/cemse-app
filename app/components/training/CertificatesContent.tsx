import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Certificate } from '@/app/types/training';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { CertificateCard } from './CertificateCard';

interface CertificatesContentProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const CertificatesContent: React.FC<CertificatesContentProps> = ({
  isRefreshing,
  onRefresh
}) => {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  // Mock certificates data
  const certificates: Certificate[] = [
    {
      id: '1',
      courseTitle: 'Habilidades Laborales Básicas',
      completionDate: '14/12/2024',
      instructor: 'Dra. Ana Pérez',
      grade: 90,
      credentialId: 'CEMSE-2024-001',
    },
    {
      id: '2',
      courseTitle: 'Comunicación Efectiva',
      completionDate: '27/11/2024',
      instructor: 'Lic. Carlos López',
      grade: 85,
      credentialId: 'CEMSE-2024-002',
    },
  ];

  const handleDownload = (certificateId: string) => {
    console.log('Download certificate:', certificateId);
    // Implement download functionality
  };

  const handleShare = (certificateId: string) => {
    console.log('Share certificate:', certificateId);
    // Implement share functionality
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={iconColor}
            colors={[iconColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <ThemedText type="title" style={[styles.title, { color: textColor }]}>
              Mis Certificados
            </ThemedText>
            <View style={styles.certificateCounter}>
              <Ionicons name="trophy" size={20} color="#FFD60A" />
              <ThemedText style={[styles.counterText, { color: textColor }]}>
                {certificates.length} Certificados
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
            Certificados obtenidos de cursos completados exitosamente
          </ThemedText>
        </View>

        {/* Certificates List */}
        <View style={styles.certificatesSection}>
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              onDownload={() => handleDownload(certificate.id)}
              onShare={() => handleShare(certificate.id)}
            />
          ))}
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <View style={[styles.tipsCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.tipsHeader}>
              <View style={styles.lightbulbIcon}>
                <Ionicons name="bulb" size={24} color="#FFD60A" />
              </View>
              <ThemedText type="subtitle" style={[styles.tipsTitle, { color: textColor }]}>
                Consejos para tus certificados
              </ThemedText>
            </View>
            
            <View style={styles.tipsContent}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet}>
                  <View style={[styles.bullet, { backgroundColor: iconColor }]} />
                </View>
                <ThemedText style={[styles.tipText, { color: textColor }]}>
                  Agrega estos certificados a tu perfil profesional
                </ThemedText>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet}>
                  <View style={[styles.bullet, { backgroundColor: iconColor }]} />
                </View>
                <ThemedText style={[styles.tipText, { color: textColor }]}>
                  Compártelos en redes sociales profesionales
                </ThemedText>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet}>
                  <View style={[styles.bullet, { backgroundColor: iconColor }]} />
                </View>
                <ThemedText style={[styles.tipText, { color: textColor }]}>
                  Incluye el ID de credencial en tu CV
                </ThemedText>
              </View>
              
              <View style={styles.tipItem}>
                <View style={styles.tipBullet}>
                  <View style={[styles.bullet, { backgroundColor: iconColor }]} />
                </View>
                <ThemedText style={[styles.tipText, { color: textColor }]}>
                  Los empleadores pueden verificar la autenticidad usando el ID
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Empty State (if no certificates) */}
        {certificates.length === 0 && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name="trophy-outline" size={48} color={iconColor} />
            </View>
            <ThemedText type="subtitle" style={[styles.emptyTitle, { color: textColor }]}>
              Aún no tienes certificados
            </ThemedText>
            <ThemedText style={[styles.emptyMessage, { color: secondaryTextColor }]}>
              Completa tus cursos para obtener certificados oficiales
            </ThemedText>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    flex: 1,
  },
  certificateCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD60A20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  counterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  certificatesSection: {
    marginBottom: 30,
  },
  tipsSection: {
    marginBottom: 20,
  },
  tipsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  lightbulbIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFD60A20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipsTitle: {
    flex: 1,
  },
  tipsContent: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipBullet: {
    paddingTop: 6,
    marginRight: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
  },
  bottomSpacing: {
    height: 40,
  },
}); 