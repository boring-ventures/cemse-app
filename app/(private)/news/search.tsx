/**
 * News Search Screen
 * Search functionality for news articles
 * Route: /(private)/news/search
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { MobileNewsCard } from '@/app/components/news/MobileNewsCard';
import Shimmer from '@/app/components/Shimmer';
import { useNewsSearch } from '@/app/hooks/useNews';
import { NewsArticle } from '@/app/types/news';
import { useThemeColor } from '@/app/hooks/useThemeColor';

const SearchResultSkeleton: React.FC = () => {
  const cardBackgroundColor = useThemeColor({}, 'card');
  
  return (
    <View style={[styles.skeletonCard, { backgroundColor: cardBackgroundColor }]}>
      <Shimmer>
        <View style={styles.skeletonImage} />
      </Shimmer>
      <View style={styles.skeletonContent}>
        <Shimmer>
          <View style={styles.skeletonTitle} />
        </Shimmer>
        <Shimmer>
          <View style={styles.skeletonSummary} />
        </Shimmer>
      </View>
    </View>
  );
};

const EmptySearchState: React.FC<{ hasQuery: boolean }> = ({ hasQuery }) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  
  if (!hasQuery) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#9ca3af" />
        <Text style={[styles.emptyTitle, { color: textColor }]}>
          Buscar Noticias
        </Text>
        <Text style={[styles.emptyMessage, { color: secondaryTextColor }]}>
          Ingresa términos de búsqueda para encontrar noticias relevantes
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-outline" size={64} color="#9ca3af" />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Sin resultados
      </Text>
      <Text style={[styles.emptyMessage, { color: secondaryTextColor }]}>
        No se encontraron noticias con los términos de búsqueda
      </Text>
    </View>
  );
};

export default function NewsSearchScreen() {
  const router = useRouter();
  const [localQuery, setLocalQuery] = useState('');
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  const {
    query,
    results,
    loading,
    error,
    search,
    clearSearch
  } = useNewsSearch(300);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSearchSubmit = useCallback(() => {
    if (localQuery.trim()) {
      search(localQuery);
    }
  }, [localQuery, search]);

  const handleClearSearch = useCallback(() => {
    setLocalQuery('');
    clearSearch();
  }, [clearSearch]);

  const handleNewsPress = useCallback((news: NewsArticle) => {
    router.push(`/news/${news.id}` as any);
  }, [router]);

  const renderNewsItem = useCallback(({ item }: { item: NewsArticle }) => (
    <MobileNewsCard
      news={item}
      onPress={handleNewsPress}
    />
  ), [handleNewsPress]);

  const renderLoadingState = () => (
    <FlatList
      data={Array.from({ length: 3 })}
      renderItem={() => <SearchResultSkeleton />}
      keyExtractor={(_, index) => `skeleton-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: cardBackgroundColor, borderBottomColor: borderColor }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Buscar Noticias
          </Text>
          
          <View style={styles.headerSpacer} />
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: cardBackgroundColor }]}>
          <View style={[styles.searchInputContainer, { borderColor, backgroundColor }]}>
            <Ionicons name="search" size={20} color={secondaryTextColor} />
            
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Buscar noticias..."
              placeholderTextColor={secondaryTextColor}
              value={localQuery}
              onChangeText={setLocalQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              autoFocus
            />
            
            {localQuery.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch}>
                <Ionicons name="close-circle" size={20} color={secondaryTextColor} />
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: tintColor }]}
            onPress={handleSearchSubmit}
          >
            <Text style={styles.searchButtonText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {loading ? (
            renderLoadingState()
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="warning-outline" size={48} color="#ef4444" />
              <Text style={[styles.errorTitle, { color: textColor }]}>
                Error en la búsqueda
              </Text>
              <Text style={[styles.errorMessage, { color: secondaryTextColor }]}>
                {error}
              </Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleSearchSubmit}>
                <Text style={styles.retryButtonText}>Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : results.length === 0 ? (
            <EmptySearchState hasQuery={query.length > 0} />
          ) : (
            <>
              {/* Results Header */}
              <View style={styles.resultsHeader}>
                <Text style={[styles.resultsCount, { color: textColor }]}>
                  {results.length} resultado{results.length !== 1 ? 's' : ''}
                </Text>
                <Text style={[styles.resultsQuery, { color: secondaryTextColor }]}>
                  para "{query}"
                </Text>
              </View>

              {/* Results List */}
              <FlatList
                data={results}
                renderItem={renderNewsItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                initialNumToRender={5}
                maxToRenderPerBatch={5}
                windowSize={10}
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerSpacer: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultsQuery: {
    fontSize: 14,
    marginTop: 2,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Skeleton styles
  skeletonCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  skeletonImage: {
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonTitle: {
    width: '80%',
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 9,
    marginBottom: 8,
  },
  skeletonSummary: {
    width: '60%',
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 7,
  },
});