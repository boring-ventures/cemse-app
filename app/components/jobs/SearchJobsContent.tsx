import { FormField } from '@/app/components/FormField';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { JobOffer } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FormikProps, useFormik } from 'formik';
import React, { useState } from 'react';
import { Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { JobCard } from './JobCard';

interface SearchJobsContentProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

export const SearchJobsContent: React.FC<SearchJobsContentProps> = ({
  isRefreshing,
  onRefresh
}) => {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('Más recientes primero');
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

  // Mock jobs data
  const [jobs, setJobs] = useState<JobOffer[]>([
    {
      id: '1',
      title: 'Desarrollador Frontend React',
      company: 'TechCorp Bolivia',
      companyRating: 4.5,
      location: 'Cochabamba, Bolivia',
      workMode: 'Híbrido',
      description: 'Únete a nuestro equipo para desarrollar aplicaciones web modernas con React y TypeScript.',
      requirements: ['2+ años de experiencia', 'React', 'TypeScript', 'Git'],
      skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      experienceLevel: 'Intermedio',
      jobType: 'Tiempo completo',
      salaryMin: 3500,
      salaryMax: 4500,
      currency: 'Bs.',
      publishedDate: 'Hace 2 días',
      applicantCount: 47,
      viewCount: 234,
      isFeatured: true,
      isFavorite: false,
    },
    {
      id: '2',
      title: 'Asistente Contable',
      company: 'Zenith Health',
      companyRating: 4.7,
      location: 'Cochabamba, Bolivia',
      workMode: 'Presencial',
      description: 'Oportunidad para profesional en contabilidad que busque desarrollar su carrera en sector salud.',
      requirements: ['Título en Contabilidad', 'Conocimiento en SIFDE', 'Excel intermedio'],
      skills: ['Contabilidad', 'SIFDE', 'Excel', 'Análisis financiero'],
      experienceLevel: 'Principiante',
      jobType: 'Tiempo completo',
      salaryMin: 2500,
      salaryMax: 3200,
      currency: 'Bs.',
      publishedDate: 'Hace 3 días',
      applicantCount: 31,
      viewCount: 189,
      isFeatured: false,
      isFavorite: true,
    },
    {
      id: '3',
      title: 'Asistente de Marketing',
      company: 'Mindful Co.',
      companyRating: 4.2,
      location: 'Cochabamba, Bolivia',
      workMode: 'Híbrido',
      description: 'Buscamos persona creativa para apoyar en estrategias de marketing digital y gestión de redes sociales.',
      requirements: ['Experiencia en redes sociales', 'Creatividad', 'Manejo de Photoshop'],
      skills: ['Marketing digital', 'Redes sociales', 'Photoshop', 'Creatividad'],
      experienceLevel: 'Sin experiencia',
      jobType: 'Medio tiempo',
      salaryMin: 1500,
      salaryMax: 2000,
      currency: 'Bs.',
      publishedDate: 'Hace 4 días',
      applicantCount: 73,
      viewCount: 412,
      isFeatured: false,
      isFavorite: false,
    },
    {
      id: '4',
      title: 'Practicante de Ingeniería',
      company: 'BuildTech Solutions',
      companyRating: 4.3,
      location: 'Cochabamba, Bolivia',
      workMode: 'Presencial',
      description: 'Prácticas profesionales para estudiantes de ingeniería con oportunidad de crecimiento.',
      requirements: ['Estudiante de últimos semestres', 'AutoCAD', 'Disponibilidad completa'],
      skills: ['AutoCAD', 'Matemáticas', 'Análisis', 'Comunicación'],
      experienceLevel: 'Sin experiencia',
      jobType: 'Prácticas',
      salaryMin: 800,
      salaryMax: 1200,
      currency: 'Bs.',
      publishedDate: 'Hace 5 días',
      applicantCount: 92,
      viewCount: 567,
      isFeatured: false,
      isFavorite: false,
    },
    {
      id: '5',
      title: 'Especialista en Ventas',
      company: 'Premium Services',
      companyRating: 4.6,
      location: 'Cochabamba, Bolivia',
      workMode: 'Presencial',
      description: 'Oportunidad para profesional en ventas con experiencia en sector servicios premium.',
      requirements: ['3+ años en ventas', 'Licencia de conducir', 'Orientación a resultados'],
      skills: ['Ventas', 'Negociación', 'CRM', 'Comunicación'],
      experienceLevel: 'Intermedio',
      jobType: 'Tiempo completo',
      salaryMin: 3000,
      salaryMax: 4000,
      currency: 'Bs.',
      publishedDate: 'Hace 6 días',
      applicantCount: 28,
      viewCount: 156,
      isFeatured: true,
      isFavorite: false,
    },
  ]);

  const toggleFavorite = (jobId: string) => {
    setJobs(prev =>
      prev.map(job =>
        job.id === jobId
          ? { ...job, isFavorite: !job.isFavorite }
          : job
      )
    );
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
                Tipo de trabajo
              </ThemedText>
              {['Tiempo completo', 'Medio tiempo', 'Prácticas'].map((type) => (
                <TouchableOpacity key={type} style={styles.filterOption}>
                  <Ionicons name="checkbox-outline" size={20} color={iconColor} />
                  <ThemedText style={[styles.filterText, { color: textColor }]}>
                    {type}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Nivel de experiencia
              </ThemedText>
              {['Principiante', 'Intermedio', 'Avanzado', 'Sin experiencia'].map((level) => (
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
                Modalidad
              </ThemedText>
              {['Presencial', 'Híbrido', 'Remoto'].map((mode) => (
                <TouchableOpacity key={mode} style={styles.filterOption}>
                  <Ionicons name="checkbox-outline" size={20} color={iconColor} />
                  <ThemedText style={[styles.filterText, { color: textColor }]}>
                    {mode}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Rango salarial
              </ThemedText>
              {['Bs. 500-1500', 'Bs. 1500-3000', 'Bs. 3000-4500', 'Bs. 4500+'].map((range) => (
                <TouchableOpacity key={range} style={styles.filterOption}>
                  <Ionicons name="checkbox-outline" size={20} color={iconColor} />
                  <ThemedText style={[styles.filterText, { color: textColor }]}>
                    {range}
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
            Buscar Empleos
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
            Encuentra oportunidades laborales que se ajusten a tu perfil
          </ThemedText>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <FormField
              label=""
              placeholder="Buscar por título, empresa, habilidades..."
              formikKey="search"
              formikProps={searchForm as FormikProps<any>}
              leftIcon={<Ionicons name="search-outline" size={20} color={secondaryTextColor} />}
              style={styles.searchInput}
            />
          </View>
          
          <View style={styles.searchActions}>
            <ThemedButton
              title="Buscar"
              onPress={() => searchForm.handleSubmit()}
              type="primary"
              style={styles.searchButton}
            />
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: iconColor + '20' }]}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons name="options-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.filterButtonText, { color: iconColor }]}>
                Filtros
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results and Sort */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <ThemedText style={[styles.resultsCount, { color: textColor }]}>
              {jobs.length} empleos encontrados
            </ThemedText>
            <TouchableOpacity style={[styles.sortButton, { borderColor: iconColor + '40' }]}>
              <ThemedText style={[styles.sortText, { color: textColor }]}>
                {sortBy}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Jobs List */}
        <View style={styles.jobsSection}>
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onPress={() => router.push(`/jobs/job-detail?id=${job.id}`)}
              onFavoritePress={() => toggleFavorite(job.id)}
              onApplyPress={() => router.push(`/jobs/apply?jobId=${job.id}`)}
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
  searchActions: {
    flexDirection: 'row',
    gap: 12,
  },
  searchButton: {
    flex: 1,
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
  resultsSection: {
    marginBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  jobsSection: {
    paddingBottom: 40,
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