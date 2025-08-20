/**
 * Custom hooks for news data fetching and management
 * CEMSE Mobile App - YOUTH users only
 * Based on NEWS_MOBILE_SPEC.md specification
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { newsService } from '@/app/services/newsService';
import { 
  NewsArticle, 
  NewsDetail, 
  NewsFilters,
  NewsListState,
  NewsDetailState,
  NewsCarouselState,
  NewsType
} from '@/app/types/news';

/**
 * Hook for fetching and managing news articles list
 * Supports pull-to-refresh, infinite scroll, and offline caching
 */
export const useNewsArticles = (
  initialFilters?: NewsFilters,
  enableOffline: boolean = true
) => {
  const [state, setState] = useState<NewsListState>({
    activeTab: "company",
    refreshing: false,
    loading: true,
    error: null,
    page: 1,
    hasMore: true,
    news: []
  });

  const filtersRef = useRef<NewsFilters | undefined>(initialFilters);
  const isInitialLoad = useRef(true);

  // Fetch news data
  const fetchNews = useCallback(async (
    filters?: NewsFilters,
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setState(prev => ({ 
        ...prev, 
        loading: !append,
        error: null 
      }));

      const queryFilters = {
        ...filtersRef.current,
        ...filters,
        page,
        limit: 10
      };

      const cacheKey = `${state.activeTab}_${JSON.stringify(queryFilters)}`;
      
      const response = enableOffline 
        ? await newsService.getNewsWithOfflineFallback(queryFilters, cacheKey)
        : await newsService.getPublicNews(queryFilters);

      if (response.success && response.data) {
        const newNews = response.data.news || [];
        const hasMore = response.data.pagination ? 
          response.data.pagination.page < response.data.pagination.totalPages : 
          newNews.length >= (queryFilters.limit || 10);

        setState(prev => ({
          ...prev,
          news: append ? [...prev.news, ...newNews] : newNews,
          hasMore,
          page: page,
          loading: false,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error?.message || 'Failed to fetch news'
        }));
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, [state.activeTab, enableOffline]);

  // Filter by tab
  const fetchNewsByTab = useCallback(async (tab: "company" | "institutional") => {
    setState(prev => ({ ...prev, activeTab: tab, page: 1 }));
    
    const tabFilters = tab === "company" 
      ? { type: ["COMPANY"] as NewsType[] }
      : { type: ["GOVERNMENT", "NGO"] as NewsType[] };
    
    await fetchNews(tabFilters, 1, false);
  }, [fetchNews]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setState(prev => ({ ...prev, refreshing: true, page: 1 }));
    
    const tabFilters = state.activeTab === "company" 
      ? { type: ["COMPANY"] as NewsType[] }
      : { type: ["GOVERNMENT", "NGO"] as NewsType[] };
    
    await fetchNews(tabFilters, 1, false);
    setState(prev => ({ ...prev, refreshing: false }));
  }, [fetchNews, state.activeTab]);

  // Load more (infinite scroll)
  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.loading) return;
    
    const nextPage = state.page + 1;
    const tabFilters = state.activeTab === "company" 
      ? { type: ["COMPANY"] as NewsType[] }
      : { type: ["GOVERNMENT", "NGO"] as NewsType[] };
    
    await fetchNews(tabFilters, nextPage, true);
  }, [fetchNews, state.activeTab, state.hasMore, state.loading, state.page]);

  // Search news
  const searchNews = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setState(prev => ({ ...prev, page: 1 }));
    await fetchNews({ search: query }, 1, false);
  }, [fetchNews]);

  // Apply filters
  const applyFilters = useCallback(async (filters: NewsFilters) => {
    filtersRef.current = filters;
    setState(prev => ({ ...prev, page: 1 }));
    await fetchNews(filters, 1, false);
  }, [fetchNews]);

  // Initial load
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      fetchNewsByTab(state.activeTab);
    }
  }, [fetchNewsByTab, state.activeTab]);

  return {
    ...state,
    fetchNewsByTab,
    onRefresh,
    loadMore,
    searchNews,
    applyFilters,
    refetch: () => fetchNewsByTab(state.activeTab)
  };
};

/**
 * Hook for fetching and managing individual news article details
 * Supports offline reading and engagement actions
 */
