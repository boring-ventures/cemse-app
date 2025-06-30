import { useThemeColor } from '@/app/hooks/useThemeColor';
import { Resource, ResourceFilter, ResourceMetrics as ResourceMetricsType } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { FormikProps, useFormik } from 'formik';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormField } from '../../components/FormField';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { FilterModal } from '../../components/entrepreneurship/FilterModal';
import { ResourceCard } from '../../components/entrepreneurship/ResourceCard';
import { ResourceMetrics } from '../../components/entrepreneurship/ResourceMetrics';

export default function ResourceCenter() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('Más populares');
  const [filters, setFilters] = useState<ResourceFilter>({
    types: [],
    levels: [],
    categories: [],
    durations: [],
    dateRanges: [],
    searchQuery: '',
  });
  
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');

  // Search form
  const searchForm = useFormik({
    initialValues: { search: filters.searchQuery },
    onSubmit: (values) => {
      setFilters(prev => ({ ...prev, searchQuery: values.search }));
    },
  });

  // Mock metrics data
  const metrics: ResourceMetricsType[] = [
    {
      id: 'total',
      title: 'Recursos Totales',
      value: '6',
      icon: 'library-outline',
      color: '#007AFF',
    },
    {
      id: 'downloads',
      title: 'Descargas Totales',
      value: '12,841',
      icon: 'download-outline',
      color: '#32D74B',
    },
    {
      id: 'rating',
      title: 'Calificación Promedio',
      value: '4.7',
      icon: 'star',
      color: '#FFD60A',
    },
    {
      id: 'categories',
      title: 'Categorías',
      value: '5',
      icon: 'grid-outline',
      color: '#5856D6',
    },
  ];

  // Mock resources data
  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      type: 'Video',
      level: 'Intermedio',
      title: 'Finanzas para Emprendedores',
      description: 'Video curso completo sobre gestión financiera básica para startups. Aprende a manejar flujo de caja, proyecciones y métricas financieras clave.',
      category: 'Finanzas',
      duration: '2 horas',
      rating: 4.9,
      ratingCount: 234,
      downloads: 3456,
      fileInfo: 'MP4 • 850 MB',
      fileSize: '850 MB',
      publishDate: '2024-01-09',
      tags: ['Finanzas', 'Flujo de Caja', 'Métricas', 'Startups'],
      isFavorite: false,
      author: 'Carlos Mendoza',
    },
    {
      id: '2',
      type: 'Plantilla',
      level: 'Principiante',
      title: 'Plantilla de Plan de Negocios 2024',
      description: 'Plantilla completa en Word con todas las secciones necesarias para crear un plan de negocios profesional. Incluye ejemplos y guías paso a paso.',
      category: 'Planificación',
      duration: '30 minutos',
      rating: 4.8,
      ratingCount: 156,
      downloads: 2847,
      fileInfo: 'DOCX • 2.5 MB',
      fileSize: '2.5 MB',
      publishDate: '2024-01-14',
      tags: ['Plan de Negocios', 'Startups', 'Plantilla', 'Planificación'],
      isFavorite: true,
      author: 'CEMSE Bolivia',
    },
    {
      id: '3',
      type: 'Video',
      level: 'Avanzado',
      title: 'Cómo Presentar tu Startup a Inversionistas',
      description: 'Masterclass completa sobre cómo crear y presentar un pitch deck efectivo. Incluye plantillas y ejemplos de presentaciones exitosas.',
      category: 'Fundraising',
      duration: '1.5 horas',
      rating: 4.8,
      ratingCount: 145,
      downloads: 2156,
      fileInfo: 'MP4 • 1.2 GB',
      fileSize: '1.2 GB',
      publishDate: '2024-01-24',
      tags: ['Pitch Deck', 'Inversión', 'Presentación', 'Fundraising'],
      isFavorite: false,
      author: 'Ana Rodríguez',
    },
    {
      id: '4',
      type: 'Guía',
      level: 'Intermedio',
      title: 'Guía de Validación de Mercado',
      description: 'Metodología completa para validar tu idea de negocio antes de invertir tiempo y dinero. Incluye herramientas prácticas y casos de estudio.',
      category: 'Validación',
      duration: '45 minutos',
      rating: 4.6,
      ratingCount: 98,
      downloads: 1923,
      fileInfo: 'PDF • 5.1 MB',
      fileSize: '5.1 MB',
      publishDate: '2024-01-19',
      tags: ['Validación', 'Investigación de Mercado', 'MVP', 'Metodología'],
      isFavorite: false,
      author: 'Dr. María Rodríguez',
    },
    {
      id: '5',
      type: 'Herramienta',
      level: 'Avanzado',
      title: 'Calculadora de Proyecciones Financieras',
      description: 'Herramienta Excel interactiva para calcular proyecciones financieras automáticamente. Incluye gráficos dinámicos y análisis de sensibilidad.',
      category: 'Finanzas',
      duration: '15 minutos',
      rating: 4.7,
      ratingCount: 89,
      downloads: 1567,
      fileInfo: 'XLSX • 1.2 MB',
      fileSize: '1.2 MB',
      publishDate: '2024-01-31',
      tags: ['Excel', 'Proyecciones', 'Automatización', 'Herramientas'],
      isFavorite: true,
      author: 'Roberto Silva',
    },
    {
      id: '6',
      type: 'Podcast',
      level: 'Principiante',
      title: 'Podcast: Emprendedores Bolivianos Exitosos',
      description: 'Serie de entrevistas inspiradoras con emprendedores bolivianos que han escalado sus negocios. Aprende de sus experiencias y estrategias.',
      category: 'Inspiración',
      duration: '30 minutos',
      rating: 4.5,
      ratingCount: 67,
      downloads: 892,
      fileInfo: 'MP3 • 45 MB',
      fileSize: '45 MB',
      publishDate: '2024-02-04',
      tags: ['Historias de Éxito', 'Inspiración', 'Casos Bolivianos', 'Experiencias'],
      isFavorite: false,
      author: 'Podcast Emprende Bolivia',
    },
  ]);

  const sortOptions = [
    'Más populares',
    'Más recientes',
    'Mejor calificados',
    'Más descargados',
  ];

  const categoryOptions = [
    'Todas las categorías',
    'Finanzas',
    'Planificación',
    'Marketing',
    'Validación',
    'Fundraising',
    'Inspiración',
  ];

  const typeOptions = [
    'Todos los tipos',
    'Video',
    'Plantilla',
    'Guía',
    'Herramienta',
    'Podcast',
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const handleMetricPress = (metricId: string) => {
    console.log('Metric pressed:', metricId);
  };

  const handleResourcePress = (resource: Resource) => {
    console.log('Resource pressed:', resource.title);
    // Navigate to resource detail or preview
  };

  const handleResourcePreview = (resource: Resource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Preview resource:', resource.title);
    // Show preview modal
  };

  const handleResourceDownload = (resource: Resource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log('Download resource:', resource.title);
    // Handle download with progress
  };

  const handleFavoritePress = (resourceId: string) => {
    setResources(prev =>
      prev.map(resource =>
        resource.id === resourceId
          ? { ...resource, isFavorite: !resource.isFavorite }
          : resource
      )
    );
  };

  const handleFiltersChange = (newFilters: ResourceFilter) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    searchForm.handleSubmit();
  };

  const getFilteredResources = () => {
    let filtered = [...resources];
    
    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply type filter
    if (filters.types.length > 0) {
      filtered = filtered.filter(resource => filters.types.includes(resource.type));
    }
    
    // Apply level filter
    if (filters.levels.length > 0) {
      filtered = filtered.filter(resource => filters.levels.includes(resource.level));
    }
    
    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(resource => filters.categories.includes(resource.category));
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'Más recientes':
          return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
        case 'Mejor calificados':
          return b.rating - a.rating;
        case 'Más descargados':
          return b.downloads - a.downloads;
        case 'Más populares':
        default:
          return b.downloads - a.downloads; // Default to downloads for popularity
      }
    });
    
    return filtered;
  };

  const filteredResources = getFilteredResources();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <ThemedText type="title" style={[styles.headerTitle, { color: textColor }]}>
              Centro de Recursos
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: secondaryTextColor }]}>
              Accede a plantillas, guías, videos y herramientas para hacer crecer tu emprendimiento
            </ThemedText>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={iconColor}
              colors={[iconColor]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Metrics Section */}
          <ResourceMetrics 
            metrics={metrics}
            onMetricPress={handleMetricPress}
          />

          {/* Search and Filter Section */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <FormField
                label=""
                placeholder="Buscar recursos por título, descripción o etiquetas..."
                formikKey="search"
                formikProps={searchForm as FormikProps<any>}
                leftIcon={<Ionicons name="search-outline" size={20} color={secondaryTextColor} />}
                style={styles.searchInput}
                onSubmitEditing={handleSearch}
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
                {(filters.types.length + filters.levels.length + filters.categories.length) > 0 && (
                  <View style={[styles.filterBadge, { backgroundColor: '#FF3B30' }]}>
                    <ThemedText style={styles.filterBadgeText}>
                      {filters.types.length + filters.levels.length + filters.categories.length}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sortButton, { borderColor: borderColor + '60' }]}>
                <ThemedText style={[styles.sortText, { color: textColor }]}>
                  {sortBy}
                </ThemedText>
                <Ionicons name="chevron-down" size={16} color={secondaryTextColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Results Counter */}
          <View style={styles.resultsSection}>
            <ThemedText style={[styles.resultsCount, { color: textColor }]}>
              {filteredResources.length} recursos encontrados
            </ThemedText>
          </View>

          {/* Resources List */}
          <View style={styles.resourcesSection}>
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onPress={() => handleResourcePress(resource)}
                onPreview={() => handleResourcePreview(resource)}
                onDownload={() => handleResourceDownload(resource)}
                onFavoritePress={() => handleFavoritePress(resource.id)}
              />
            ))}
            
            {filteredResources.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={secondaryTextColor} />
                <ThemedText type="subtitle" style={[styles.emptyTitle, { color: textColor }]}>
                  No se encontraron recursos
                </ThemedText>
                <ThemedText style={[styles.emptyDescription, { color: secondaryTextColor }]}>
                  Intenta ajustar tus filtros o términos de búsqueda
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>

        {/* Filter Modal */}
        <FilterModal
          visible={showFilters}
          onClose={() => setShowFilters(false)}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
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
    position: 'relative',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
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
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  resourcesSection: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  bottomSpacing: {
    height: 40,
  },
}); 