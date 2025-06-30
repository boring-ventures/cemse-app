import { FormField } from '@/app/components/FormField';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Course } from '@/app/types/training';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FormikProps, useFormik } from 'formik';
import React, { useState } from 'react';
import { Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { CourseCard } from './CourseCard';

interface AvailableCoursesContentProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const AvailableCoursesContent: React.FC<AvailableCoursesContentProps> = ({
  isRefreshing,
  onRefresh
}) => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('Popularidad');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  // Mock search form
  const searchForm = useFormik({
    initialValues: { search: '' },
    onSubmit: (values) => {
      console.log('Search:', values.search);
    },
  });

  // Mock courses data
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
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
    },
    {
      id: '2',
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
    },
    {
      id: '3',
      title: 'Inserción Laboral y Técnicas de Búsqueda',
      description: 'Aprende estrategias efectivas para encontrar empleo',
      instructor: 'Ana García',
      duration: '8h',
      level: 'Principiante',
      status: 'Gratis',
      rating: 4.7,
      studentCount: 1950,
      skills: ['búsqueda de empleo', 'CV', 'entrevistas'],
      isFavorite: false,
    },
    {
      id: '4',
      title: 'Emprendimiento Digital Avanzado',
      description: 'Crea y gestiona tu negocio digital exitoso',
      instructor: 'Roberto Martínez',
      duration: '15h',
      level: 'Avanzado',
      status: 'Premium',
      price: '$150 BOB',
      rating: 4.9,
      studentCount: 1200,
      skills: ['emprendimiento', 'marketing digital', 'ventas'],
      isFavorite: false,
    },
    {
      id: '5',
      title: 'Comunicación Efectiva en el Trabajo',
      description: 'Mejora tu comunicación profesional y relaciones laborales',
      instructor: 'Patricia Silva',
      duration: '12h',
      level: 'Intermedio',
      status: 'Gratis',
      rating: 4.6,
      studentCount: 2100,
      skills: ['comunicación', 'presentaciones', 'negociación'],
      isFavorite: true,
    },
    {
      id: '6',
      title: 'Tecnología y Herramientas Digitales',
      description: 'Domina las herramientas tecnológicas esenciales',
      instructor: 'Diego Morales',
      duration: '10h',
      level: 'Principiante',
      status: 'Premium',
      price: '$120 BOB',
      rating: 4.8,
      studentCount: 1750,
      skills: ['habilidades técnicas', 'software', 'productividad'],
      isFavorite: false,
    },
  ]);

  const toggleFavorite = (courseId: string) => {
    setCourses(prev =>
      prev.map(course =>
        course.id === courseId
          ? { ...course, isFavorite: !course.isFavorite }
          : course
      )
    );
  };

  const handleCoursePress = (courseId: string) => {
    router.push(`/training/course-detail?id=${courseId}`);
  };

  const handleEnrollPress = (courseId: string) => {
    console.log('Enroll in course:', courseId);
    // Here you would typically handle enrollment logic
    // For now, we'll just navigate to course detail
    router.push(`/training/course-detail?id=${courseId}`);
  };

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText type="subtitle">Filtros</ThemedText>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterSection}>
            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Nivel
              </ThemedText>
              {['Principiante', 'Intermedio', 'Avanzado'].map((level) => (
                <TouchableOpacity key={level} style={styles.filterOption}>
                  <Ionicons name="checkbox-outline" size={20} color={iconColor} />
                  <ThemedText style={[styles.filterText, { color: textColor }]}>
                    {level}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Precio
              </ThemedText>
              {['Gratis', 'Premium'].map((price) => (
                <TouchableOpacity key={price} style={styles.filterOption}>
                  <Ionicons name="checkbox-outline" size={20} color={iconColor} />
                  <ThemedText style={[styles.filterText, { color: textColor }]}>
                    {price}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Duración
              </ThemedText>
              {['1-5h', '5-10h', '10-20h', '20h+'].map((duration) => (
                <TouchableOpacity key={duration} style={styles.filterOption}>
                  <Ionicons name="checkbox-outline" size={20} color={iconColor} />
                  <ThemedText style={[styles.filterText, { color: textColor }]}>
                    {duration}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <ThemedButton
              title="Limpiar"
              onPress={() => setShowFilters(false)}
              type="outline"
              style={styles.modalButton}
            />
            <ThemedButton
              title="Aplicar"
              onPress={() => setShowFilters(false)}
              type="primary"
              style={styles.modalButton}
            />
          </View>
        </ThemedView>
      </View>
    </Modal>
  );

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
            Catálogo de Cursos
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
            Desarrolla tus habilidades con nuestros cursos especializados
          </ThemedText>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <FormField
              label=""
              placeholder="Buscar cursos, instructores, habilidades..."
              formikKey="search"
              formikProps={searchForm as FormikProps<any>}
              leftIcon={<Ionicons name="search-outline" size={20} color={secondaryTextColor} />}
              style={styles.searchInput}
            />
          </View>
          
          <View style={styles.filtersRow}>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: iconColor + '20' }]}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="options-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.filterButtonText, { color: iconColor }]}>
                Filtros
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.sortButton, { borderColor: iconColor + '40' }]}>
              <ThemedText style={[styles.sortText, { color: textColor }]}>
                {sortBy}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Courses List */}
        <View style={styles.coursesSection}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            {courses.length} cursos disponibles
          </ThemedText>

          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              variant="available"
              onPress={() => handleCoursePress(course.id)}
              onFavoritePress={() => toggleFavorite(course.id)}
              onActionPress={() => handleEnrollPress(course.id)}
            />
          ))}
        </View>
      </ScrollView>

      <FilterModal />
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
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    marginBottom: 0,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    flex: 1,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  coursesSection: {
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  filterSection: {
    maxHeight: 400,
  },
  filterGroup: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
  },
}); 