export const useNewsDetail = (
  newsId: string,
  preloadedNews?: NewsDetail,
  enableOffline: boolean = true
) => {
  const [state, setState] = useState<NewsDetailState>({
    news: preloadedNews || null,
    loading: !preloadedNews,
    error: null,
    liked: false,
    bookmarked: false,
    sharing: false
  });

  // Fetch news detail
  const fetchNewsDetail = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = enableOffline
        ? await newsService.getNewsDetailWithOfflineFallback(newsId)
        : await newsService.getNewsById(newsId);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          news: response.data!,
          loading: false,
          error: null
        }));

        // Increment view count (non-blocking)
        newsService.incrementViews(newsId).catch(console.error);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error?.message || 'Failed to fetch news detail'
        }));
      }
    } catch (error) {
      console.error('Error fetching news detail:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, [newsId, enableOffline]);

  // Toggle like (requires authentication)
  const toggleLike = useCallback(async (token?: string) => {
    if (!token || !state.news) return;

    try {
      // Optimistic update
      const wasLiked = state.liked;
      const newLikeCount = wasLiked ? state.news.likeCount - 1 : state.news.likeCount + 1;
      
      setState(prev => ({
        ...prev,
        liked: !wasLiked,
        news: prev.news ? { ...prev.news, likeCount: newLikeCount } : null
      }));

      const response = await newsService.toggleLike(newsId, token);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          liked: response.data!.liked,
          news: prev.news ? { 
            ...prev.news, 
            likeCount: response.data!.likeCount 
          } : null
        }));
      } else {
        // Rollback on error
        setState(prev => ({
          ...prev,
          liked: wasLiked,
          news: prev.news ? { ...prev.news, likeCount: state.news!.likeCount } : null
        }));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Rollback on error
      setState(prev => ({
        ...prev,
        liked: state.liked,
        news: state.news
      }));
    }
  }, [newsId, state.liked, state.news]);

  // Toggle bookmark (requires authentication)
  const toggleBookmark = useCallback(async (token?: string) => {
    if (!token) return;

    try {
      const wasBookmarked = state.bookmarked;
      setState(prev => ({ ...prev, bookmarked: !wasBookmarked }));

      const response = await newsService.toggleBookmark(newsId, token);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          bookmarked: response.data!.bookmarked
        }));
      } else {
        // Rollback on error
        setState(prev => ({ ...prev, bookmarked: wasBookmarked }));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      setState(prev => ({ ...prev, bookmarked: state.bookmarked }));
    }
  }, [newsId, state.bookmarked]);

  // Share news
  const shareNews = useCallback(async () => {
    if (!state.news) return;

    try {
      setState(prev => ({ ...prev, sharing: true }));

      // Track share count
      const response = await newsService.shareNews(newsId);
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          news: prev.news ? {
            ...prev.news,
            shareCount: response.data!.shareCount
          } : null,
          sharing: false
        }));
      } else {
        setState(prev => ({ ...prev, sharing: false }));
      }
    } catch (error) {
      console.error('Error sharing news:', error);
      setState(prev => ({ ...prev, sharing: false }));
    }
  }, [newsId, state.news]);

  // Initial load
  useEffect(() => {
    if (!preloadedNews) {
      fetchNewsDetail();
    }
  }, [fetchNewsDetail, preloadedNews]);

  return {
    ...state,
    refetch: fetchNewsDetail,
    toggleLike,
    toggleBookmark,
    shareNews
  };
};

/**
 * Hook for fetching featured news for carousel component
 * Supports company and institutional news sections
 */
export const useNewsCarousel = (maxItems: number = 6) => {
  const [state, setState] = useState<NewsCarouselState>({
    companyNews: [],
    governmentNews: [],
    loading: true,
    error: null,
    companyIndex: 0,
    governmentIndex: 0
  });

  // Fetch featured news
  const fetchFeaturedNews = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await newsService.getFeaturedNews(maxItems);

      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          companyNews: response.data!.companyNews,
          governmentNews: response.data!.governmentNews,
          loading: false,
          error: null
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error?.message || 'Failed to fetch featured news'
        }));
      }
    } catch (error) {
      console.error('Error fetching featured news:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      }));
    }
  }, [maxItems]);

  // Navigation controls for company news
  const nextCompanyNews = useCallback(() => {
    setState(prev => ({
      ...prev,
      companyIndex: (prev.companyIndex + 1) % Math.max(1, prev.companyNews.length - 2)
    }));
  }, []);

  const prevCompanyNews = useCallback(() => {
    setState(prev => ({
      ...prev,
      companyIndex: (prev.companyIndex - 1 + Math.max(1, prev.companyNews.length - 2)) % 
                    Math.max(1, prev.companyNews.length - 2)
    }));
  }, []);

  // Navigation controls for government news
  const nextGovernmentNews = useCallback(() => {
    setState(prev => ({
      ...prev,
      governmentIndex: (prev.governmentIndex + 1) % Math.max(1, prev.governmentNews.length - 2)
    }));
  }, []);

  const prevGovernmentNews = useCallback(() => {
    setState(prev => ({
      ...prev,
      governmentIndex: (prev.governmentIndex - 1 + Math.max(1, prev.governmentNews.length - 2)) % 
                       Math.max(1, prev.governmentNews.length - 2)
    }));
  }, []);

  // Get visible news for each section
  const getVisibleCompanyNews = useCallback(() => {
    const { companyNews, companyIndex } = state;
    if (companyNews.length === 0) return [];
    
    return companyNews.slice(companyIndex, companyIndex + 3);
  }, [state]);

  const getVisibleGovernmentNews = useCallback(() => {
    const { governmentNews, governmentIndex } = state;
    if (governmentNews.length === 0) return [];
    
    return governmentNews.slice(governmentIndex, governmentIndex + 3);
  }, [state]);

  // Initial load
  useEffect(() => {
    fetchFeaturedNews();
  }, []);

  return {
    ...state,
    nextCompanyNews,
    prevCompanyNews,
    nextGovernmentNews,
    prevGovernmentNews,
    getVisibleCompanyNews,
    getVisibleGovernmentNews,
    refetch: fetchFeaturedNews
  };
};

/**
 * Hook for search functionality with debouncing
 */
export const useNewsSearch = (debounceMs: number = 500) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimer = useRef<any>(null);

  const searchNews = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await newsService.searchNews(searchQuery, {
        limit: 20
      });

      if (response.success && response.data) {
        setResults(response.data.news || []);
      } else {
        setError(response.error?.message || 'Search failed');
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      searchNews(searchQuery);
    }, debounceMs) as any;
  }, [searchNews, debounceMs]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    query,
    results,
    loading,
    error,
    search: debouncedSearch,
    clearSearch
  };
};