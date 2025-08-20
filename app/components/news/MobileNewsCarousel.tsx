/**
 * Mobile News Carousel Component
 * Displays featured news in a horizontal scrollable format for dashboard integration
 * Based on NEWS_MOBILE_SPEC.md specification
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { MobileNewsCard } from './MobileNewsCard';
import Shimmer from '@/app/components/Shimmer';
import { useNewsCarousel } from '@/app/hooks/useNews';
import { NewsArticle, MobileNewsCarouselProps } from '@/app/types/news';
import { useThemeColor } from '@/app/hooks/useThemeColor';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth * 0.8;
const compactCardWidth = screenWidth * 0.7;

// Carousel skeleton component
const CarouselSkeleton: React.FC = () => {
  const cardBackgroundColor = useThemeColor({}, 'card');
  
  return (
    <View style={styles.container}>
      <View style={styles.skeletonHeader}>
        <Shimmer>
          <View style={styles.skeletonTitle} />
        </Shimmer>
        <Shimmer>
          <View style={styles.skeletonSubtitle} />
        </Shimmer>
      </View>
      
      <View style={styles.section}>
        <View style={styles.skeletonSectionHeader}>
          <Shimmer>
            <View style={styles.skeletonSectionTitle} />
          </Shimmer>
        </View>
        
        <FlatList
          horizontal
          data={Array.from({ length: 3 })}
          renderItem={() => (
            <View style={[styles.skeletonCard, { backgroundColor: cardBackgroundColor }]}>
              <Shimmer>
                <View style={styles.skeletonCardImage} />
              </Shimmer>
              <View style={styles.skeletonCardContent}>
                <Shimmer>
                  <View style={styles.skeletonCardTitle} />
                </Shimmer>
                <Shimmer>
                  <View style={styles.skeletonCardSummary} />
                </Shimmer>
              </View>
            </View>
          )}
          keyExtractor={(_, index) => `skeleton-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
      
      <View style={styles.section}>
        <View style={styles.skeletonSectionHeader}>
          <Shimmer>
            <View style={styles.skeletonSectionTitle} />
          </Shimmer>
        </View>
        
        <FlatList
          horizontal
          data={Array.from({ length: 3 })}
          renderItem={() => (
            <View style={[styles.skeletonCard, { backgroundColor: cardBackgroundColor }]}>
              <Shimmer>
                <View style={styles.skeletonCardImage} />
              </Shimmer>
              <View style={styles.skeletonCardContent}>
                <Shimmer>
                  <View style={styles.skeletonCardTitle} />
                </Shimmer>
                <Shimmer>
                  <View style={styles.skeletonCardSummary} />
                </Shimmer>
              </View>
            </View>
          )}
          keyExtractor={(_, index) => `skeleton-${index}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        />
      </View>
    </View>
  );
};

// Empty state component
const EmptyCarousel: React.FC = () => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="newspaper-outline" size={48} color="#9ca3af" />
      <Text style={[styles.emptyTitle, { color: textColor }]}>
        Sin noticias destacadas
      </Text>
      <Text style={[styles.emptyMessage, { color: secondaryTextColor }]}>
        No hay noticias destacadas disponibles en este momento
      </Text>
    </View>
  );
};

// Error component
const ErrorCarousel: React.FC<{ onRetry: () => void }> = ({ onRetry }) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="warning-outline" size={48} color="#ef4444" />
      <Text style={[styles.errorTitle, { color: textColor }]}>
        Error al cargar noticias
      </Text>
      <Text style={[styles.errorMessage, { color: secondaryTextColor }]}>
        No se pudieron cargar las noticias destacadas
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryButtonText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
};

// Section component
const NewsSection: React.FC<{
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  news: NewsArticle[];
  onNewsPress: (news: NewsArticle) => void;
  onViewAll: () => void;
}> = ({ title, subtitle, icon, iconColor, news, onNewsPress, onViewAll }) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  
  const renderNewsItem = useCallback(({ item }: { item: NewsArticle }) => (
    <View style={styles.carouselCardContainer}>
      <MobileNewsCard
        news={item}
        compact
        onPress={onNewsPress}
      />
    </View>
  ), [onNewsPress]);

  if (news.length === 0) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name={icon} size={20} color={iconColor} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              {title}
            </Text>
          </View>
        </View>
        
        <View style={styles.emptySectionContainer}>
          <Ionicons name="document-outline" size={32} color="#9ca3af" />
          <Text style={[styles.emptySectionText, { color: secondaryTextColor }]}>
            No hay noticias {subtitle.toLowerCase()} disponibles
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name={icon} size={20} color={iconColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            {title}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
          <Text style={[styles.viewAllText, { color: iconColor }]}>
            Ver todas
          </Text>
          <Ionicons name="chevron-forward" size={16} color={iconColor} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={news.slice(0, 6)}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={compactCardWidth + 16}
        decelerationRate="fast"
        contentContainerStyle={styles.horizontalList}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
      />
    </View>
  );
};

export const MobileNewsCarousel: React.FC<MobileNewsCarouselProps> = ({
  title = "Noticias Destacadas",
  subtitle = "Mantente informado sobre las últimas oportunidades y anuncios importantes",
  maxItems = 6,
  enableNavigation = true
}) => {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const tintColor = useThemeColor({}, 'tint');

  // Use carousel hook
  const {
    companyNews,
    governmentNews,
    loading,
    error,
    refetch
  } = useNewsCarousel(maxItems);

  // Handle news press
  const handleNewsPress = useCallback((news: NewsArticle) => {
    if (enableNavigation) {
      router.push(`/news/${news.id}` as any);
    }
  }, [router, enableNavigation]);

  // Handle view all for company news
  const handleViewAllCompany = useCallback(() => {
    if (enableNavigation) {
      router.push('/news' as any);
    }
  }, [router, enableNavigation]);

  // Handle view all for institutional news
  const handleViewAllInstitutional = useCallback(() => {
    if (enableNavigation) {
      router.push('/news' as any);
    }
  }, [router, enableNavigation]);

  // Handle view all news
  const handleViewAllNews = useCallback(() => {
    if (enableNavigation) {
      router.push('/news' as any);
    }
  }, [router, enableNavigation]);

  if (loading) {
    return <CarouselSkeleton />;
  }

  if (error) {
    return <ErrorCarousel onRetry={refetch} />;
  }

  const hasAnyNews = companyNews.length > 0 || governmentNews.length > 0;

  if (!hasAnyNews) {
    return <EmptyCarousel />;
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: textColor }]}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: secondaryTextColor }]}>
            {subtitle}
          </Text>
        </View>
      </View>

      {/* Company News Section */}
      <NewsSection
        title="Noticias Empresariales"
        subtitle="empresariales"
        icon="business"
        iconColor="#3b82f6"
        news={companyNews}
        onNewsPress={handleNewsPress}
        onViewAll={handleViewAllCompany}
      />

      {/* Government/NGO News Section */}
      <NewsSection
        title="Noticias Institucionales"
        subtitle="institucionales"
        icon="shield"
        iconColor="#16a34a"
        news={governmentNews}
        onNewsPress={handleNewsPress}
        onViewAll={handleViewAllInstitutional}
      />

      {/* View All Button */}
      {enableNavigation && (
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={[styles.viewAllNewsButton, { borderColor: tintColor }]}
            onPress={handleViewAllNews}
          >
            <Text style={[styles.viewAllNewsText, { color: tintColor }]}>
              Ver Todas las Noticias
            </Text>
            <Ionicons name="arrow-forward" size={16} color={tintColor} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  carouselCardContainer: {
    width: compactCardWidth,
  },
  emptySectionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  emptySectionText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  viewAllNewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderRadius: 24,
    backgroundColor: 'transparent',
  },
  viewAllNewsText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  // Loading states
  skeletonHeader: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  skeletonTitle: {
    width: 200,
    height: 24,
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: 300,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  skeletonSectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  skeletonSectionTitle: {
    width: 150,
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 9,
  },
  skeletonCard: {
    width: compactCardWidth,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  skeletonCardImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#e5e7eb',
  },
  skeletonCardContent: {
    padding: 16,
  },
  skeletonCardTitle: {
    width: '80%',
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonCardSummary: {
    width: '60%',
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 7,
  },
  // Error and empty states
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 48,
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
});

export default MobileNewsCarousel;