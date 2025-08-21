/**
 * News Service for CEMSE Mobile App
 * Handles all news-related API calls with YOUTH filtering and offline support
 * Based on NEWS_MOBILE_SPEC.md specification
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { 
  NewsArticle, 
  NewsDetail, 
  NewsAPIResponse, 
  NewsDetailAPIResponse,
  NewsFilters,
  CachedNews,
  CachedNewsDetail,
  NewsError,
  NewsType
} from '@/app/types/news';
import { ApiResponse } from '@/app/types/auth';

/**
 * News Service Class - Handles all news operations
 * Primary endpoint: /api/news/public for YOUTH-filtered content
 * CORRECTED: Updated to use correct API endpoints as per NEWS_MOBILE_SPEC.md
 */
class NewsService {
  private baseUrl: string;
  private cacheExpiryTime = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    const environment = process.env.EXPO_PUBLIC_ENVIRONMENT || 'development';
    this.baseUrl = environment === 'production' 
      ? process.env.EXPO_PUBLIC_API_BASE_URL_PROD || 'https://back-end-production-17b6.up.railway.app/api'
      : process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api';
  }

  /**
   * Generic HTTP request handler with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      console.log(`Making News API request to: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers: defaultHeaders,
      });

      let data: any;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        const error: NewsError = {
          message: data.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          code: data.code || 'NEWS_API_ERROR'
        };

        console.error(`News API Error (${response.status}):`, error);
        
        return {
          success: false,
          error,
        };
      }

      console.log('News API request successful');
      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      console.error('News API request failed:', error);
      
      const newsError: NewsError = {
        message: error instanceof Error ? error.message : 'Network error occurred',
        code: 'NETWORK_ERROR'
      };

      return {
        success: false,
        error: newsError,
      };
    }
  }

  /**
   * Authenticated request helper for engagement actions
   */
  private async authenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }

  /**
   * Process image URLs for mobile optimization
   */
  private processImageUrl(imageUrl?: string): string | undefined {
    if (!imageUrl) return undefined;
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path, prepend base URL
    if (imageUrl.startsWith('/')) {
      return `${this.baseUrl.replace('/api', '')}${imageUrl}`;
    }
    
    return imageUrl;
  }

  /**
   * Get public news articles for YOUTH users
   * Primary endpoint for news listing
   */
  async getPublicNews(filters?: NewsFilters): Promise<ApiResponse<NewsAPIResponse>> {
    const queryParams = new URLSearchParams();
    
    // Add YOUTH audience filter by default
    queryParams.append('targetAudience', 'YOUTH');
    
    // Add additional filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }

    const endpoint = `/news/public?${queryParams.toString()}`;
    const response = await this.request<NewsAPIResponse>(endpoint);

    if (response.success && response.data) {
      // Process image URLs for mobile
      if (response.data.news && Array.isArray(response.data.news)) {
        response.data.news = response.data.news.map(news => ({
          ...news,
          imageUrl: this.processImageUrl(news.imageUrl),
          authorLogo: this.processImageUrl(news.authorLogo)
        }));
      }
    }

    return response;
  }

  /**
   * Get news articles by type (company/institutional)
   */
  async getNewsByType(type: "company" | "institutional", filters?: NewsFilters): Promise<ApiResponse<NewsAPIResponse>> {
    const typeFilters: NewsFilters = {
      ...filters,
    };

    if (type === "company") {
      typeFilters.type = ["COMPANY"];
    } else {
      typeFilters.type = ["GOVERNMENT", "NGO"];
    }

    return this.getPublicNews(typeFilters);
  }

  /**
   * Get specific news article by ID
   */
  async getNewsById(id: string): Promise<ApiResponse<NewsDetail>> {
    const response = await this.request<NewsDetail>(`/news/${id}`);

    if (response.success && response.data) {
      // Process image URLs for mobile
      response.data.imageUrl = this.processImageUrl(response.data.imageUrl);
      response.data.authorLogo = this.processImageUrl(response.data.authorLogo);
    }

    return response;
  }

  /**
   * Search news articles
   */
  async searchNews(query: string, filters?: NewsFilters): Promise<ApiResponse<NewsAPIResponse>> {
    const searchFilters: NewsFilters = {
      ...filters,
      search: query,
    };

    return this.getPublicNews(searchFilters);
  }

  /**
   * Get featured news for carousel
   */
  async getFeaturedNews(maxItems: number = 6): Promise<ApiResponse<{
    companyNews: NewsArticle[];
    governmentNews: NewsArticle[];
  }>> {
    try {
      // Fetch company and institutional news in parallel
      const [companyResponse, institutionalResponse] = await Promise.all([
        this.getNewsByType("company", { featured: true, limit: maxItems }),
        this.getNewsByType("institutional", { featured: true, limit: maxItems })
      ]);

      const companyNews = companyResponse.success ? companyResponse.data?.news || [] : [];
      const governmentNews = institutionalResponse.success ? institutionalResponse.data?.news || [] : [];

      return {
        success: true,
        data: {
          companyNews,
          governmentNews
        }
      };
    } catch (error) {
      console.error('Error fetching featured news:', error);
      return {
        success: false,
        error: {
          message: 'Failed to fetch featured news',
          code: 'FEATURED_NEWS_ERROR'
        }
      };
    }
  }

  /**
   * Increment view count for news article
   */
  async incrementViews(id: string, token?: string): Promise<ApiResponse<NewsArticle>> {
    const endpoint = `/news/${id}/views`;
    
    if (token) {
      return this.authenticatedRequest<NewsArticle>(endpoint, token, {
        method: 'POST'
      });
    } else {
      return this.request<NewsArticle>(endpoint, {
        method: 'POST'
      });
    }
  }

  /**
   * Like/Unlike news article (requires authentication)
   */
  async toggleLike(id: string, token: string): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> {
    return this.authenticatedRequest<{ liked: boolean; likeCount: number }>(`/news/${id}/like`, token, {
      method: 'POST'
    });
  }

  /**
   * Bookmark/Unbookmark news article (requires authentication)
   */
  async toggleBookmark(id: string, token: string): Promise<ApiResponse<{ bookmarked: boolean }>> {
    return this.authenticatedRequest<{ bookmarked: boolean }>(`/news/${id}/bookmark`, token, {
      method: 'POST'
    });
  }

  /**
   * Get user's bookmarked news (requires authentication)
   */
  async getBookmarkedNews(token: string): Promise<ApiResponse<string[]>> {
    return this.authenticatedRequest<string[]>('/news/bookmarks', token);
  }

  /**
   * Share news article (track share count)
   */
  async shareNews(id: string): Promise<ApiResponse<{ shareCount: number }>> {
    return this.request<{ shareCount: number }>(`/news/${id}/share`, {
      method: 'POST'
    });
  }

  // =================== OFFLINE CACHE METHODS ===================

  /**
   * Cache news articles for offline access
   */
  async cacheNews(key: string, news: NewsArticle[], filters?: NewsFilters): Promise<void> {
    try {
      const cachedData: CachedNews = {
        data: news,
        timestamp: Date.now(),
        filters
      };
      
      await AsyncStorage.setItem(`news_cache_${key}`, JSON.stringify(cachedData));
      console.log(`Cached ${news.length} news articles with key: ${key}`);
    } catch (error) {
      console.error('Error caching news:', error);
    }
  }

  /**
   * Load cached news articles
   */
  async loadCachedNews(key: string): Promise<NewsArticle[]> {
    try {
      const cached = await AsyncStorage.getItem(`news_cache_${key}`);
      if (!cached) return [];

      const cachedData: CachedNews = JSON.parse(cached);
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - cachedData.timestamp;
      if (cacheAge > this.cacheExpiryTime) {
        await AsyncStorage.removeItem(`news_cache_${key}`);
        return [];
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error loading cached news:', error);
      return [];
    }
  }

  /**
   * Cache news detail for offline reading
   */
  async cacheNewsDetail(id: string, news: NewsDetail): Promise<void> {
    try {
      const cachedData: CachedNewsDetail = {
        data: news,
        timestamp: Date.now()
      };
      
      await AsyncStorage.setItem(`news_detail_${id}`, JSON.stringify(cachedData));
      console.log(`Cached news detail: ${id}`);
    } catch (error) {
      console.error('Error caching news detail:', error);
    }
  }

  /**
   * Load cached news detail
   */
  async loadCachedNewsDetail(id: string): Promise<NewsDetail | null> {
    try {
      const cached = await AsyncStorage.getItem(`news_detail_${id}`);
      if (!cached) return null;

      const cachedData: CachedNewsDetail = JSON.parse(cached);
      
      // Check if cache is still valid (24 hours)
      const cacheAge = Date.now() - cachedData.timestamp;
      if (cacheAge > this.cacheExpiryTime) {
        await AsyncStorage.removeItem(`news_detail_${id}`);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.error('Error loading cached news detail:', error);
      return null;
    }
  }

  /**
   * Check network connectivity
   */
  async isConnected(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected ?? false;
    } catch (error) {
      console.error('Error checking network connectivity:', error);
      return false;
    }
  }

  /**
   * Get news with offline fallback
   */
  async getNewsWithOfflineFallback(
    filters?: NewsFilters,
    cacheKey: string = 'general'
  ): Promise<ApiResponse<NewsAPIResponse>> {
    const connected = await this.isConnected();
    
    if (connected) {
      // Try to fetch from API
      const response = await this.getPublicNews(filters);
      
      if (response.success && response.data?.news) {
        // Cache the successful response
        await this.cacheNews(cacheKey, response.data.news, filters);
      }
      
      return response;
    } else {
      // Load from cache
      const cachedNews = await this.loadCachedNews(cacheKey);
      
      if (cachedNews.length > 0) {
        return {
          success: true,
          data: {
            news: cachedNews,
            pagination: {
              total: cachedNews.length,
              page: 1,
              limit: cachedNews.length,
              totalPages: 1
            }
          }
        };
      } else {
        return {
          success: false,
          error: {
            message: 'No internet connection and no cached data available',
            code: 'OFFLINE_NO_CACHE'
          }
        };
      }
    }
  }

  /**
   * Get news detail with offline fallback
   */
  async getNewsDetailWithOfflineFallback(id: string): Promise<ApiResponse<NewsDetail>> {
    const connected = await this.isConnected();
    
    if (connected) {
      // Try to fetch from API
      const response = await this.getNewsById(id);
      
      if (response.success && response.data) {
        // Cache the successful response
        await this.cacheNewsDetail(id, response.data);
      }
      
      return response;
    } else {
      // Load from cache
      const cachedNews = await this.loadCachedNewsDetail(id);
      
      if (cachedNews) {
        return {
          success: true,
          data: cachedNews
        };
      } else {
        return {
          success: false,
          error: {
            message: 'No internet connection and article not cached',
            code: 'OFFLINE_NO_CACHE'
          }
        };
      }
    }
  }

  /**
   * Clear all news cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const newsKeys = keys.filter(key => key.startsWith('news_'));
      
      if (newsKeys.length > 0) {
        await AsyncStorage.multiRemove(newsKeys);
        console.log(`Cleared ${newsKeys.length} news cache entries`);
      }
    } catch (error) {
      console.error('Error clearing news cache:', error);
    }
  }

  /**
   * Get cache size and info
   */
  async getCacheInfo(): Promise<{
    totalItems: number;
    cacheSize: string;
    oldestCache: Date | null;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const newsKeys = keys.filter(key => key.startsWith('news_'));
      
      let totalSize = 0;
      let oldestTimestamp = Date.now();
      
      for (const key of newsKeys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          totalSize += data.length;
          const parsed = JSON.parse(data);
          if (parsed.timestamp && parsed.timestamp < oldestTimestamp) {
            oldestTimestamp = parsed.timestamp;
          }
        }
      }
      
      return {
        totalItems: newsKeys.length,
        cacheSize: `${(totalSize / 1024).toFixed(2)} KB`,
        oldestCache: newsKeys.length > 0 ? new Date(oldestTimestamp) : null
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {
        totalItems: 0,
        cacheSize: '0 KB',
        oldestCache: null
      };
    }
  }
}

export const newsService = new NewsService();