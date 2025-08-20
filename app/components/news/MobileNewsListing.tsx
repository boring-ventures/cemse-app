/**
 * Mobile News Listing Component
 * Main news listing page with tabbed navigation and infinite scroll
 * Based on NEWS_MOBILE_SPEC.md specification
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MaterialTopTabBar } from '@react-navigation/material-top-tabs';
import { useRouter } from 'expo-router';

import { MobileNewsCard } from './MobileNewsCard';
import Shimmer from '@/app/components/Shimmer';
import { useNewsArticles } from '@/app/hooks/useNews';
import { NewsArticle, MobileNewsListingProps } from '@/app/types/news';
import { useThemeColor } from '@/app/hooks/useThemeColor';

// Shimmer placeholder for news cards
const NewsCardSkeleton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const cardBackgroundColor = useThemeColor({}, 'card');
  
  return (
    <View style={[styles.skeletonCard, { backgroundColor: cardBackgroundColor }]}>
      <Shimmer>
        <View style={[styles.skeletonImage, compact && styles.skeletonImageCompact]} />
      </Shimmer>
      
      <View style={styles.skeletonContent}>
        <View style={styles.skeletonAuthorRow}>
          <Shimmer>
            <View style={styles.skeletonAvatar} />
          </Shimmer>
          <Shimmer>
            <View style={styles.skeletonAuthorName} />
          </Shimmer>
        </View>
        
        <Shimmer>
          <View style={styles.skeletonTitle} />
        </Shimmer>
        
        {!compact && (
          <Shimmer>
            <View style={styles.skeletonSummary} />
          </Shimmer>
        )}
        
        <View style={styles.skeletonMetrics}>
          <Shimmer>
            <View style={styles.skeletonMetric} />
          </Shimmer>
          <Shimmer>
            <View style={styles.skeletonMetric} />
          </Shimmer>
          <Shimmer>
            <View style={styles.skeletonMetric} />
          </Shimmer>
        </View>
      </View>
    </View>
  );
};

// Error component
const ErrorView: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="warning-outline" size={48} color="#ef4444" />
      <Text style={[styles.errorTitle, { color: textColor }]}>
        Error al cargar noticias
      </Text>
      <Text style={[styles.errorMessage, { color: secondaryTextColor }]}>
        {message}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
};

// Empty state component
const EmptyView: React.FC<{ activeTab: string }> = ({ activeTab }) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  
  const getEmptyMessage = () => {
    if (activeTab === 'company') {
      return 'No hay noticias empresariales disponibles en este momento';
    }
    return 'No hay noticias institucionales disponibles en este momento';
  };
  
  return (
    <View style={styles.emptyContainer}>
      <Ionicons 
        name={activeTab === 'company' ? 'business-outline' : 'shield-outline'} 
        size={64} 
        color="#9ca3af" 
      />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Sin noticias
      </Text>
      <Text style={[styles.emptyMessage, { color: secondaryTextColor }]}>
        {getEmptyMessage()}
      </Text>
    </View>
  );
};

// Custom tab bar component
const CustomTabBar: React.FC<{
  activeTab: "company" | "institutional";
  onTabChange: (tab: "company" | "institutional") => void;
}> = ({ activeTab, onTabChange }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tabBarBackground = useThemeColor({}, 'card');
  const activeColor = useThemeColor({}, 'tint');
  const inactiveColor = useThemeColor({}, 'textSecondary');
  
  return (
    <View style={[styles.tabBar, { backgroundColor: tabBarBackground }]}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'company' && [styles.activeTab, { borderBottomColor: activeColor }]
        ]}
        onPress={() => onTabChange('company')}
      >
        <Ionicons 
          name="business" 
          size={20} 
          color={activeTab === 'company' ? activeColor : inactiveColor} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'company' ? activeColor : inactiveColor }
        ]}>
          Empresariales
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'institutional' && [styles.activeTab, { borderBottomColor: activeColor }]
        ]}
        onPress={() => onTabChange('institutional')}
      >
        <Ionicons 
          name="shield" 
          size={20} 
          color={activeTab === 'institutional' ? activeColor : inactiveColor} 
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'institutional' ? activeColor : inactiveColor }
        ]}>
          Institucionales
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export const MobileNewsListing: React.FC<MobileNewsListingProps> = ({
  initialTab = "company",
  enableSearch = true,
  enableFilters = true
}) => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  
  // Use news hook
  const {
    activeTab,
    news,
    loading,
    error,
    refreshing,
    hasMore,
    fetchNewsByTab,
    onRefresh,
    loadMore
  } = useNewsArticles({ limit: 10 }, true);

  // Handle news card press
  const handleNewsPress = useCallback((newsItem: NewsArticle) => {
    router.push(`/news/${newsItem.id}` as any);
  }, [router]);

  // Handle search press
  const handleSearchPress = useCallback(() => {
    router.push('/news/search' as any);
  }, [router]);

  // Handle filter press
  const handleFilterPress = useCallback(() => {
    Alert.alert(
      'Filtros',
      'Funcionalidad de filtros próximamente',
      [{ text: 'OK' }]
    );
  }, []);

  // Render news card
  const renderNewsCard = useCallback(({ item }: { item: NewsArticle }) => (
    <MobileNewsCard
      news={item}
      onPress={handleNewsPress}
    />
  ), [handleNewsPress]);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!hasMore || !loading) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#3b82f6" />
        <Text style={[styles.loadingText, { color: secondaryTextColor }]}>
          Cargando más noticias...
        </Text>
      </View>
    );
  }, [hasMore, loading, secondaryTextColor]);

  // Render loading state
  const renderLoadingState = () => (
    <FlatList
      data={Array.from({ length: 5 })}
      renderItem={() => <NewsCardSkeleton />}
      keyExtractor={(_, index) => `skeleton-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: textColor }]}>
            Centro de Noticias
          </Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            Mantente informado sobre las últimas novedades y oportunidades
          </Text>
        </View>
        
        {/* Header Actions */}
        <View style={styles.headerActions}>
          {enableSearch && (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleSearchPress}
            >
              <Ionicons name="search" size={24} color={textColor} />
            </TouchableOpacity>
          )}
          
          {enableFilters && (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleFilterPress}
            >
              <Ionicons name="options" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Custom Tab Bar */}
      <CustomTabBar
        activeTab={activeTab}
        onTabChange={fetchNewsByTab}
      />

      {/* Content */}
      {loading && news.length === 0 ? (
        renderLoadingState()
      ) : error ? (
        <ErrorView
          message={error}
          onRetry={() => fetchNewsByTab(activeTab)}
        />
      ) : news.length === 0 ? (
        <EmptyView activeTab={activeTab} />
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsCard}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.listContainer,
            news.length === 0 && styles.emptyListContainer
          ]}
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={Platform.OS === 'android'}
          getItemLayout={(data, index) => ({
            length: 280, // Estimated card height
            offset: 280 * index,
            index,
          })}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    height: 200,
    backgroundColor: '#e5e7eb',
  },
  skeletonImageCompact: {
    height: 140,
  },
  skeletonContent: {
    padding: 16,
  },
  skeletonAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    marginRight: 8,
  },
  skeletonAuthorName: {
    width: 120,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonTitle: {
    width: '100%',
    height: 20,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonSummary: {
    width: '80%',
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 12,
  },
  skeletonMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skeletonMetric: {
    width: 40,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
});

export default MobileNewsListing;