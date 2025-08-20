import { FormField } from '@/app/components/FormField';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useJobSearch } from '@/app/hooks/useJobSearch';
import { useDebounce } from '@/app/hooks/useDebounce';
import { useBookmarks } from '@/app/hooks/useBookmarks';
import { useToast, toastMessages } from '@/app/hooks/useToast';
import { JobOffer, JobSearchFilters, ExperienceLevel, ContractType, WorkModality } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FormikProps, useFormik } from 'formik';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Modal, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedButton } from '../ThemedButton';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { JobCard } from './JobCard';
import Shimmer from '../Shimmer';

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
  const [appliedFilters, setAppliedFilters] = useState<JobSearchFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounce search query as per mobile spec (300ms delay)
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const { jobs, loading, error, searchJobs, refreshJobs } = useJobSearch();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const { toast } = useToast();

  // Search form - now handles both manual search and debounced search
  const searchForm = useFormik({
    initialValues: { search: '' },
    onSubmit: async (values) => {
      const filters: JobSearchFilters = {
        ...appliedFilters,
        query: values.search.trim() || undefined,
      };
      await searchJobs(filters);
    },
  });

  // Handle search input changes for debouncing
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    searchForm.setFieldValue('search', value);
  }, [searchForm]);
  
  // Clear search functionality
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    searchForm.setFieldValue('search', '');
    const filters: JobSearchFilters = {
      ...appliedFilters,
      query: undefined,
    };
    searchJobs(filters);
  }, [appliedFilters, searchForm, searchJobs]);

  // Auto-search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchForm.values.search) {
      return; // Skip if form value doesn't match (manual search in progress)
    }
    
    setIsSearching(true);
    const filters: JobSearchFilters = {
      ...appliedFilters,
      query: debouncedSearchQuery.trim() || undefined,
    };
    searchJobs(filters).finally(() => setIsSearching(false));
  }, [debouncedSearchQuery, appliedFilters, searchJobs]);

  // Load initial jobs
  useEffect(() => {
    searchJobs();
  }, []);

  // Handle external refresh
  useEffect(() => {
    if (isRefreshing) {
      refreshJobs().finally(() => {
        onRefresh();
      });
    }
  }, [isRefreshing]);

  // Mock jobs data for fallback
  const [mockJobs] = useState<JobOffer[]>([
    {
      id: '1',
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
      description: 'Únete a nuestro equipo para desarrollar aplicaciones web modernas con React y TypeScript.',
      requirements: ['2+ años de experiencia en React', 'Conocimiento en TypeScript', 'Experiencia con Git'],
      skillsRequired: ['React', 'JavaScript', 'HTML', 'CSS'],
      desiredSkills: [],
      skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      experienceLevel: 'MID_LEVEL' as const,
      jobType: 'Tiempo completo',
      salaryMin: 3500,
      salaryMax: 4500,
      salaryCurrency: 'Bs.',
      currency: 'Bs.',
      publishedDate: 'Hace 2 días',
      publishedAt: new Date().toISOString(),
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
    },
    {
      id: '2',
      title: 'Asistente Contable',
      company: {
        id: '2',
        name: 'Zenith Health',
        rating: 4.7,
        sector: 'Salud'
      },
      companyRating: 4.7,
      location: 'Cochabamba, Bolivia',
      municipality: 'Cochabamba',
      department: 'Cochabamba',
      workMode: 'Presencial',
      workModality: 'ON_SITE' as const,
      workSchedule: 'Tiempo completo',
      contractType: 'FULL_TIME' as const,
      description: 'Oportunidad para profesional en contabilidad que busque desarrollar su carrera en sector salud.',
      requirements: ['Título en Contabilidad', 'Conocimiento en SIFDE', 'Excel intermedio'],
      skillsRequired: ['Contabilidad', 'SIFDE', 'Excel', 'Análisis financiero'],
      desiredSkills: [],
      skills: ['Contabilidad', 'SIFDE', 'Excel', 'Análisis financiero'],
      experienceLevel: 'ENTRY_LEVEL' as const,
      jobType: 'Tiempo completo',
      salaryMin: 2500,
      salaryMax: 3200,
      currency: 'Bs.',
      publishedDate: 'Hace 3 días',
      applicantCount: 31,
      viewCount: 189,
      isFeatured: false,
      isFavorite: true,
      // Required properties for JobOffer interface
      applicationDeadline: undefined,
      startDate: undefined,
      endDate: undefined,
      isActive: true,
      status: 'ACTIVE' as const,
      viewsCount: 189,
      applicationsCount: 31,
      featured: false,
      expiresAt: undefined,
      publishedAt: new Date().toISOString(),
      companyId: '2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      salaryCurrency: 'Bs.',
      educationRequired: undefined,
      benefits: undefined,
    },
    {
      id: '3',
      title: 'Asistente de Marketing',
      company: {
        id: '3',
        name: 'Mindful Co.',
        rating: 4.2,
        sector: 'Marketing'
      },
      companyRating: 4.2,
      location: 'Cochabamba, Bolivia',
      workMode: 'Híbrido',
      description: 'Buscamos persona creativa para apoyar en estrategias de marketing digital y gestión de redes sociales.',
      requirements: ['Experiencia en redes sociales', 'Creatividad', 'Manejo de Photoshop'],
      skills: ['Marketing digital', 'Redes sociales', 'Photoshop', 'Creatividad'],
      experienceLevel: 'NO_EXPERIENCE' as ExperienceLevel,
      jobType: 'Medio tiempo',
      salaryMin: 1500,
      salaryMax: 2000,
      currency: 'Bs.',
      publishedDate: 'Hace 4 días',
      applicantCount: 73,
      viewCount: 412,
      isFeatured: false,
      isFavorite: false,
      // Required properties for JobOffer interface
      municipality: 'Cochabamba',
      department: 'Cochabamba',
      workModality: 'HYBRID' as const,
      workSchedule: 'Medio tiempo',
      contractType: 'PART_TIME' as const,
      skillsRequired: ['Marketing digital', 'Redes sociales', 'Photoshop', 'Creatividad'],
      desiredSkills: [],
      applicationDeadline: undefined,
      startDate: undefined,
      endDate: undefined,
      isActive: true,
      status: 'ACTIVE' as const,
      viewsCount: 412,
      applicationsCount: 73,
      featured: false,
      expiresAt: undefined,
      publishedAt: new Date().toISOString(),
      companyId: '3',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      salaryCurrency: 'Bs.',
      educationRequired: undefined,
      benefits: undefined,
    },
    {
      id: '4',
      title: 'Practicante de Ingeniería',
      company: {
        id: '4',
        name: 'BuildTech Solutions',
        rating: 4.3,
        sector: 'Construcción'
      },
      companyRating: 4.3,
      location: 'Cochabamba, Bolivia',
      workMode: 'Presencial',
      description: 'Prácticas profesionales para estudiantes de ingeniería con oportunidad de crecimiento.',
      requirements: ['Estudiante de últimos semestres', 'AutoCAD', 'Disponibilidad completa'],
      skills: ['AutoCAD', 'Matemáticas', 'Análisis', 'Comunicación'],
      experienceLevel: 'NO_EXPERIENCE' as ExperienceLevel,
      jobType: 'Prácticas',
      salaryMin: 800,
      salaryMax: 1200,
      currency: 'Bs.',
      publishedDate: 'Hace 5 días',
      applicantCount: 92,
      viewCount: 567,
      isFeatured: false,
      isFavorite: false,
      // Required properties for JobOffer interface
      municipality: 'Cochabamba',
      department: 'Cochabamba',
      workModality: 'ON_SITE' as const,
      workSchedule: 'Prácticas',
      contractType: 'INTERNSHIP' as const,
      skillsRequired: ['AutoCAD', 'Matemáticas', 'Análisis', 'Comunicación'],
      desiredSkills: [],
      applicationDeadline: undefined,
      startDate: undefined,
      endDate: undefined,
      isActive: true,
      status: 'ACTIVE' as const,
      viewsCount: 567,
      applicationsCount: 92,
      featured: false,
      expiresAt: undefined,
      publishedAt: new Date().toISOString(),
      companyId: '4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      salaryCurrency: 'Bs.',
      educationRequired: undefined,
      benefits: undefined,
    },
    {
      id: '5',
      title: 'Especialista en Ventas',
      company: {
        id: '5',
        name: 'Premium Services',
        rating: 4.6,
        sector: 'Servicios'
      },
      companyRating: 4.6,
      location: 'Cochabamba, Bolivia',
      workMode: 'Presencial',
      description: 'Oportunidad para profesional en ventas con experiencia en sector servicios premium.',
      requirements: ['3+ años en ventas', 'Licencia de conducir', 'Orientación a resultados'],
      skills: ['Ventas', 'Negociación', 'CRM', 'Comunicación'],
      experienceLevel: 'MID_LEVEL' as ExperienceLevel,
      jobType: 'Tiempo completo',
      salaryMin: 3000,
      salaryMax: 4000,
      currency: 'Bs.',
      publishedDate: 'Hace 6 días',
      applicantCount: 28,
      viewCount: 156,
      isFeatured: true,
      isFavorite: false,
      // Required properties for JobOffer interface
      municipality: 'Cochabamba',
      department: 'Cochabamba',
      workModality: 'ON_SITE' as const,
      workSchedule: 'Tiempo completo',
      contractType: 'FULL_TIME' as const,
      skillsRequired: ['Ventas', 'Negociación', 'CRM', 'Comunicación'],
      desiredSkills: [],
      applicationDeadline: undefined,
      startDate: undefined,
      endDate: undefined,
      isActive: true,
      status: 'ACTIVE' as const,
      viewsCount: 156,
      applicationsCount: 28,
      featured: true,
      expiresAt: undefined,
      publishedAt: new Date().toISOString(),
      companyId: '5',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      salaryCurrency: 'Bs.',
      educationRequired: undefined,
      benefits: undefined,
    },
  ]);

  const displayJobs = jobs.length > 0 ? jobs : mockJobs;
  
  // Job card skeleton component
  const JobCardSkeleton = () => (
    <Shimmer>
      <View style={[styles.jobCardSkeleton, { backgroundColor: cardBackgroundColor, borderColor }]}>
        {/* Header skeleton */}
        <View style={styles.skeletonHeader}>
          <View style={[styles.skeletonStar, { backgroundColor: secondaryTextColor + '30' }]} />
          <View style={[styles.skeletonFavorite, { backgroundColor: secondaryTextColor + '30' }]} />
        </View>

        {/* Job info skeleton */}
        <View style={styles.skeletonJobInfo}>
          <View style={[styles.skeletonLogo, { backgroundColor: iconColor + '20' }]} />
          <View style={styles.skeletonJobDetails}>
            <View style={[styles.skeletonTitle, { backgroundColor: secondaryTextColor + '30' }]} />
            <View style={styles.skeletonCompanyInfo}>
              <View style={[styles.skeletonCompanyName, { backgroundColor: secondaryTextColor + '30' }]} />
              <View style={[styles.skeletonRating, { backgroundColor: secondaryTextColor + '30' }]} />
            </View>
            <View style={[styles.skeletonLocation, { backgroundColor: secondaryTextColor + '30' }]} />
          </View>
        </View>

        {/* Description skeleton */}
        <View style={styles.skeletonDescriptionContainer}>
          <View style={[styles.skeletonDescriptionLine, { backgroundColor: secondaryTextColor + '30' }]} />
          <View style={[styles.skeletonDescriptionLineShort, { backgroundColor: secondaryTextColor + '30' }]} />
        </View>

        {/* Badges skeleton */}
        <View style={styles.skeletonBadges}>
          <View style={[styles.skeletonBadge, { backgroundColor: secondaryTextColor + '30' }]} />
          <View style={[styles.skeletonBadge, { backgroundColor: secondaryTextColor + '30' }]} />
        </View>

        {/* Skills skeleton */}
        <View style={styles.skeletonSkills}>
          {[1, 2, 3, 4].map((_, index) => (
            <View key={index} style={[styles.skeletonSkill, { backgroundColor: secondaryTextColor + '30' }]} />
          ))}
        </View>

        {/* Meta info skeleton */}
        <View style={styles.skeletonMetaInfo}>
          <View style={[styles.skeletonSalary, { backgroundColor: secondaryTextColor + '30' }]} />
          <View style={[styles.skeletonDate, { backgroundColor: secondaryTextColor + '30' }]} />
        </View>

        {/* Statistics skeleton */}
        <View style={styles.skeletonStatistics}>
          <View style={[styles.skeletonStat, { backgroundColor: secondaryTextColor + '30' }]} />
          <View style={[styles.skeletonStat, { backgroundColor: secondaryTextColor + '30' }]} />
        </View>

        {/* Button skeleton */}
        <View style={[styles.skeletonButton, { backgroundColor: iconColor + '30' }]} />
      </View>
    </Shimmer>
  );
  
  // Count active filters for UI indicator
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.contractType?.length) count++;
    if (appliedFilters.workModality?.length) count++;
    if (appliedFilters.experienceLevel?.length) count++;
    if (appliedFilters.salaryMin || appliedFilters.salaryMax) count++;
    if (appliedFilters.location?.length) count++;
    if (appliedFilters.sector?.length) count++;
    if (appliedFilters.publishedInDays) count++;
    return count;
  }, [appliedFilters]);

  const toggleFavorite = async (jobId: string) => {
    const success = await toggleBookmark(jobId);
    if (success) {
      const isNowBookmarked = isBookmarked(jobId);
      toast({
        title: isNowBookmarked ? "Empleo guardado" : "Empleo removido",
        description: isNowBookmarked ? "El empleo ha sido guardado en tus favoritos" : "El empleo ha sido removido de tus favoritos",
        variant: 'success'
      });
    } else {
      toast(toastMessages.unexpectedError);
    }
  };

  const handleApplyFilters = useCallback(async (filters: JobSearchFilters) => {
    setAppliedFilters(filters);
    setShowFilters(false);
    
    // Combine filters with current search query
    const combinedFilters: JobSearchFilters = {
      ...filters,
      query: searchQuery.trim() || undefined,
    };
    
    await searchJobs(combinedFilters);
  }, [searchQuery, searchJobs]);

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF453A" />
          <ThemedText style={[styles.errorTitle, { color: textColor }]}>
            Error al cargar empleos
          </ThemedText>
          <ThemedText style={[styles.errorDescription, { color: secondaryTextColor }]}>
            {error.message}
          </ThemedText>
          <ThemedButton
            title="Reintentar"
            onPress={() => searchJobs(appliedFilters)}
            type="primary"
            style={styles.retryButton}
          />
        </View>
      </ThemedView>
    );
  }

  // Filter state management
  const [filterForm, setFilterForm] = useState<JobSearchFilters>(appliedFilters);
  
  const updateFilterForm = useCallback((key: keyof JobSearchFilters, value: any) => {
    setFilterForm(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const toggleArrayFilter = useCallback((key: 'contractType' | 'workModality' | 'experienceLevel' | 'location' | 'sector', value: string) => {
    setFilterForm(prev => {
      const currentArray = prev[key] || [];
      const isSelected = currentArray.includes(value as any);
      return {
        ...prev,
        [key]: isSelected 
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  }, []);
  
  const resetFilters = useCallback(() => {
    setFilterForm({});
  }, []);
  
  const applyFilters = useCallback(() => {
    handleApplyFilters(filterForm);
  }, [filterForm, handleApplyFilters]);
  
  // Sync filter form with applied filters when modal opens
  useEffect(() => {
    if (showFilters) {
      setFilterForm(appliedFilters);
    }
  }, [showFilters, appliedFilters]);

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
              {[{ label: 'Tiempo completo', value: 'FULL_TIME' }, { label: 'Medio tiempo', value: 'PART_TIME' }, { label: 'Prácticas', value: 'INTERNSHIP' }, { label: 'Voluntariado', value: 'VOLUNTEER' }, { label: 'Freelance', value: 'FREELANCE' }].map(({ label, value }) => {
                const isSelected = filterForm.contractType?.includes(value as ContractType);
                return (
                  <TouchableOpacity 
                    key={value} 
                    style={styles.filterOption}
                    onPress={() => toggleArrayFilter('contractType', value)}
                  >
                    <Ionicons 
                      name={isSelected ? "checkbox" : "checkbox-outline"} 
                      size={20} 
                      color={isSelected ? iconColor : secondaryTextColor} 
                    />
                    <ThemedText style={[styles.filterText, { color: textColor }]}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Nivel de experiencia
              </ThemedText>
              {[{ label: 'Sin experiencia', value: 'NO_EXPERIENCE' }, { label: 'Principiante', value: 'ENTRY_LEVEL' }, { label: 'Intermedio', value: 'MID_LEVEL' }, { label: 'Avanzado', value: 'SENIOR_LEVEL' }].map(({ label, value }) => {
                const isSelected = filterForm.experienceLevel?.includes(value as ExperienceLevel);
                return (
                  <TouchableOpacity 
                    key={value} 
                    style={styles.filterOption}
                    onPress={() => toggleArrayFilter('experienceLevel', value)}
                  >
                    <Ionicons 
                      name={isSelected ? "checkbox" : "checkbox-outline"} 
                      size={20} 
                      color={isSelected ? iconColor : secondaryTextColor} 
                    />
                    <ThemedText style={[styles.filterText, { color: textColor }]}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Modalidad
              </ThemedText>
              {[{ label: 'Presencial', value: 'ON_SITE' }, { label: 'Híbrido', value: 'HYBRID' }, { label: 'Remoto', value: 'REMOTE' }].map(({ label, value }) => {
                const isSelected = filterForm.workModality?.includes(value as WorkModality);
                return (
                  <TouchableOpacity 
                    key={value} 
                    style={styles.filterOption}
                    onPress={() => toggleArrayFilter('workModality', value)}
                  >
                    <Ionicons 
                      name={isSelected ? "checkbox" : "checkbox-outline"} 
                      size={20} 
                      color={isSelected ? iconColor : secondaryTextColor} 
                    />
                    <ThemedText style={[styles.filterText, { color: textColor }]}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Ubicación
              </ThemedText>
              {['Cochabamba', 'La Paz', 'Santa Cruz', 'Tarija', 'Sucre', 'Oruro', 'Potosí', 'Beni', 'Pando'].map((location) => {
                const isSelected = filterForm.location?.includes(location);
                return (
                  <TouchableOpacity 
                    key={location} 
                    style={styles.filterOption}
                    onPress={() => toggleArrayFilter('location', location)}
                  >
                    <Ionicons 
                      name={isSelected ? "checkbox" : "checkbox-outline"} 
                      size={20} 
                      color={isSelected ? iconColor : secondaryTextColor} 
                    />
                    <ThemedText style={[styles.filterText, { color: textColor }]}>
                      {location}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Sector
              </ThemedText>
              {['Tecnología', 'Salud', 'Educación', 'Finanzas', 'Marketing', 'Ventas', 'Construcción', 'Turismo', 'Agricultura', 'Manufactura'].map((sector) => {
                const isSelected = filterForm.sector?.includes(sector);
                return (
                  <TouchableOpacity 
                    key={sector} 
                    style={styles.filterOption}
                    onPress={() => toggleArrayFilter('sector', sector)}
                  >
                    <Ionicons 
                      name={isSelected ? "checkbox" : "checkbox-outline"} 
                      size={20} 
                      color={isSelected ? iconColor : secondaryTextColor} 
                    />
                    <ThemedText style={[styles.filterText, { color: textColor }]}>
                      {sector}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Fecha de publicación
              </ThemedText>
              {[{ label: 'Último día', days: 1 }, { label: 'Última semana', days: 7 }, { label: 'Último mes', days: 30 }, { label: 'Últimos 3 meses', days: 90 }].map(({ label, days }) => {
                const isSelected = filterForm.publishedInDays === days;
                return (
                  <TouchableOpacity 
                    key={label} 
                    style={styles.filterOption}
                    onPress={() => {
                      if (isSelected) {
                        updateFilterForm('publishedInDays', null);
                      } else {
                        updateFilterForm('publishedInDays', days);
                      }
                    }}
                  >
                    <Ionicons 
                      name={isSelected ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={isSelected ? iconColor : secondaryTextColor} 
                    />
                    <ThemedText style={[styles.filterText, { color: textColor }]}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterGroup}>
              <ThemedText style={[styles.filterTitle, { color: textColor }]}>
                Rango salarial
              </ThemedText>
              {[{ label: 'Bs. 500-1500', min: 500, max: 1500 }, { label: 'Bs. 1500-3000', min: 1500, max: 3000 }, { label: 'Bs. 3000-4500', min: 3000, max: 4500 }, { label: 'Bs. 4500+', min: 4500, max: undefined }].map(({ label, min, max }) => {
                const isSelected = filterForm.salaryMin === min && filterForm.salaryMax === max;
                return (
                  <TouchableOpacity 
                    key={label} 
                    style={styles.filterOption}
                    onPress={() => {
                      if (isSelected) {
                        // Remove salary filter
                        updateFilterForm('salaryMin', undefined);
                        updateFilterForm('salaryMax', undefined);
                      } else {
                        // Apply salary filter
                        updateFilterForm('salaryMin', min);
                        updateFilterForm('salaryMax', max);
                      }
                    }}
                  >
                    <Ionicons 
                      name={isSelected ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={isSelected ? iconColor : secondaryTextColor} 
                    />
                    <ThemedText style={[styles.filterText, { color: textColor }]}>
                      {label}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <ThemedButton
              title="Limpiar"
              onPress={resetFilters}
              type="outline"
              style={styles.modalButton}
            />
            <ThemedButton
              title="Aplicar"
              onPress={applyFilters}
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
            refreshing={isRefreshing || loading}
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
              formikProps={{
                ...searchForm,
                setFieldValue: (field: string, value: string) => {
                  if (field === 'search') {
                    handleSearchChange(value);
                  } else {
                    searchForm.setFieldValue(field, value);
                  }
                },
              } as FormikProps<any>}
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
              style={[
                styles.filterButton, 
                { 
                  backgroundColor: activeFilterCount > 0 ? iconColor : iconColor + '20' 
                }
              ]}
              onPress={() => setShowFilters(true)}
            >
              <Ionicons 
                name="options-outline" 
                size={20} 
                color={activeFilterCount > 0 ? '#FFFFFF' : iconColor} 
              />
              <ThemedText 
                style={[
                  styles.filterButtonText, 
                  { color: activeFilterCount > 0 ? '#FFFFFF' : iconColor }
                ]}
              >
                Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results and Sort */}
        <View style={styles.resultsSection}>
          <View style={styles.resultsHeader}>
            <ThemedText style={[styles.resultsCount, { color: textColor }]}>
              {displayJobs.length} empleos encontrados
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
          {loading || isSearching ? (
            // Show skeleton loading states
            <>
              {[1, 2, 3, 4, 5].map((index) => (
                <JobCardSkeleton key={`skeleton-${index}`} />
              ))}
            </>
          ) : displayJobs.length > 0 ? (
            // Show actual job cards
            displayJobs.map((job) => (
              <JobCard
                key={job.id}
                job={{
                  ...job,
                  isFavorite: isBookmarked(job.id)
                }}
                onPress={() => router.push(`/jobs/job-detail?id=${job.id}`)}
                onFavoritePress={() => toggleFavorite(job.id)}
                onApplyPress={() => router.push(`/jobs/apply?jobId=${job.id}`)}
              />
            ))
          ) : (
            // Show empty state
            <View style={styles.emptyState}>
              <Ionicons name="briefcase-outline" size={64} color={secondaryTextColor} />
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No se encontraron empleos
              </ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: secondaryTextColor }]}>
                Intenta ajustar tus filtros de búsqueda o busca con términos diferentes
              </ThemedText>
            </View>
          )}
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
  },
  searchRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearSearchButton: {
    padding: 2,
  },
  // Empty state styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Job Card Skeleton Styles
  jobCardSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonStar: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  skeletonFavorite: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  skeletonJobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  skeletonLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  skeletonJobDetails: {
    flex: 1,
    gap: 6,
  },
  skeletonTitle: {
    height: 18,
    width: '80%',
    borderRadius: 4,
  },
  skeletonCompanyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonCompanyName: {
    height: 14,
    width: 100,
    borderRadius: 4,
  },
  skeletonRating: {
    height: 14,
    width: 60,
    borderRadius: 4,
  },
  skeletonLocation: {
    height: 12,
    width: '60%',
    borderRadius: 4,
  },
  skeletonDescriptionContainer: {
    marginBottom: 12,
  },
  skeletonDescriptionLine: {
    height: 14,
    width: '100%',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonDescriptionLineShort: {
    height: 14,
    width: '75%',
    borderRadius: 4,
  },
  skeletonBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  skeletonBadge: {
    height: 24,
    width: 80,
    borderRadius: 12,
  },
  skeletonSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skeletonSkill: {
    height: 20,
    width: 60,
    borderRadius: 10,
  },
  skeletonMetaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonSalary: {
    height: 16,
    width: 80,
    borderRadius: 4,
  },
  skeletonDate: {
    height: 12,
    width: 60,
    borderRadius: 4,
  },
  skeletonStatistics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonStat: {
    height: 12,
    width: 40,
    borderRadius: 4,
  },
  skeletonButton: {
    height: 36,
    width: '100%',
    borderRadius: 8,
    marginTop: 12,
  },
}); 