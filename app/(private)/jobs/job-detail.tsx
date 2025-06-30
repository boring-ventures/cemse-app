import { SkillTag } from '@/app/components/jobs/SkillTag';
import { StatusBadge } from '@/app/components/jobs/StatusBadge';
import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { JobOffer } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function JobDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  // Mock job data - in real app, this would come from API/store
  const job: JobOffer = {
    id: id || '1',
    title: 'Desarrollador Frontend React',
    company: 'TechCorp Bolivia',
    companyRating: 4.5,
    location: 'Cochabamba, Bolivia',
    workMode: 'Híbrido',
    description: 'Únete a nuestro equipo para desarrollar aplicaciones web modernas con React y TypeScript. Buscamos a alguien apasionado por la tecnología y el desarrollo frontend.',
    requirements: ['2+ años de experiencia en React', 'Conocimiento en TypeScript', 'Experiencia con Git y control de versiones', 'Conocimientos básicos de testing'],
    skills: ['React', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Git'],
    experienceLevel: 'Intermedio',
    jobType: 'Tiempo completo',
    salaryMin: 3500,
    salaryMax: 4500,
    currency: 'Bs.',
    publishedDate: 'Hace 2 días',
    applicationDeadline: '15 ago 2025',
    applicantCount: 47,
    viewCount: 234,
    isFeatured: true,
    isFavorite: false,
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

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira esta oferta de trabajo: ${job.title} en ${job.company}`,
        title: 'Oferta de Trabajo - CEMSE'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/jobs/apply?jobId=${job.id}`);
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

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: job.title,
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
                name={isFavorite ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={isFavorite ? iconColor : secondaryTextColor}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <ThemedText type="title" style={[styles.jobTitle, { color: textColor }]}>
                {job.title}
              </ThemedText>
              {job.isFeatured && (
                <Ionicons name="star" size={20} color="#FFD60A" />
              )}
            </View>

            <View style={styles.companyInfo}>
              <ThemedText style={[styles.companyName, { color: textColor }]}>
                {job.company}
              </ThemedText>
              <View style={styles.rating}>
                <View style={styles.stars}>
                  {renderStars(job.companyRating)}
                </View>
                <ThemedText style={[styles.ratingText, { color: secondaryTextColor }]}>
                  {job.companyRating} ({job.viewCount} reseñas)
                </ThemedText>
              </View>
            </View>

            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={16} color={secondaryTextColor} />
              <ThemedText style={[styles.locationText, { color: secondaryTextColor }]}>
                {job.location} • {job.workMode}
              </ThemedText>
            </View>

            <View style={styles.salaryRow}>
              <Ionicons name="cash-outline" size={16} color={iconColor} />
              <ThemedText style={[styles.salaryText, { color: iconColor }]}>
                {job.currency} {job.salaryMin}-{job.salaryMax}
              </ThemedText>
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={14} color={secondaryTextColor} />
                <ThemedText style={[styles.metaText, { color: secondaryTextColor }]}>
                  {job.publishedDate}
                </ThemedText>
              </View>
              {job.applicationDeadline && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={secondaryTextColor} />
                  <ThemedText style={[styles.metaText, { color: secondaryTextColor }]}>
                    Fecha límite: {job.applicationDeadline}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.badges}>
              <StatusBadge status={job.jobType} />
              <StatusBadge status={job.experienceLevel} />
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
        <ThemedButton
          title="Aplicar ahora"
          onPress={handleApply}
          type="primary"
          style={styles.applyButton}
        />
      </View>
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
}); 