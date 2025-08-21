import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useDirectorySearch } from '@/app/hooks/useDirectory';
import { Institution } from '@/app/types/entrepreneurship';
import InstitutionCard from './InstitutionCard';
import Shimmer from '@/app/components/Shimmer';

/**
 * Directory Screen Component
 * Displays public institutions that support entrepreneurship
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const DirectoryScreen: React.FC = () => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // State
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Use directory search hook for better performance
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
  } = useDirectorySearch();
  
  // Filter results by type
  const filteredInstitutions = selectedType 
    ? searchResults.filter(institution => institution.institutionType === selectedType)
    : searchResults;

  // Institution types for filtering
  const institutionTypes = [
    { key: 'GOBIERNOS_MUNICIPALES', label: 'Gobiernos Municipales' },
    { key: 'CENTROS_DE_FORMACION', label: 'Centros de Formación' },
    { key: 'ONGS_Y_FUNDACIONES', label: 'ONGs y Fundaciones' },
  ];

  // Refresh handler
  const fetchInstitutions = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true);
      // The hook will handle the actual fetching
      // We just need to manage the refreshing state
      setTimeout(() => setRefreshing(false), 1500);
    }
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchInstitutions(true);
  }, [fetchInstitutions]);

  // Handle institution press
  const handleInstitutionPress = (institution: Institution) => {
    router.push(`/entrepreneurship/directory/${institution.id}`);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedType(null);
    setSearchQuery('');
  };

  // Header component
  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <ThemedText style={styles.headerTitle}>Directorio</ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Instituciones que apoyan el emprendimiento
          </ThemedText>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar instituciones..."
          placeholderTextColor={`${textColor}60`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            {
              backgroundColor: !selectedType ? tintColor : 'transparent',
              borderColor: !selectedType ? tintColor : borderColor,
            }
          ]}
          onPress={() => setSelectedType(null)}
        >
          <ThemedText
            style={[
              styles.filterChipText,
              { color: !selectedType ? 'white' : textColor }
            ]}
          >
            Todas
          </ThemedText>
        </TouchableOpacity>

        {institutionTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedType === type.key ? tintColor : 'transparent',
                borderColor: selectedType === type.key ? tintColor : borderColor,
              }
            ]}
            onPress={() => setSelectedType(type.key)}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: selectedType === type.key ? 'white' : textColor }
              ]}
            >
              {type.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <ThemedText style={styles.resultsText}>
          {filteredInstitutions.length} instituciones encontradas
        </ThemedText>
        {(searchQuery || selectedType) && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearFiltersButton}>
            <ThemedText style={[styles.clearFiltersText, { color: tintColor }]}>
              Limpiar filtros
            </ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Loading state with Shimmer
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Header />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.institutionsContainer}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <Shimmer key={index}>
                <View style={[styles.skeletonCard, { backgroundColor: `${tintColor}20` }]}>
                  <View style={styles.skeletonHeader}>
                    <Shimmer>
                      <View style={[styles.skeletonIcon, { backgroundColor: `${tintColor}30` }]} />
                    </Shimmer>
                    <View style={styles.skeletonInfo}>
                      <Shimmer>
                        <View style={[styles.skeletonTitle, { backgroundColor: `${tintColor}30` }]} />
                      </Shimmer>
                      <Shimmer>
                        <View style={[styles.skeletonSubtitle, { backgroundColor: `${tintColor}30` }]} />
                      </Shimmer>
                    </View>
                  </View>
                  <View style={styles.skeletonMeta}>
                    <Shimmer>
                      <View style={[styles.skeletonMetaItem, { backgroundColor: `${tintColor}30` }]} />
                    </Shimmer>
                    <Shimmer>
                      <View style={[styles.skeletonMetaItem, { backgroundColor: `${tintColor}30` }]} />
                    </Shimmer>
                  </View>
                </View>
              </Shimmer>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <Header />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <ThemedText style={styles.errorTitle}>Error al cargar</ThemedText>
          <ThemedText style={styles.errorMessage}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={() => fetchInstitutions()}
          >
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Header />
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={tintColor}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredInstitutions.length === 0 ? (
          // Empty state
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color={textColor} />
            <ThemedText style={styles.emptyTitle}>
              {searchQuery || selectedType ? 'Sin resultados' : 'No hay instituciones'}
            </ThemedText>
            <ThemedText style={styles.emptyMessage}>
              {searchQuery || selectedType 
                ? 'No se encontraron instituciones con los filtros aplicados'
                : 'No hay instituciones disponibles en este momento'
              }
            </ThemedText>
          </View>
        ) : (
          // Institutions list
          <View style={styles.institutionsContainer}>
            {filteredInstitutions.map((institution, index) => {
              const isLast = index === filteredInstitutions.length - 1;
              return (
                <InstitutionCard
                  key={institution.id}
                  institution={institution}
                  onPress={() => handleInstitutionPress(institution)}
                  style={isLast ? [styles.institutionCard, styles.lastCard] : styles.institutionCard}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filtersContainer: {
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  resultsText: {
    fontSize: 14,
    opacity: 0.7,
  },
  clearFiltersButton: {
    padding: 4,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    opacity: 0.7,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
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
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  institutionsContainer: {
    padding: 16,
  },
  institutionCard: {
    marginBottom: 16,
  },
  lastCard: {
    marginBottom: 32,
  },
  // Skeleton styles
  skeletonCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  skeletonIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonTitle: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%',
  },
  skeletonSubtitle: {
    height: 14,
    borderRadius: 4,
    width: '60%',
  },
  skeletonMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  skeletonMetaItem: {
    height: 14,
    borderRadius: 4,
    width: 80,
  },
});

export default DirectoryScreen;