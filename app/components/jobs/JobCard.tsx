import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useApplicationStatus } from '@/app/hooks/useApplicationStatus';
import { useToast, toastMessages } from '@/app/hooks/useToast';
import { JobOffer, mapExperienceLevelToSpanish, mapApplicationStatusToSpanish } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { SkillTag } from './SkillTag';
import { StatusBadge } from './StatusBadge';
import Shimmer from '../Shimmer';

interface JobCardProps {
  job: JobOffer;
  onPress?: () => void;
  onFavoritePress?: () => void;
  onApplyPress?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onPress,
  onFavoritePress,
  onApplyPress
}) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  const { applicationStatus, checkApplicationStatus, cancelApplication } = useApplicationStatus();
  const { toast } = useToast();
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check application status on component mount
  useEffect(() => {
    const checkStatus = async () => {
      setIsCheckingStatus(true);
      try {
        await checkApplicationStatus(job.id);
      } catch (error) {
        console.error('Error checking application status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [job.id, checkApplicationStatus]);

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onFavoritePress?.();
  };

  const handleApplyPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApplyPress?.();
  };

  const handleCancelApplication = () => {
    if (!applicationStatus.application?.id) return;

    Alert.alert(
      '¿Cancelar aplicación?',
      'Esta acción no se puede deshacer. ¿Estás seguro de que quieres cancelar tu aplicación?',
      [
        { text: 'No, mantener', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await cancelApplication(applicationStatus.application!.id);
              if (success) {
                toast(toastMessages.applicationCancelled);
              } else {
                toast(toastMessages.applicationError);
              }
            } catch (error) {
              console.error('Error canceling application:', error);
              toast(toastMessages.applicationError);
            }
          }
        }
      ]
    );
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'SENT': return '#007AFF';
      case 'UNDER_REVIEW': return '#FF9500';
      case 'PRE_SELECTED': return '#FF6B35';
      case 'REJECTED': return '#FF453A';
      case 'HIRED': return '#32D74B';
      default: return '#8E8E93';
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={12}
          color="#FFD60A"
        />
      );
    }
    return stars;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with featured and favorite */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {job.isFeatured && (
            <View style={styles.featuredStar}>
              <Ionicons name="star" size={16} color="#FFD60A" />
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton}>
          <Ionicons
            name={job.isFavorite ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={job.isFavorite ? iconColor : secondaryTextColor}
          />
        </TouchableOpacity>
      </View>

      {/* Company and job info */}
      <View style={styles.jobInfo}>
        <View style={[styles.companyLogo, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name="briefcase-outline" size={32} color={iconColor} />
        </View>
        
        <View style={styles.jobDetails}>
          <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
            {job.title}
          </ThemedText>
          
          <View style={styles.companyInfo}>
            <ThemedText style={[styles.companyName, { color: textColor }]}>
              {job.company?.name || 'Sin especificar'}
            </ThemedText>
            <View style={styles.rating}>
              <View style={styles.stars}>
                {renderStars(job.companyRating)}
              </View>
              <ThemedText style={[styles.ratingText, { color: secondaryTextColor }]}>
                {job.companyRating}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color={secondaryTextColor} />
            <ThemedText style={[styles.locationText, { color: secondaryTextColor }]}>
              {job.location} • {job.workMode}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Job description */}
      <ThemedText style={[styles.description, { color: secondaryTextColor }]}>
        {job.description}
      </ThemedText>

      {/* Job type and experience tags */}
      <View style={styles.badges}>
        <StatusBadge status={job.jobType} size="small" />
        <StatusBadge status={mapExperienceLevelToSpanish(job.experienceLevel) as any} size="small" />
      </View>

      {/* Technical skills */}
      <View style={styles.skills}>
        {job.skills.slice(0, 4).map((skill, index) => (
          <SkillTag 
            key={index} 
            skill={skill} 
            variant="technical" 
            size="small" 
          />
        ))}
      </View>

      {/* Salary and publication info */}
      <View style={styles.metaInfo}>
        <View style={styles.salaryInfo}>
          <Ionicons name="cash-outline" size={16} color={iconColor} />
          <ThemedText style={[styles.salaryText, { color: iconColor }]}>
            {job.currency} {job.salaryMin}-{job.salaryMax}
          </ThemedText>
        </View>
        <ThemedText style={[styles.publishedDate, { color: secondaryTextColor }]}>
          {job.publishedDate}
        </ThemedText>
      </View>

      {/* Statistics */}
      <View style={styles.statistics}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={14} color={secondaryTextColor} />
          <ThemedText style={[styles.statText, { color: secondaryTextColor }]}>
            {job.applicantCount} candidatos
          </ThemedText>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="eye-outline" size={14} color={secondaryTextColor} />
          <ThemedText style={[styles.statText, { color: secondaryTextColor }]}>
            {job.viewCount} vistas
          </ThemedText>
        </View>
      </View>

      {/* Dynamic Apply Button */}
      {isCheckingStatus || applicationStatus.loading ? (
        <Shimmer>
          <View style={[styles.applyButtonSkeleton, { backgroundColor: iconColor + '30' }]} />
        </Shimmer>
      ) : applicationStatus.hasApplied && applicationStatus.application ? (
        <View style={styles.appliedSection}>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: getApplicationStatusColor(applicationStatus.application.status) }
            ]}>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <ThemedText style={styles.statusText}>
                {mapApplicationStatusToSpanish(applicationStatus.application.status)}
              </ThemedText>
            </View>
            <ThemedText style={[styles.applicationDate, { color: secondaryTextColor }]}>
              Aplicaste el {applicationStatus.application.applicationDate}
            </ThemedText>
          </View>
          <ThemedButton
            title="Cancelar aplicación"
            onPress={handleCancelApplication}
            style={styles.cancelButton}
            type="outline"
            leftIcon={<Ionicons name="close-circle-outline" size={16} color={iconColor} />}
          />
        </View>
      ) : (
        <ThemedButton
          title="Aplicar ahora"
          onPress={handleApplyPress}
          style={styles.applyButton}
          type="primary"
        />
      )}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredStar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 4,
  },
  jobInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  jobDetails: {
    flex: 1,
  },
  title: {
    marginBottom: 4,
    lineHeight: 20,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  companyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  skills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  salaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  publishedDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  statistics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
  applyButton: {
    minHeight: 44,
  },
  appliedSection: {
    gap: 12,
  },
  statusContainer: {
    gap: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  applicationDate: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  cancelButton: {
    minHeight: 44,
  },
  applyButtonSkeleton: {
    height: 44,
    borderRadius: 8,
    width: '100%',
  },
}); 