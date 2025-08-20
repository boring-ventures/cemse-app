import { useThemeColor } from '@/app/hooks/useThemeColor';
import { JobApplication, mapApplicationStatusToSpanish } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { StatusBadge } from './StatusBadge';

interface ApplicationCardProps {
  application: JobApplication;
  onPress?: () => void;
  onViewJob?: () => void;
  onViewCV?: () => void;
  onWithdraw?: () => void;
  onViewDetails?: () => void;
  onRespond?: () => void;
  onChat?: () => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onPress,
  onViewJob,
  onViewCV,
  onWithdraw,
  onViewDetails,
  onRespond,
  onChat
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const handleViewJob = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewJob?.();
  };

  const handleViewCV = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewCV?.();
  };

  const handleWithdraw = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onWithdraw?.();
  };

  const handleViewDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onViewDetails?.();
  };

  const handleRespond = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRespond?.();
  };

  const handleChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChat?.();
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < rating; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={12} color="#FFD60A" />
      );
    }
    return stars;
  };

  const getStatusActions = () => {
    const spanishStatus = mapApplicationStatusToSpanish(application.status);
    switch (spanishStatus) {
      case 'Enviada':
        return (
          <View style={styles.actions}>
            <ThemedButton
              title="Ver oferta"
              onPress={handleViewJob}
              style={styles.actionButton}
              type="outline"
              size="small"
            />
            <ThemedButton
              title="Chat"
              onPress={handleChat}
              style={styles.actionButton}
              type="primary"
              size="small"
            />
            <ThemedButton
              title="Retirar"
              onPress={handleWithdraw}
              style={[styles.actionButton, styles.withdrawButton]}
              type="outline"
              size="small"
            />
          </View>
        );
      case 'En revisión':
        return (
          <View style={styles.actions}>
            <ThemedButton
              title="Ver oferta"
              onPress={handleViewJob}
              style={styles.actionButton}
              type="outline"
              size="small"
            />
            <ThemedButton
              title="Chat"
              onPress={handleChat}
              style={styles.actionButton}
              type="primary"
              size="small"
            />
          </View>
        );
      case 'Preseleccionado':
        return (
          <View style={styles.actions}>
            <ThemedButton
              title="Ver oferta"
              onPress={handleViewJob}
              style={styles.actionButton}
              type="outline"
              size="small"
            />
            <ThemedButton
              title="Chat"
              onPress={handleChat}
              style={styles.actionButton}
              type="primary"
              size="small"
            />
          </View>
        );
      case 'Entrevista programada':
        return (
          <View style={styles.actions}>
            <ThemedButton
              title="Ver detalles"
              onPress={handleViewDetails}
              style={styles.actionButton}
              type="primary"
              size="small"
            />
            <ThemedButton
              title="Chat"
              onPress={handleChat}
              style={styles.actionButton}
              type="outline"
              size="small"
            />
          </View>
        );
      case 'Oferta recibida':
        return (
          <View style={styles.actions}>
            <ThemedButton
              title="Responder"
              onPress={handleRespond}
              style={styles.actionButton}
              type="primary"
              size="small"
            />
            <ThemedButton
              title="Chat"
              onPress={handleChat}
              style={styles.actionButton}
              type="outline"
              size="small"
            />
          </View>
        );
      default:
        return (
          <View style={styles.actions}>
            <ThemedButton
              title="Ver oferta"
              onPress={handleViewJob}
              style={styles.actionButton}
              type="outline"
              size="small"
            />
            <ThemedButton
              title="Ver CV"
              onPress={handleViewCV}
              style={styles.actionButton}
              type="outline"
              size="small"
            />
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with status */}
      <View style={styles.header}>
        <StatusBadge status={mapApplicationStatusToSpanish(application.status) as any} />
        <View style={[styles.companyLogo, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name="briefcase-outline" size={24} color={iconColor} />
        </View>
      </View>

      {/* Job and company info */}
      <View style={styles.jobInfo}>
        <ThemedText type="subtitle" style={[styles.jobTitle, { color: textColor }]}>
          {application.jobTitle}
        </ThemedText>
        <ThemedText style={[styles.companyName, { color: textColor }]}>
          {application.company}
        </ThemedText>
      </View>

      {/* Rating if available */}
      {application.rating && (
        <View style={styles.ratingSection}>
          <View style={styles.starsContainer}>
            {renderStars(application.rating)}
          </View>
          <ThemedText style={[styles.ratingText, { color: secondaryTextColor }]}>
            Valoración: {application.rating}/5 ⭐
          </ThemedText>
        </View>
      )}

      {/* Dates */}
      <View style={styles.dateInfo}>
        <View style={styles.dateItem}>
          <Ionicons name="calendar-outline" size={14} color={secondaryTextColor} />
          <ThemedText style={[styles.dateText, { color: secondaryTextColor }]}>
            Aplicado: {application.applicationDate}
          </ThemedText>
        </View>
        <ThemedText style={[styles.lastUpdate, { color: secondaryTextColor }]}>
          Última actualización: {application.lastUpdate}
        </ThemedText>
      </View>

      {/* Special status information */}
      {mapApplicationStatusToSpanish(application.status) === 'Entrevista programada' && application.interviewDate && (
        <View style={styles.specialInfo}>
          <View style={[styles.interviewCard, { backgroundColor: '#AF52DE20' }]}>
            <Ionicons name="calendar" size={16} color="#AF52DE" />
            <View style={styles.interviewDetails}>
              <ThemedText style={[styles.interviewText, { color: textColor }]}>
                Entrevista: {application.interviewDate}
              </ThemedText>
              <ThemedText style={[styles.interviewType, { color: secondaryTextColor }]}>
                Modalidad: {application.interviewType}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {mapApplicationStatusToSpanish(application.status) === 'Oferta recibida' && application.offerAmount && (
        <View style={styles.specialInfo}>
          <View style={[styles.offerCard, { backgroundColor: '#FFD60A20' }]}>
            <Ionicons name="gift" size={16} color="#FFD60A" />
            <View style={styles.offerDetails}>
              <ThemedText style={[styles.offerText, { color: textColor }]}>
                Oferta salarial: Bs. {application.offerAmount}
              </ThemedText>
              <ThemedText style={[styles.deadline, { color: secondaryTextColor }]}>
                Responder antes de: {application.responseDeadline}
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Employer notes */}
      {application.employerNotes && (
        <View style={styles.notesSection}>
          <View style={[styles.notesCard, { backgroundColor: iconColor + '10' }]}>
            <Ionicons name="chatbubble-outline" size={16} color={iconColor} />
            <ThemedText style={[styles.notesText, { color: textColor }]}>
              {application.employerNotes}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Action buttons */}
      {getStatusActions()}
    </TouchableOpacity>
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
    marginBottom: 12,
  },
  companyLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobInfo: {
    marginBottom: 12,
  },
  jobTitle: {
    marginBottom: 4,
    lineHeight: 20,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  ratingSection: {
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  dateInfo: {
    marginBottom: 12,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
  },
  lastUpdate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  specialInfo: {
    marginBottom: 12,
  },
  interviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  interviewDetails: {
    flex: 1,
  },
  interviewText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  interviewType: {
    fontSize: 12,
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  offerDetails: {
    flex: 1,
  },
  offerText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  deadline: {
    fontSize: 12,
  },
  notesSection: {
    marginBottom: 12,
  },
  notesCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    gap: 10,
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: 100,
  },
  withdrawButton: {
    borderColor: '#FF453A',
  },
}); 