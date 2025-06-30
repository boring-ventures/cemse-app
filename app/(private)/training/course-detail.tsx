import { ThemedButton } from '@/app/components/ThemedButton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { StatusBadge } from '@/app/components/training/StatusBadge';
import { VideoPlayer } from '@/app/components/training/VideoPlayer';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { DetailedCourse } from '@/app/types/training';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  // Mock detailed course data
  const course: DetailedCourse = {
    id: id || '1',
    title: 'Habilidades Blandas y Empoderamiento Personal',
    description: 'Desarrolla las competencias interpersonales y de liderazgo necesarias para destacar en el ámbito profesional moderno.',
    instructor: {
      id: '1',
      name: 'Dra. Ana Pérez',
      title: 'Coach Ejecutiva y Psicóloga Organizacional',
      bio: 'Con más de 15 años de experiencia en desarrollo humano y coaching ejecutivo, la Dra. Ana Pérez ha trabajado con ejecutivos de las principales empresas de Bolivia. Doctora en Psicología Organizacional con especializaciones en Europa.',
      rating: 4.9,
      courseCount: 12,
      experience: '15+ años de experiencia',
    },
    duration: '20 horas',
    level: 'Intermedio',
    status: 'Gratis',
    rating: 4.8,
    studentCount: 2450,
    skills: ['Liderazgo', 'Comunicación', 'Autoestima', 'Resiliencia'],
    isFavorite: false,
    videoPreviewUrl: 'preview.mp4',
    curriculum: [
      {
        id: 'module1',
        title: 'Introducción a las Habilidades Laborales',
        duration: '2h 30min',
        isCompleted: false,
        lessons: [
          {
            id: 'lesson1',
            title: 'Bienvenida al curso',
            duration: '5 min',
            type: 'video',
            isCompleted: false,
            isLocked: false,
            description: 'Introducción general al curso y metodología'
          },
          {
            id: 'lesson2',
            title: 'Fundamentos de las habilidades blandas',
            duration: '25 min',
            type: 'video',
            isCompleted: false,
            isLocked: false,
          },
          {
            id: 'lesson3',
            title: 'Autoevaluación inicial',
            duration: '15 min',
            type: 'quiz',
            isCompleted: false,
            isLocked: false,
          }
        ]
      },
      {
        id: 'module2',
        title: 'Comunicación Efectiva',
        duration: '6h 15min',
        isCompleted: false,
        lessons: [
          {
            id: 'lesson4',
            title: 'Principios de comunicación asertiva',
            duration: '30 min',
            type: 'video',
            isCompleted: false,
            isLocked: true,
          },
          {
            id: 'lesson5',
            title: 'Escucha activa en el trabajo',
            duration: '25 min',
            type: 'video',
            isCompleted: false,
            isLocked: true,
          }
        ]
      }
    ],
    learningObjectives: [
      'Fortalecer la autoestima y confianza personal',
      'Desarrollar habilidades de liderazgo efectivo',
      'Cultivar la resistencia ante desafíos',
      'Mejorar la toma de decisiones',
      'Potenciar el espíritu emprendedor',
      'Desarrollar planes de crecimiento personal'
    ],
    materialsIncluded: [
      'Videos HD de alta calidad',
      'Plantillas descargables',
      'Casos de estudio',
      'Ejercicios prácticos'
    ],
    tags: ['Desarrollo Personal', 'Liderazgo', 'Comunicación', 'Autoestima'],
    reviews: [
      {
        id: '1',
        studentName: 'María González',
        rating: 5,
        comment: 'Excelente curso, me ayudó mucho a mejorar mi confianza en el trabajo.',
        date: '15 jun 2025',
        helpful: 23
      },
      {
        id: '2',
        studentName: 'Carlos Mendoza',
        rating: 4,
        comment: 'Muy completo y bien estructurado. Recomendado.',
        date: '10 jun 2025',
        helpful: 18
      }
    ],
    includes: [
      'Videos interactivos (20 horas)',
      'Ejercicios de autoevaluación',
      'Plantillas de desarrollo personal',
      'Casos de estudio reales',
      'Certificado oficial'
    ],
    totalLessons: 30,
    certificateIncluded: true,
    lifetimeAccess: true
  };

  const tabs = [
    { id: 0, title: 'Descripción' },
    { id: 1, title: 'Temario' },
    { id: 2, title: 'Instructor' },
    { id: 3, title: 'Reseñas' }
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira este curso: ${course.title} por ${course.instructor.name}`,
        title: 'Curso CEMSE'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEnrollOrContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isEnrolled) {
      router.push(`/training/learn?id=${course.id}&lesson=lesson1`);
    } else {
      setIsEnrolled(true);
      router.push(`/training/learn?id=${course.id}&lesson=lesson1`);
    }
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

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return 'play-circle-outline';
      case 'quiz': return 'help-circle-outline';
      case 'exercise': return 'create-outline';
      case 'reading': return 'document-text-outline';
      default: return 'ellipse-outline';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Descripción
        return (
          <View>
            <ThemedText style={[styles.description, { color: secondaryTextColor }]}>
              {course.description}
            </ThemedText>
            
            <View style={styles.section}>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                Objetivos de aprendizaje
              </ThemedText>
              {course.learningObjectives.map((objective, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#32D74B" />
                  <ThemedText style={[styles.listItemText, { color: secondaryTextColor }]}>
                    {objective}
                  </ThemedText>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
                Materiales incluidos
              </ThemedText>
              {course.materialsIncluded.map((material, index) => (
                <View key={index} style={styles.listItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#32D74B" />
                  <ThemedText style={[styles.listItemText, { color: secondaryTextColor }]}>
                    {material}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        );

      case 1: // Temario
        return (
          <View>
            {course.curriculum.map((module, moduleIndex) => (
              <View key={module.id} style={styles.moduleSection}>
                <View style={styles.moduleHeader}>
                  <ThemedText type="subtitle" style={[styles.moduleTitle, { color: textColor }]}>
                    {moduleIndex + 1}. {module.title}
                  </ThemedText>
                  <ThemedText style={[styles.moduleDuration, { color: secondaryTextColor }]}>
                    {module.duration}
                  </ThemedText>
                </View>
                
                {module.lessons.map((lesson, lessonIndex) => (
                  <TouchableOpacity key={lesson.id} style={styles.lessonItem}>
                    <View style={styles.lessonInfo}>
                      <Ionicons 
                        name={getLessonIcon(lesson.type)} 
                        size={20} 
                        color={lesson.isLocked ? secondaryTextColor : iconColor} 
                      />
                      <View style={styles.lessonContent}>
                        <ThemedText style={[
                          styles.lessonTitle, 
                          { color: lesson.isLocked ? secondaryTextColor : textColor }
                        ]}>
                          {lesson.title}
                        </ThemedText>
                        <ThemedText style={[styles.lessonDuration, { color: secondaryTextColor }]}>
                          {lesson.duration}
                        </ThemedText>
                      </View>
                    </View>
                    <Ionicons 
                      name={lesson.isLocked ? 'lock-closed' : 'play-circle-outline'} 
                      size={20} 
                      color={lesson.isLocked ? secondaryTextColor : iconColor} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        );

      case 2: // Instructor
        return (
          <View>
            <View style={styles.instructorHeader}>
              <View style={[styles.instructorAvatar, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name="person" size={32} color={iconColor} />
              </View>
              <View style={styles.instructorInfo}>
                <ThemedText type="subtitle" style={[styles.instructorName, { color: textColor }]}>
                  {course.instructor.name}
                </ThemedText>
                <ThemedText style={[styles.instructorTitle, { color: secondaryTextColor }]}>
                  {course.instructor.title}
                </ThemedText>
                <View style={styles.instructorStats}>
                  <View style={styles.instructorStat}>
                    <View style={styles.stars}>
                      {renderStars(course.instructor.rating)}
                    </View>
                    <ThemedText style={[styles.instructorStatText, { color: secondaryTextColor }]}>
                      {course.instructor.rating}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.instructorStatText, { color: secondaryTextColor }]}>
                    {course.instructor.courseCount} cursos
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <ThemedText style={[styles.instructorBio, { color: secondaryTextColor }]}>
              {course.instructor.bio}
            </ThemedText>
            
            <View style={styles.instructorExperience}>
              <ThemedText style={[styles.experienceText, { color: iconColor }]}>
                {course.instructor.experience}
              </ThemedText>
            </View>
          </View>
        );

      case 3: // Reseñas
        return (
          <View>
            <View style={styles.reviewsHeader}>
              <View style={styles.reviewsStats}>
                <ThemedText type="title" style={[styles.avgRating, { color: textColor }]}>
                  {course.rating}
                </ThemedText>
                <View style={styles.stars}>
                  {renderStars(course.rating)}
                </View>
                <ThemedText style={[styles.reviewCount, { color: secondaryTextColor }]}>
                  {course.studentCount} estudiantes
                </ThemedText>
              </View>
            </View>
            
            {course.reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.reviewerAvatar, { backgroundColor: iconColor + '20' }]}>
                    <ThemedText style={[styles.reviewerInitial, { color: iconColor }]}>
                      {review.studentName.charAt(0)}
                    </ThemedText>
                  </View>
                  <View style={styles.reviewerInfo}>
                    <ThemedText style={[styles.reviewerName, { color: textColor }]}>
                      {review.studentName}
                    </ThemedText>
                    <View style={styles.reviewRating}>
                      <View style={styles.stars}>
                        {renderStars(review.rating)}
                      </View>
                      <ThemedText style={[styles.reviewDate, { color: secondaryTextColor }]}>
                        {review.date}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                
                <ThemedText style={[styles.reviewComment, { color: secondaryTextColor }]}>
                  {review.comment}
                </ThemedText>
                
                <TouchableOpacity style={styles.helpfulButton}>
                  <Ionicons name="thumbs-up-outline" size={16} color={secondaryTextColor} />
                  <ThemedText style={[styles.helpfulText, { color: secondaryTextColor }]}>
                    Útil ({review.helpful})
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen
        options={{
          title: course.title,
          headerShown: true,
          headerRight: () => (
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color={iconColor} />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Course Header */}
        <View style={styles.headerSection}>
          <ThemedText type="title" style={[styles.courseTitle, { color: textColor }]}>
            {course.title}
          </ThemedText>
          <ThemedText style={[styles.instructorText, { color: secondaryTextColor }]}>
            con {course.instructor.name}
          </ThemedText>
          
          {/* Course Badges */}
          <View style={styles.badges}>
            <StatusBadge status={course.level} />
            <StatusBadge status={course.status} />
          </View>

          {/* Course Metrics */}
          <View style={styles.metrics}>
            <View style={styles.metricItem}>
              <View style={styles.stars}>
                {renderStars(course.rating)}
              </View>
              <ThemedText style={[styles.metricText, { color: textColor }]}>
                {course.rating} ({course.studentCount} estudiantes)
              </ThemedText>
            </View>
            <View style={styles.metricRow}>
              <View style={styles.metricItem}>
                <Ionicons name="time-outline" size={16} color={iconColor} />
                <ThemedText style={[styles.metricText, { color: textColor }]}>
                  {course.duration}
                </ThemedText>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="play-circle-outline" size={16} color={iconColor} />
                <ThemedText style={[styles.metricText, { color: textColor }]}>
                  {course.totalLessons} lecciones
                </ThemedText>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="ribbon-outline" size={16} color={iconColor} />
                <ThemedText style={[styles.metricText, { color: textColor }]}>
                  Certificado incluido
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Video Preview */}
        <View style={styles.videoSection}>
          <VideoPlayer
            videoTitle="Vista previa del curso"
            duration="3:45"
            onPlay={() => console.log('Play preview')}
            onFullscreen={() => console.log('Fullscreen')}
          />
        </View>

        {/* Course Info Card */}
        <View style={[styles.infoCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedButton
            title={isEnrolled ? "Continuar curso" : "Ir al curso"}
            onPress={handleEnrollOrContinue}
            type="primary"
            style={styles.enrollButton}
          />
          
          <View style={styles.courseDetails}>
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>Duración:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>{course.duration}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>Lecciones:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>{course.totalLessons}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>Nivel:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>{course.level}</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>Certificado:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>Sí</ThemedText>
            </View>
            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>Acceso:</ThemedText>
              <ThemedText style={[styles.detailValue, { color: textColor }]}>De por vida</ThemedText>
            </View>
          </View>
        </View>

        {/* Course Includes */}
        <View style={[styles.includesCard, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <ThemedText type="subtitle" style={[styles.includesTitle, { color: textColor }]}>
            Este curso incluye
          </ThemedText>
          {course.includes.map((item, index) => (
            <View key={index} style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={16} color="#32D74B" />
              <ThemedText style={[styles.includeText, { color: secondaryTextColor }]}>
                {item}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Course Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.tabsHeader}>
            {tabs.map((tab, index) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab === index && [styles.activeTab, { borderBottomColor: iconColor }]
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(index);
                }}
              >
                <ThemedText
                  style={[
                    styles.tabText,
                    {
                      color: activeTab === index ? iconColor : secondaryTextColor,
                      fontWeight: activeTab === index ? '600' : '500'
                    }
                  ]}
                >
                  {tab.title}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.tabContent}>
            {renderTabContent()}
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  headerSection: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  courseTitle: {
    marginBottom: 8,
    lineHeight: 32,
  },
  instructorText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metrics: {
    gap: 12,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metricText: {
    fontSize: 14,
    fontWeight: '500',
  },
  stars: {
    flexDirection: 'row',
  },
  videoSection: {
    marginBottom: 20,
  },
  infoCard: {
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
  enrollButton: {
    marginBottom: 20,
  },
  courseDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  includesCard: {
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
  includesTitle: {
    marginBottom: 16,
  },
  includeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  includeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabsContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    textAlign: 'center',
  },
  tabContent: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  moduleSection: {
    marginBottom: 24,
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  moduleTitle: {
    flex: 1,
  },
  moduleDuration: {
    fontSize: 14,
    fontWeight: '500',
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
  },
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lessonContent: {
    marginLeft: 12,
    flex: 1,
  },
  lessonTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  lessonDuration: {
    fontSize: 12,
  },
  instructorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instructorInfo: {
    flex: 1,
  },
  instructorName: {
    marginBottom: 4,
  },
  instructorTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  instructorStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  instructorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  instructorStatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  instructorBio: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  instructorExperience: {
    alignSelf: 'flex-start',
  },
  experienceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewsHeader: {
    marginBottom: 24,
  },
  reviewsStats: {
    alignItems: 'center',
    gap: 8,
  },
  avgRating: {
    fontSize: 32,
  },
  reviewCount: {
    fontSize: 14,
  },
  reviewItem: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: '600',
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  helpfulText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
}); 