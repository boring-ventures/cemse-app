/**
 * News System TypeScript Definitions for CEMSE Mobile App
 * Based on NEWS_MOBILE_SPEC.md analysis
 * Target audience: YOUTH users only
 */

// Core News Types
export type NewsType = "COMPANY" | "GOVERNMENT" | "NGO";
export type NewsStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";
export type NewsPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TargetAudience = "YOUTH" | "COMPANIES" | "ALL";

// Main NewsArticle interface - matches web implementation
export interface NewsArticle {
  id: string;
  title: string;
  content: string; // HTML content for detail view
  summary: string; // Short description for cards
  imageUrl?: string;
  videoUrl?: string;
  authorId: string;
  authorName: string;
  authorType: NewsType;
  authorLogo?: string;
  status: NewsStatus;
  priority: NewsPriority;
  featured: boolean;
  tags: string[];
  category: string;
  publishedAt: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  expiresAt?: string;
  targetAudience: TargetAudience[];
  region?: string;
  relatedLinks?: Array<{
    title: string;
    url: string;
  }>;
}

// Extended interface for detail view
export interface NewsDetail extends NewsArticle {
  shareCount: number;
  readTime: number; // estimated reading time in minutes
}

// Comment system interfaces (for future implementation)
export interface NewsComment {
  id: string;
  newsId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
  replies?: NewsComment[];
}

// Search and filtering interfaces
export interface NewsFilters {
  type?: NewsType[];
  category?: string[];
  priority?: NewsPriority[];
  featured?: boolean;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
  targetAudience?: TargetAudience[];
  region?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// API response interfaces
export interface NewsAPIResponse {
  news: NewsArticle[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats?: {
    total: number;
    byType: {
      company: number;
      government: number;
      ngo: number;
    };
  };
}

export interface NewsDetailAPIResponse {
  news: NewsDetail;
}

// Engagement action interfaces
export interface NewsEngagementActions {
  like: (newsId: string) => Promise<void>;
  unlike: (newsId: string) => Promise<void>;
  bookmark: (newsId: string) => Promise<void>;
  unbookmark: (newsId: string) => Promise<void>;
  share: (newsId: string, platform?: string) => Promise<void>;
  incrementView: (newsId: string) => Promise<void>;
}

// Cache and offline interfaces
export interface CachedNews {
  data: NewsArticle[];
  timestamp: number;
  filters?: NewsFilters;
}

export interface CachedNewsDetail {
  data: NewsDetail;
  timestamp: number;
}

// Hook state interfaces
export interface NewsListState {
  activeTab: "company" | "institutional";
  refreshing: boolean;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
  news: NewsArticle[];
}

export interface NewsDetailState {
  news: NewsDetail | null;
  loading: boolean;
  error: string | null;
  liked: boolean;
  bookmarked: boolean;
  sharing: boolean;
}

export interface NewsCarouselState {
  companyNews: NewsArticle[];
  governmentNews: NewsArticle[];
  loading: boolean;
  error: string | null;
  companyIndex: number;
  governmentIndex: number;
}

// Component prop interfaces
export interface MobileNewsCardProps {
  news: NewsArticle;
  compact?: boolean;
  onPress?: (news: NewsArticle) => void;
}

export interface MobileNewsListingProps {
  initialTab?: "company" | "institutional";
  enableSearch?: boolean;
  enableFilters?: boolean;
}

export interface MobileNewsDetailProps {
  newsId: string;
  news?: NewsDetail; // Optional pre-loaded news
}

export interface MobileNewsCarouselProps {
  title?: string;
  subtitle?: string;
  maxItems?: number;
  enableNavigation?: boolean;
}

// HTML rendering interfaces
export interface HTMLRenderNode {
  name: string;
  attribs: { [key: string]: string };
  children?: HTMLRenderNode[];
  data?: string;
  type: string;
}

export interface HTMLStyles {
  [key: string]: any;
}

// Share action interface
export interface ShareContent {
  title: string;
  message: string;
  url: string;
}

// Error interfaces
export interface NewsError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Search and filter modal interfaces
export interface SearchState {
  query: string;
  loading: boolean;
  results: NewsArticle[];
  suggestions: string[];
  history: string[];
}

export interface FilterModalState {
  visible: boolean;
  filters: NewsFilters;
  appliedFilters: NewsFilters;
}

// Notification interfaces for future implementation
export interface NewsNotification {
  id: string;
  newsId: string;
  title: string;
  message: string;
  type: "URGENT" | "FEATURED" | "NEW";
  read: boolean;
  createdAt: string;
}

// Performance optimization interfaces
export interface ImageCacheItem {
  uri: string;
  cached: boolean;
  timestamp: number;
}

export interface NewsListOptimization {
  itemHeight: number;
  initialNumToRender: number;
  maxToRenderPerBatch: number;
  windowSize: number;
}

// Analytics interfaces (for future implementation)
export interface NewsAnalytics {
  viewDuration: number;
  shareSource: string;
  scrollDepth: number;
  interactions: string[];
}