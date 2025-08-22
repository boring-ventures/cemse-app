import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedButton } from '../../../components/ThemedButton';
import Shimmer from '../../../components/Shimmer';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useAuth } from '../../../components/AuthContext';
import { entrepreneurshipApiService } from '../../../services/entrepreneurshipApiService';
import { Resource, ResourceFilter } from '../../../types/entrepreneurship';

const RESOURCE_TYPES = ['Video', 'Plantilla', 'Guía', 'Herramienta', 'Podcast'];
const RESOURCE_LEVELS = ['Principiante', 'Intermedio', 'Avanzado'];

export default function ResourcesScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Partial<ResourceFilter>>({
    types: [],
    levels: [],
    categories: [],
    durations: [],
    dateRanges: [],
    searchQuery: '',
  });

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchResources();
  }, [filters, currentPage, searchQuery]);

  const fetchInitialData = async () => {
    if (!token) return;

    try {
      const categoriesResponse = await entrepreneurshipApiService.getResourceCategories(token);
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchResources = async () => {
    if (!token) return;

    try {
      setLoading(true);
      
      const searchFilters = {
        ...filters,
        searchQuery: searchQuery.trim(),
      };

      const response = await entrepreneurshipApiService.getResources(
        token,
        searchFilters,
        {
          page: currentPage,
          limit: 20,
          sortBy: 'publishDate',
          sortOrder: 'desc'
        }
      );

      if (response.success && response.data) {
        setResources(response.data);
        // TODO: Handle pagination from API response
        setTotalPages(Math.ceil(response.data.length / 20));
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      Alert.alert('Error', 'No se pudieron cargar los recursos');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleResourcePress = (resourceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/entrepreneurship/resources/${resourceId}`);
  };

  const handleToggleFilter = (filterType: keyof ResourceFilter, value: string) => {
    setFilters(prev => {
      const currentValues = prev[filterType] as string[] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [filterType]: newValues,
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      types: [],
      levels: [],
      categories: [],
      durations: [],
      dateRanges: [],
      searchQuery: '',
    });
    setSearchQuery('');
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterArray) => {
      if (Array.isArray(filterArray)) {
        return count + filterArray.length;
      }
      return count;
    }, 0);
  };

  const renderFilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <SafeAreaView style={[styles.modalContainer, { backgroundColor }]} edges={['top']}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <ThemedText style={[styles.modalAction, { color: iconColor }]}>
              Cancelar
            </ThemedText>
          </TouchableOpacity>
          <ThemedText type="subtitle" style={{ color: textColor }}>
            Filtros
          </ThemedText>
          <TouchableOpacity onPress={clearFilters}>
            <ThemedText style={[styles.modalAction, { color: iconColor }]}>
              Limpiar
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          {/* Resource Types */}
          <View style={styles.filterSection}>
            <ThemedText type="defaultSemiBold" style={[styles.filterTitle, { color: textColor }]}>
              Tipo de Recurso
            </ThemedText>
            <View style={styles.filterOptions}>
              {RESOURCE_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.filterOption,
                    {
                      borderColor,
                      backgroundColor: (filters.types || []).includes(type) ? iconColor : 'transparent',
                    },
                  ]}
                  onPress={() => handleToggleFilter('types', type)}
                >
                  <ThemedText
                    style={[
                      styles.filterOptionText,
                      {
                        color: (filters.types || []).includes(type) ? 'white' : textColor,
                      },
                    ]}
                  >
                    {type}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Resource Levels */}
          <View style={styles.filterSection}>
            <ThemedText type="defaultSemiBold" style={[styles.filterTitle, { color: textColor }]}>
              Nivel
            </ThemedText>
            <View style={styles.filterOptions}>
              {RESOURCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.filterOption,
                    {
                      borderColor,
                      backgroundColor: (filters.levels || []).includes(level) ? iconColor : 'transparent',
                    },
                  ]}
                  onPress={() => handleToggleFilter('levels', level)}
                >
                  <ThemedText
                    style={[
                      styles.filterOptionText,
                      {
                        color: (filters.levels || []).includes(level) ? 'white' : textColor,
                      },
                    ]}
                  >
                    {level}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Categories */}
          <View style={styles.filterSection}>
            <ThemedText type="defaultSemiBold" style={[styles.filterTitle, { color: textColor }]}>
              Categorías
            </ThemedText>
            <View style={styles.filterOptions}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterOption,
                    {
                      borderColor,
                      backgroundColor: (filters.categories || []).includes(category) ? iconColor : 'transparent',
                    },
                  ]}
                  onPress={() => handleToggleFilter('categories', category)}
                >
                  <ThemedText
                    style={[
                      styles.filterOptionText,
                      {
                        color: (filters.categories || []).includes(category) ? 'white' : textColor,
                      },
                    ]}
                  >
                    {category}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <ThemedButton
            title={`Aplicar Filtros (${getActiveFiltersCount()})`}
            onPress={() => setShowFilters(false)}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderLoadingState = () => (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Recursos
        </ThemedText>
        <View style={styles.headerActions} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {[...Array(6)].map((_, index) => (
          <Shimmer key={index}>
            <View style={[styles.resourceCard, { backgroundColor: cardColor }]}>
              <View style={[styles.cardPlaceholder, { backgroundColor: borderColor }]} />
            </View>
          </Shimmer>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  if (loading && resources.length === 0) return renderLoadingState();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Biblioteca de Recursos
        </ThemedText>
        <TouchableOpacity 
          onPress={() => setShowFilters(true)} 
          style={styles.headerAction}
        >
          <View style={styles.filterIconContainer}>
            <Ionicons name="funnel" size={24} color={iconColor} />
            {getActiveFiltersCount() > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: '#FF6B6B' }]}>
                <ThemedText style={styles.filterBadgeText}>
                  {getActiveFiltersCount()}
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </ThemedView>

      {/* Search */}
      <ThemedView style={styles.searchContainer}>
        <View style={[styles.searchBox, { borderColor, backgroundColor: cardColor }]}>
          <Ionicons name="search" size={20} color={secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar recursos..."
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ThemedView>

      {/* Resources Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <ThemedText style={[styles.resultsText, { color: secondaryTextColor }]}>
            {resources.length} recursos encontrados
          </ThemedText>
        </View>

        <View style={styles.resourcesGrid}>
          {resources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={[styles.resourceCard, { backgroundColor: cardColor }]}
              onPress={() => handleResourcePress(resource.id)}
            >
              <View style={styles.resourceImage}>
                <Ionicons
                  name={
                    resource.type === 'Video' ? 'play-circle' :
                    resource.type === 'Plantilla' ? 'document-text' :
                    resource.type === 'Guía' ? 'book' :
                    resource.type === 'Herramienta' ? 'construct' :
                    'headset'
                  }
                  size={40}
                  color={iconColor}
                />
              </View>

              <View style={styles.resourceContent}>
                <View style={styles.resourceHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: iconColor }]}>
                    <ThemedText style={styles.typeBadgeText}>{resource.type}</ThemedText>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: secondaryTextColor }]}>
                    <ThemedText style={styles.levelBadgeText}>{resource.level}</ThemedText>
                  </View>
                </View>

                <ThemedText type="defaultSemiBold" style={[styles.resourceTitle, { color: textColor }]}>
                  {resource.title}
                </ThemedText>

                <ThemedText
                  style={[styles.resourceDescription, { color: secondaryTextColor }]}
                  numberOfLines={2}
                >
                  {resource.description}
                </ThemedText>

                <View style={styles.resourceMeta}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <ThemedText style={[styles.rating, { color: textColor }]}>
                      {resource.rating}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.downloads, { color: secondaryTextColor }]}>
                    {resource.downloads.toLocaleString()} descargas
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {resources.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons name="library-outline" size={64} color={secondaryTextColor} />
            <ThemedText type="subtitle" style={[styles.emptyTitle, { color: textColor }]}>
              No se encontraron recursos
            </ThemedText>
            <ThemedText style={[styles.emptyMessage, { color: secondaryTextColor }]}>
              Intenta ajustar los filtros de búsqueda
            </ThemedText>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderFilterModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerAction: {
    padding: 8,
    marginRight: -8,
  },
  headerActions: {
    width: 40,
  },
  filterIconContainer: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsText: {
    fontSize: 14,
  },
  resourcesGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  resourceCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  resourceImage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  resourceTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
  },
  downloads: {
    fontSize: 12,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Loading states
  cardPlaceholder: {
    height: 200,
    borderRadius: 8,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 40,
  },
});