import { SkillTag } from '@/app/components/jobs/SkillTag';
import { StatusBadge } from '@/app/components/jobs/StatusBadge';
import { CVCheckModal } from '@/app/components/jobs/CVCheckModal';
import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useApplicationStatus } from '@/app/hooks/useApplicationStatus';
import { useCVStatus } from '@/app/hooks/useCVStatus';
import { useToast, toastMessages } from '@/app/hooks/useToast';
import { useBookmarks } from '@/app/hooks/useBookmarks';
import { JobOffer, mapExperienceLevelToSpanish, mapContractTypeToSpanish, mapApplicationStatusToSpanish } from '@/app/types/jobs';
import { apiService } from '@/app/services/apiService';
import { useAuthStore } from '@/app/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import Shimmer from '@/app/components/Shimmer';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tokens } = useAuthStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [job, setJob] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCVCheck, setShowCVCheck] = useState(false);

  const { applicationStatus, checkApplicationStatus, cancelApplication } = useApplicationStatus();
  const { hasCV, hasCoverLetter, checkCVStatus } = useCVStatus();
  const { toast } = useToast();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  // Fetch job data and application status from API
  useEffect(() => {
    if (id && tokens?.token) {
      fetchJobDetail();
      checkApplicationStatus(id);
      checkCVStatus();
    }
  }, [id, tokens?.token, checkApplicationStatus, checkCVStatus]);

  const fetchJobDetail = async () => {
    if (!id || !tokens?.token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getJobDetail(tokens.token, id);
      if (response.success && response.data) {
        // Transform API data to UI format
        const apiJob = response.data;
        const transformedJob: JobOffer = {
          ...apiJob,
          companyRating: apiJob.company?.rating || 4.0,
          workMode: apiJob.workModality === 'ON_SITE' ? 'Presencial' : 
                    apiJob.workModality === 'REMOTE' ? 'Remoto' : 'Híbrido',
          skills: [...(apiJob.skillsRequired || []), ...(apiJob.desiredSkills || [])],
          jobType: apiJob.contractType === 'FULL_TIME' ? 'Tiempo completo' :
                   apiJob.contractType === 'PART_TIME' ? 'Medio tiempo' : 'Prácticas',
          currency: apiJob.salaryCurrency || 'Bs.',
          publishedDate: new Date(apiJob.publishedAt).toLocaleDateString('es-ES'),
          applicantCount: apiJob.applicationsCount,
          viewCount: apiJob.viewsCount,
          isFeatured: apiJob.featured,
          isFavorite: false, // TODO: Implement favorites
          company: apiJob.company?.name || 'Sin especificar',
          companySize: apiJob.company?.size,
          industry: apiJob.company?.sector,
          companyDescription: apiJob.company?.description,
          responsibilities: apiJob.requirements ? [apiJob.requirements] : undefined,
          benefits: apiJob.benefits ? [apiJob.benefits] : undefined,
        };
        setJob(transformedJob);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch job details');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching job detail:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mock job data for fallback
  const mockJob: JobOffer = {
    id: id || '1',
    title: 'Desarrollador Frontend React',
    company: {
      id: '1',
      name: 'TechCorp Bolivia',
      rating: 4.5,
      sector: 'Tecnología'
    },
    companyRating: 4.5,
    location: 'Cochabamba, Bolivia',
    municipality: 'Cochabamba',
    department: 'Cochabamba',
    workMode: 'Híbrido',
    workModality: 'HYBRID' as const,
    workSchedule: 'Tiempo completo',
    contractType: 'FULL_TIME' as const,
    description: 'Únete a nuestro equipo para desarrollar aplicaciones web modernas con React y TypeScript. Buscamos a alguien apasionado por la tecnología y el desarrollo frontend.',
    requirements: ['2+ años de experiencia en React', 'Conocimiento en TypeScript', 'Experiencia con Git y control de versiones', 'Conocimientos básicos de testing'],
    skillsRequired: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Git'],
    desiredSkills: [],
    skills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Git'],
    experienceLevel: 'MID_LEVEL' as const,
    jobType: 'Tiempo completo',
    salaryMin: 3500,
    salaryMax: 4500,
    salaryCurrency: 'Bs.',
    currency: 'Bs.',
    publishedDate: 'Hace 2 días',
    publishedAt: new Date().toISOString(),
    applicationDeadline: '15 ago 2025',
    applicantCount: 47,
    applicationsCount: 47,
    viewCount: 234,
    viewsCount: 234,
    isFeatured: true,
    featured: true,
    isFavorite: false,
    isActive: true,
    status: 'ACTIVE' as const,
    companyId: '1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responsibilities: [
      'Desarrollar interfaces de usuario atractivas y funcionales',
      'Colaborar con el equipo de diseño para implementar mockups',
      'Escribir código limpio y mantenible',
      'Participar en revisiones de código y metodologías ágiles',
      'Optimizar aplicaciones para máximo rendimiento'
    ],
    benefits: [
      'Seguro médico privado',
      'Horario flexible',
      'Trabajo remoto parcial',
      'Capacitación continua',
      'Ambiente laboral moderno'
    ],
    companySize: '50-200 empleados',
    industry: 'Tecnología',
    companyDescription: 'TechCorp Bolivia es una empresa líder en desarrollo de software con más de 10 años de experiencia en el mercado boliviano. Nos especializamos en soluciones web y móviles para empresas de diversos sectores.'
  };

  const handleFavoritePress = async () => {
    if (!job) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const success = await toggleBookmark(job.id);
    if (success) {
      const isNowBookmarked = isBookmarked(job.id);
      toast({
        title: isNowBookmarked ? "Empleo guardado" : "Empleo removido",
        description: isNowBookmarked ? "El empleo ha sido guardado en tus favoritos" : "El empleo ha sido removido de tus favoritos",
        variant: 'success'
      });
    } else {
      toast(toastMessages.unexpectedError);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira esta oferta de trabajo: ${displayJob.title} en ${displayJob.company}`,
        title: 'Oferta de Trabajo - CEMSE'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleApply = () => {
    if (!job) return;
    
    // Check if documents are available
    if (!hasCV && !hasCoverLetter) {
      setShowCVCheck(true);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/jobs/apply?jobId=${job.id}`);
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

  const handleDocumentsReady = () => {
    setShowCVCheck(false);
    // Proceed with application after documents are ready
    if (job) {
      router.push(`/jobs/apply?jobId=${job.id}`);
    }
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

  const handleSaveJob = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Empleo guardado', 'Este empleo ha sido guardado en tus favoritos');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? 'star' : 'star-outline'}
          size={14}
          color="#FFD60A"
        />
      );
    }
    return stars;
  };

  // Job Detail Skeleton Components
  const JobDetailSkeleton = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header Card Skeleton */}
      <Shimmer>
        <View style={[styles.headerCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.headerTop}>
            <View style={[styles.skeletonLogo, { backgroundColor: secondaryTextColor + '30' }]} />
            <View style={[styles.skeletonFavorite, { backgroundColor: secondaryTextColor + '30' }]} />
          </View>
          <View style={styles.headerInfo}>
            <View style={[styles.skeletonTitle, { backgroundColor: secondaryTextColor + '30' }]} />
            <View style={[styles.skeletonCompany, { backgroundColor: secondaryTextColor + '30' }]} />
            <View style={[styles.skeletonLocation, { backgroundColor: secondaryTextColor + '30' }]} />
            <View style={[styles.skeletonSalary, { backgroundColor: iconColor + '30' }]} />
            <View style={styles.skeletonBadges}>
              <View style={[styles.skeletonBadge, { backgroundColor: secondaryTextColor + '30' }]} />
              <View style={[styles.skeletonBadge, { backgroundColor: secondaryTextColor + '30' }]} />
            </View>
          </View>
        </View>
      </Shimmer>

      {/* Section Cards Skeleton */}
      {[1, 2, 3, 4].map((index) => (
        <Shimmer key={index}>
          <View style={[styles.sectionCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
            <View style={[styles.skeletonSectionTitle, { backgroundColor: secondaryTextColor + '30' }]} />
            <View style={styles.skeletonContent}>
              <View style={[styles.skeletonLine, { backgroundColor: secondaryTextColor + '30' }]} />
              <View style={[styles.skeletonLineShort, { backgroundColor: secondaryTextColor + '30' }]} />
              <View style={[styles.skeletonLine, { backgroundColor: secondaryTextColor + '30' }]} />
            </View>
          </View>
        </Shimmer>
      ))}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );

  if (loading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: 'Cargando...',
            headerShown: true,
          }}
        />
        <JobDetailSkeleton />
        
        {/* Action Bar Skeleton */}
        <View style={[styles.actionBar, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <Shimmer>
            <View style={[styles.skeletonActionButton, { backgroundColor: secondaryTextColor + '30' }]} />
          </Shimmer>
          <Shimmer>
            <View style={[styles.skeletonActionButton, { backgroundColor: iconColor + '30' }]} />
          </Shimmer>
        </View>
      </ThemedView>
    );
  }

  if (error || !job) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Stack.Screen
          options={{
            title: 'Error',
            headerShown: true,
          }}
        />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF453A" />
          <ThemedText style={[styles.errorTitle, { color: textColor }]}>
            Error al cargar el empleo
          </ThemedText>
          <ThemedText style={[styles.errorDescription, { color: secondaryTextColor }]}>
            {error || 'No se pudo encontrar la información del empleo'}
          </ThemedText>
          <ThemedButton
            title="Reintentar"
            onPress={fetchJobDetail}
            type="primary"
            style={styles.retryButton}
          />
          <ThemedButton
            title="Volver"
            onPress={() => router.back()}
            type="outline"
            style={styles.backButton}
          />
        </View>
      </ThemedView>
    );
  }

  const displayJob = job || mockJob;

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: displayJob.title,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color={iconColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.headerTop}>
            <View style={[styles.companyLogo, { backgroundColor: iconColor + '20' }]}>
              <Ionicons name="briefcase-outline" size={40} color={iconColor} />
            </View>
            <TouchableOpacity onPress={handleFavoritePress} style={styles.favoriteButton}>
              <Ionicons
                name={job && isBookmarked(job.id) ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={job && isBookmarked(job.id) ? iconColor : secondaryTextColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <ThemedText type="title" style={[styles.jobTitle, { color: textColor }]}>
                {displayJob.title}
              </ThemedText>
              {displayJob.isFeatured && (
                <Ionicons name="star" size={20} color="#FFD60A" />
              )}
            </View>

            <View style={styles.companyInfo}>
              <ThemedText style={[styles.companyName, { color: textColor }]}>
                {displayJob.company?.name || 'Sin especificar'}
              </ThemedText>
              <View style={styles.rating}>
                <View style={styles.stars}>
                  {renderStars(displayJob.companyRating)}
                </View>
                <ThemedText style={[styles.ratingText, { color: secondaryTextColor }]}>
                  {displayJob.companyRating} ({displayJob.viewCount} reseñas)
                </ThemedText>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={secondaryTextColor} />
              <ThemedText style={[styles.locationText, { color: secondaryTextColor }]}>
                {displayJob.location} • {displayJob.workMode}
              </ThemedText>
            </View>

            <View style={styles.salaryRow}>
              <Ionicons name="cash-outline" size={16} color={iconColor} />
              <ThemedText style={[styles.salaryText, { color: iconColor }]}>
                {displayJob.currency} {displayJob.salaryMin}-{displayJob.salaryMax}
              </ThemedText>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={secondaryTextColor} />
                <ThemedText style={[styles.metaText, { color: secondaryTextColor }]}>
                  {displayJob.publishedDate}
                </ThemedText>
              </View>
              {displayJob.applicationDeadline && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={secondaryTextColor} />
                  <ThemedText style={[styles.metaText, { color: secondaryTextColor }]}>
                    Fecha límite: {displayJob.applicationDeadline}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.badges}>
              <StatusBadge status={mapContractTypeToSpanish(displayJob.contractType) as any} />
              <StatusBadge status={mapExperienceLevelToSpanish(displayJob.experienceLevel) as any} />
            </View>
          </View>
        </View>

        {/* Company Info Card */}
        <View style={[styles.sectionCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Información de la empresa
          </ThemedText>
          
          <View style={styles.companyDetails}>
            <View style={styles.companyDetailRow}>
              <Ionicons name="people-outline" size={16} color={iconColor} />
              <ThemedText style={[styles.companyDetailText, { color: textColor }]}>
                {job.companySize}
              </ThemedText>
            </View>
            <View style={styles.companyDetailRow}>
              <Ionicons name="business-outline" size={16} color={iconColor} />
              <ThemedText style={[styles.companyDetailText, { color: textColor }]}>
                {job.industry}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[styles.companyDescription, { color: secondaryTextColor }]}>
            {job.companyDescription}
          </ThemedText>
        </View>

        {/* Job Description Card */}
        <View style={[styles.sectionCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Descripción del puesto
          </ThemedText>
          <ThemedText style={[styles.description, { color: secondaryTextColor }]}>
            {job.description}
          </ThemedText>
        </View>

        {/* Responsibilities Card */}
        {job.responsibilities && (
          <View style={[styles.sectionCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
              Responsabilidades
            </ThemedText>
            {job.responsibilities.map((responsibility, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bulletPoint, { backgroundColor: iconColor }]} />
                <ThemedText style={[styles.listItemText, { color: secondaryTextColor }]}>
                  {responsibility}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Requirements Card */}
        <View style={[styles.sectionCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Requisitos
          </ThemedText>
          {job.requirements.map((requirement, index) => (
            <View key={index} style={styles.listItem}>
              <View style={[styles.bulletPoint, { backgroundColor: iconColor }]} />
              <ThemedText style={[styles.listItemText, { color: secondaryTextColor }]}>
                {requirement}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Skills Card */}
        <View style={[styles.sectionCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Habilidades técnicas
          </ThemedText>
          <View style={styles.skillsContainer}>
            {job.skills.map((skill, index) => (
              <SkillTag key={index} skill={skill} variant="technical" />
            ))}
          </View>
        </View>

        {/* Benefits Card */}
        {job.benefits && (
          <View style={[styles.sectionCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
              Beneficios
            </ThemedText>
            {job.benefits.map((benefit, index) => (
              <View key={index} style={styles.listItem}>
                <Ionicons name="checkmark-circle" size={16} color="#32D74B" />
                <ThemedText style={[styles.listItemText, { color: secondaryTextColor }]}>
                  {benefit}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Application Stats Card */}
        <View style={[styles.sectionCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Estadísticas de la aplicación
          </ThemedText>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {job.applicantCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
                Candidatos
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {job.viewCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
                Visualizaciones
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                2-3 días
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
                Tiempo respuesta
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionBar, { backgroundColor: cardBackgroundColor, borderColor }]}>
        <ThemedButton
          title="Guardar empleo"
          onPress={handleSaveJob}
          type="outline"
          style={styles.saveButton}
        />
        
        {/* Dynamic Apply Button */}
        {applicationStatus.loading ? (
          <ThemedButton
            title="Verificando aplicación..."
            disabled
            type="primary"
            style={styles.applyButton}
            leftIcon={<Ionicons name="sync" size={16} color="#FFFFFF" />}
          />
        ) : applicationStatus.hasApplied && applicationStatus.application ? (
          <View style={styles.appliedContainer}>
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
            <ThemedButton
              title="Cancelar aplicación"
              onPress={handleCancelApplication}
              type="outline"
              style={styles.cancelButton}
              leftIcon={<Ionicons name="close-circle-outline" size={16} color={iconColor} />}
            />
          </View>
        ) : (
          <ThemedButton
            title="Aplicar ahora"
            onPress={handleApply}
            type="primary"
            style={styles.applyButton}
          />
        )}
      </View>

      {/* CV Check Modal */}
      <CVCheckModal
        isOpen={showCVCheck}
        onClose={() => setShowCVCheck(false)}
        onDocumentsReady={handleDocumentsReady}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerButton: {
    padding: 8,
  },
  headerCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    padding: 8,
  },
  headerInfo: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  jobTitle: {
    flex: 1,
    lineHeight: 28,
  },
  companyInfo: {
    gap: 6,
  },
  companyName: {
    fontSize: 18,
    fontWeight: '600',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '500',
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  salaryText: {
    fontSize: 18,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  companyDetails: {
    gap: 8,
    marginBottom: 16,
  },
  companyDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  companyDetailText: {
    fontSize: 16,
    fontWeight: '500',
  },
  companyDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    gap: 12,
  },
  saveButton: {
    flex: 1,
  },
  applyButton: {
    flex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
    marginBottom: 12,
  },
  backButton: {
    minWidth: 120,
  },
  appliedContainer: {
    flex: 2,
    gap: 8,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  applicationDate: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  cancelButton: {
    width: '100%',
  },
  // Skeleton styles
  skeletonLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
  },
  skeletonFavorite: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  skeletonTitle: {
    height: 28,
    width: '80%',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonCompany: {
    height: 20,
    width: '60%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonLocation: {
    height: 16,
    width: '70%',
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonSalary: {
    height: 20,
    width: '50%',
    borderRadius: 4,
    marginBottom: 12,
  },
  skeletonBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonBadge: {
    height: 24,
    width: 80,
    borderRadius: 12,
  },
  skeletonSectionTitle: {
    height: 20,
    width: '50%',
    borderRadius: 4,
    marginBottom: 16,
  },
  skeletonContent: {
    gap: 8,
  },
  skeletonLine: {
    height: 16,
    width: '100%',
    borderRadius: 4,
  },
  skeletonLineShort: {
    height: 16,
    width: '75%',
    borderRadius: 4,
  },
  skeletonActionButton: {
    height: 48,
    flex: 1,
    borderRadius: 8,
  },
}); 