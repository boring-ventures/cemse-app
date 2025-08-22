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
import Shimmer from '../../components/Shimmer';
import { useResources } from '../../hooks/useResources';

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
  
  // API integration using existing useResources hook
  const { resources = [], loading: loadingResources, error: resourcesError, fetchResources } = useResources();

  // Search form
  const searchForm = useFormik({
    initialValues: { search: filters.searchQuery },
    onSubmit: (values) => {
      setFilters(prev => ({ ...prev, searchQuery: values.search }));
    },
  });

  // Computed metrics from resources data
  const metrics: ResourceMetricsType[] = [
    {
      id: 'total',
      title: 'Recursos Totales',
      value: resources.length.toString(),
      icon: 'library-outline',
      color: '#007AFF',
    },
    {
      id: 'downloads',
      title: 'Descargas Totales',
      value: resources.reduce((total: number, resource: Resource) => total + (resource.downloads || 0), 0).toLocaleString(),
      icon: 'download-outline',
      color: '#32D74B',
    },
    {
      id: 'rating',
      title: 'Calificación Promedio',
      value: resources.length > 0 ? (resources.reduce((total: number, resource: Resource) => total + (resource.rating || 0), 0) / resources.length).toFixed(1) : '0',
      icon: 'star',
      color: '#FFD60A',
    },
    {
      id: 'categories',
      title: 'Categorías',
      value: new Set(resources.map((r: Resource) => r.category)).size.toString(),
      icon: 'grid-outline',
      color: '#5856D6',
    },
  ];

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
    // TODO: Implement API call to toggle favorite status
    console.log('Toggle favorite for resource:', resourceId);
    // For now, this would require updating the API to support favorites
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
        resource.tags.some((tag: string) => tag.toLowerCase().includes(query))
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
            {loadingResources ? (
              <View style={styles.loadingContent}>
                {[1, 2, 3].map((_, index) => (
                  <Shimmer key={index}>
                    <View style={[styles.skeletonCard, { backgroundColor: `${borderColor}20` }]} />
                  </Shimmer>
                ))}
              </View>
            ) : resourcesError ? (
              <View style={styles.errorContent}>
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
                <ThemedText style={styles.errorTitle}>Error al cargar recursos</ThemedText>
                <ThemedText style={styles.errorMessage}>{resourcesError}</ThemedText>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: iconColor }]}
                  onPress={fetchResources}
                >
                  <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
                </TouchableOpacity>
              </View>
            ) : filteredResources.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={secondaryTextColor} />
                <ThemedText type="subtitle" style={[styles.emptyTitle, { color: textColor }]}>
                  No se encontraron recursos
                </ThemedText>
                <ThemedText style={[styles.emptyDescription, { color: secondaryTextColor }]}>
                  Intenta ajustar tus filtros o términos de búsqueda
                </ThemedText>
              </View>
            ) : (
              filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onPress={() => handleResourcePress(resource)}
                  onPreview={() => handleResourcePreview(resource)}
                  onDownload={() => handleResourceDownload(resource)}
                  onFavoritePress={() => handleFavoritePress(resource.id)}
                />
              ))
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
  loadingContent: {
    gap: 16,
  },
  skeletonCard: {
    height: 200,
    borderRadius: 12,
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
}); 