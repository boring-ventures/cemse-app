import { FormField } from '@/app/components/FormField';
import { MetricCard } from '@/app/components/dashboard/MetricCard';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { EnrolledCourse, TrainingMetric } from '@/app/types/training';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FormikProps, useFormik } from 'formik';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { CourseCard } from './CourseCard';
import { ProgressBar } from './ProgressBar';

interface MyCoursesContentProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const MyCoursesContent: React.FC<MyCoursesContentProps> = ({
  isRefreshing,
  onRefresh
}) => {
  const router = useRouter();
  const [filterBy, setFilterBy] = useState('Todos los cursos');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  // Mock search form
  const searchForm = useFormik({
    initialValues: { search: '' },
    onSubmit: (values) => {
      console.log('Search:', values.search);
    },
  });

  // Mock metrics data
  const metrics: TrainingMetric[] = [
    {
      id: 'total',
      title: 'Total de Cursos',
      value: 3,
      icon: 'book-outline',
    },
    {
      id: 'progress',
      title: 'En Progreso',
      value: 1,
      icon: 'bar-chart-outline',
    },
    {
      id: 'completed',
      title: 'Completados',
      value: 1,
      icon: 'checkmark-circle-outline',
    },
    {
      id: 'certificates',
      title: 'Certificados',
      value: 1,
      icon: 'trophy-outline',
    },
  ];

  // Mock enrolled courses data
  const enrolledCourses: EnrolledCourse[] = [
    {
      id: '1',
      title: 'Habilidades Blandas y Empoderamiento Personal',
      description: 'Fortalece tu liderazgo y habilidades interpersonales',
      instructor: 'María López',
      duration: '20h',
      level: 'Intermedio',
      status: 'Gratis',
      rating: 4.8,
      studentCount: 2750,
      skills: ['liderazgo', 'comunicación', 'trabajo en equipo'],
      isFavorite: true,
      enrollmentDate: 'Inscrito hace más de 1 año',
      progress: 25,
      state: 'En progreso',
      lessonsTotal: 30,
      lessonsCompleted: 8,
      timeInvested: '5h 30m',
      hasCertificate: true,
    },
    {
      id: '2',
      title: 'Inserción Laboral y Técnicas de Búsqueda de Empleo',
      description: 'Aprende estrategias efectivas para encontrar empleo',
      instructor: 'Ana García',
      duration: '8h',
      level: 'Principiante',
      status: 'Gratis',
      rating: 4.7,
      studentCount: 1950,
      skills: ['búsqueda de empleo', 'CV', 'entrevistas'],
      isFavorite: false,
      enrollmentDate: 'Inscrito hace más de 1 año',
      progress: 0,
      state: 'Inscrito',
      lessonsTotal: 20,
      lessonsCompleted: 0,
      timeInvested: '0h',
      hasCertificate: true,
    },
    {
      id: '3',
      title: 'Competencias Básicas Fundamentales',
      description: 'Desarrolla habilidades esenciales para el mundo laboral moderno',
      instructor: 'Carlos Rivera',
      duration: '5h',
      level: 'Principiante',
      status: 'Obligatorio',
      rating: 4.9,
      studentCount: 3180,
      skills: ['matemáticas', 'comunicación', 'pensamiento crítico'],
      isFavorite: false,
      enrollmentDate: 'Inscrito hace más de 1 año',
      progress: 100,
      state: 'Completado',
      completionDate: 'Completado hace más de 1 año',
      lessonsTotal: 15,
      lessonsCompleted: 15,
      timeInvested: '5h 30m',
      hasCertificate: true,
    },
  ];

  const filterOptions = [
    'Todos los cursos',
    'En progreso',
    'Inscrito',
    'Completado',
  ];

  const handleCoursePress = (courseId: string) => {
    router.push(`/training/course-detail?id=${courseId}`);
  };

  const handleContinuePress = (courseId: string) => {
    router.push(`/training/learn?id=${courseId}`);
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
          <ThemedText type="title" style={[styles.title, { color: textColor }]}>
            Mis Cursos
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
            Gestiona tu progreso de aprendizaje y continúa con tus cursos
          </ThemedText>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsGrid}>
            {metrics.map((metric) => (
              <MetricCard
                key={metric.id}
                metric={{
                  id: metric.id,
                  title: metric.title,
                  value: metric.value,
                  icon: metric.icon,
                }}
                onPress={() => console.log('Metric pressed:', metric.id)}
              />
            ))}
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <FormField
              label=""
              placeholder="Buscar cursos..."
              formikKey="search"
              formikProps={searchForm as FormikProps<any>}
              leftIcon={<Ionicons name="search-outline" size={20} color={secondaryTextColor} />}
              style={styles.searchInput}
            />
          </View>
          
          <View style={styles.filterRow}>
            <TouchableOpacity style={[styles.filterDropdown, { borderColor: iconColor + '40' }]}>
              <ThemedText style={[styles.filterText, { color: textColor }]}>
                {filterBy}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Courses List */}
        <View style={styles.coursesSection}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            {enrolledCourses.length} cursos
          </ThemedText>

          {enrolledCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              variant="enrolled"
              onPress={() => handleCoursePress(course.id)}
              onActionPress={() => handleContinuePress(course.id)}
            />
          ))}
        </View>

        {/* Progress Summary */}
        <View style={styles.summarySection}>
          <View style={[styles.summaryCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.summaryHeader}>
              <Ionicons name="analytics-outline" size={24} color={iconColor} />
              <ThemedText type="subtitle" style={[styles.summaryTitle, { color: textColor }]}>
                Progreso General
              </ThemedText>
            </View>
            
            <View style={styles.summaryContent}>
              <View style={styles.progressContainer}>
                <ProgressBar progress={42} color={iconColor} />
              </View>
              
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
                    Tiempo invertido
                  </ThemedText>
                  <ThemedText style={[styles.statValue, { color: textColor }]}>
                    17h 0m
                  </ThemedText>
                </View>
                
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
                    Cursos activos
                  </ThemedText>
                  <ThemedText style={[styles.statValue, { color: textColor }]}>
                    1
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsSection}>
          <View style={[styles.achievementsCard, { backgroundColor: cardBackground, borderColor }]}>
            <View style={styles.achievementsHeader}>
              <Ionicons name="trophy-outline" size={24} color="#FFD60A" />
              <ThemedText type="subtitle" style={[styles.achievementsTitle, { color: textColor }]}>
                Logros
              </ThemedText>
            </View>
            
            <View style={styles.achievementsContent}>
              <View style={styles.achievementItem}>
                <View style={styles.achievementInfo}>
                  <ThemedText style={[styles.achievementLabel, { color: secondaryTextColor }]}>
                    Cursos completados
                  </ThemedText>
                  <ThemedText style={[styles.achievementValue, { color: textColor }]}>
                    1
                  </ThemedText>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#32D74B" />
              </View>
              
              <View style={styles.achievementItem}>
                <View style={styles.achievementInfo}>
                  <ThemedText style={[styles.achievementLabel, { color: secondaryTextColor }]}>
                    Certificados obtenidos
                  </ThemedText>
                  <ThemedText style={[styles.achievementValue, { color: textColor }]}>
                    1
                  </ThemedText>
                </View>
                <Ionicons name="medal" size={20} color="#FFD60A" />
              </View>
              
              <View style={styles.achievementItem}>
                <View style={styles.achievementInfo}>
                  <ThemedText style={[styles.achievementLabel, { color: secondaryTextColor }]}>
                    Tiempo de estudio
                  </ThemedText>
                  <ThemedText style={[styles.achievementValue, { color: textColor }]}>
                    17h 0m
                  </ThemedText>
                </View>
                <Ionicons name="time" size={20} color={iconColor} />
              </View>
            </View>
          </View>
        </View>

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
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  metricsSection: {
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    flex: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  coursesSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    marginLeft: 12,
  },
  summaryContent: {
    gap: 16,
  },
  progressContainer: {
    marginBottom: 8,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  achievementsSection: {
    marginBottom: 20,
  },
  achievementsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  achievementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsTitle: {
    marginLeft: 12,
  },
  achievementsContent: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  achievementValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
}); 