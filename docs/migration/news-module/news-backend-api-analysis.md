# 🔌 BACKEND & APIs - NEWS MODULE (YOUTH)

## ENDPOINTS MAPPING ANALYSIS

### Core News API Endpoints

#### 1. GET /api/news/public (Public News Listing)
```typescript
// Current web implementation
interface NewsListRequest {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  municipalityId?: string;
}

interface NewsListResponse {
  success: boolean;
  data: {
    news: NewsArticle[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Mobile optimization requirements
const mobileOptimizations = {
  defaultLimit: 10,        // Smaller batches for mobile
  imageOptimization: true, // Return optimized image URLs
  preloadNext: true,       // Prefetch next page
  compression: 'gzip'      // Reduce bandwidth
}
```

#### 2. GET /api/news/[id] (News Detail)
```typescript
interface NewsDetailRequest {
  id: string;
}

interface NewsDetailResponse {
  success: boolean;
  data: {
    news: NewsArticle;
    related?: NewsArticle[];
    views?: number;
  };
}

// Mobile-specific fields needed
interface MobileNewsDetail extends NewsArticle {
  estimatedReadTime: number;    // For reading progress
  offlineContent: string;       // Cached version
  shareUrl: string;            // Mobile-optimized sharing
  images: {
    thumbnail: string;         // List view
    medium: string;           // Detail view
    fullsize: string;         // Gallery view
  };
}
```

#### 3. POST /api/news (Create News - Admin/Editor)
```typescript
interface CreateNewsRequest {
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  category: string;
  tags?: string[];
  publishedAt?: Date;
  municipalityId: string;
  status: 'draft' | 'published' | 'archived';
}

// Mobile form considerations
const mobileFormConstraints = {
  title: { maxLength: 100, required: true },
  content: { minLength: 50, richText: true },
  images: { maxSize: '5MB', formats: ['jpg', 'png', 'webp'] },
  autoSave: { interval: 30000, key: 'news-draft' }
}
```

#### 4. PUT /api/news/[id] (Update News)
```typescript
interface UpdateNewsRequest extends Partial<CreateNewsRequest> {
  id: string;
}

// Mobile editing optimizations
const mobileEditFeatures = {
  conflictResolution: true,    // Handle simultaneous edits
  versionHistory: true,        // Track changes
  collaborativeEditing: false,  // Not needed for mobile
  autosave: true              // Prevent data loss
}
```

### Authentication & Authorization

#### Role-Based Access Control
```typescript
const newsPermissions = {
  youth: {
    read: ['published'],
    write: [],
    actions: ['view', 'share', 'bookmark']
  },
  admin: {
    read: ['published', 'draft', 'archived'],
    write: ['create', 'update', 'delete'],
    actions: ['moderate', 'feature', 'analytics']
  },
  municipality: {
    read: ['published', 'draft'],
    write: ['create', 'update'],
    scope: 'own-municipality'
  }
}
```

#### Mobile Authentication Flow
```typescript
interface AuthHeaders {
  'Authorization': `Bearer ${accessToken}`;
  'X-User-Role': 'youth' | 'admin' | 'municipality';
  'X-Municipality-Id'?: string;
  'X-Device-Id': string;        // For analytics
  'X-App-Version': string;      // For compatibility
}

// Token refresh strategy for mobile
const tokenStrategy = {
  accessTokenExpiry: 15 * 60 * 1000,   // 15 minutes
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  autoRefresh: true,                     // Background refresh
  offlineGracePeriod: 24 * 60 * 60 * 1000 // 24 hours
}
```

### Data Models & Transformations

#### Core News Article Model
```typescript
// From existing types/news.ts + mobile enhancements
interface NewsArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  slug: string;
  category: NewsCategory;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: UserRole;
  };
  municipality: {
    id: string;
    name: string;
  };
  
  // Mobile-specific fields
  mobileOptimized: {
    readTime: number;
    wordCount: number;
    images: ImageVariants;
    summary: string;          // AI-generated summary
    bookmarked?: boolean;     // User-specific
    lastRead?: Date;         // User-specific
  };
}

interface ImageVariants {
  thumbnail: string;    // 300x200
  medium: string;       // 800x600  
  large: string;        // 1200x800
  original: string;     // Full size
}
```

#### Mobile Response Transformations
```typescript
// Transform web responses for mobile consumption
class MobileNewsTransformer {
  static transformList(webResponse: NewsListResponse): MobileNewsListResponse {
    return {
      ...webResponse,
      data: {
        ...webResponse.data,
        news: webResponse.data.news.map(this.optimizeForMobile),
        prefetchUrls: this.generatePrefetchUrls(webResponse.data.news)
      }
    }
  }

  static optimizeForMobile(article: NewsArticle): MobileNewsArticle {
    return {
      ...article,
      content: this.stripHeavyContent(article.content),
      images: this.generateImageVariants(article.coverImage),
      readTime: this.calculateReadTime(article.content),
      summary: this.generateSummary(article.content)
    }
  }
}
```

### Caching Strategies

#### Client-Side Caching
```typescript
const cacheStrategy = {
  newsList: {
    ttl: 5 * 60 * 1000,      // 5 minutes
    maxSize: 100,            // articles
    storage: 'memory + disk'
  },
  newsDetail: {
    ttl: 30 * 60 * 1000,     // 30 minutes
    maxSize: 50,             // articles
    storage: 'disk',
    persistent: true         // Survive app restarts
  },
  images: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: '100MB',
    storage: 'disk',
    compression: true
  }
}
```

#### API Response Caching Headers
```typescript
const cacheHeaders = {
  newsList: {
    'Cache-Control': 'public, max-age=300', // 5 minutes
    'ETag': 'computed-hash',
    'Last-Modified': 'iso-date'
  },
  newsDetail: {
    'Cache-Control': 'public, max-age=1800', // 30 minutes
    'ETag': 'article-version-hash'
  }
}
```

### Offline Capabilities Architecture

#### Offline Data Strategy
```typescript
interface OfflineCapabilities {
  readLater: {
    maxArticles: 50,
    autoDownload: boolean,
    wifiOnly: boolean,
    includeImages: boolean
  },
  syncStrategy: {
    uploadQueue: boolean,     // For drafts/comments
    conflictResolution: 'server-wins',
    retryAttempts: 3,
    exponentialBackoff: true
  }
}

// Offline storage structure
interface OfflineStorage {
  articles: Map<string, CachedArticle>;
  images: Map<string, CachedImage>;
  metadata: {
    lastSync: Date;
    cacheSize: number;
    userPreferences: OfflinePreferences;
  };
}
```

#### Sync Queue Management
```typescript
interface SyncQueue {
  pendingReads: string[];      // Article IDs to fetch
  pendingUploads: QueueItem[]; // User-generated content
  priority: 'high' | 'medium' | 'low';
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
    initialDelay: number;
  };
}
```

### Error Handling Patterns

#### Network Error Responses
```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
    retryAfter?: number;
  };
  timestamp: Date;
  requestId: string;
}

// Mobile-specific error handling
const errorHandling = {
  networkTimeout: 30000,       // 30 seconds
  retryableErrors: [408, 429, 500, 502, 503, 504],
  fallbackToCache: true,
  userFriendlyMessages: {
    'NETWORK_ERROR': 'Check your internet connection',
    'NOT_FOUND': 'This article is no longer available',
    'UNAUTHORIZED': 'Please sign in to continue',
    'RATE_LIMITED': 'Please wait a moment before trying again'
  }
}
```

### Performance Optimizations

#### Request Batching
```typescript
interface BatchRequest {
  requests: {
    id: string;
    endpoint: string;
    params: any;
  }[];
  priority: 'high' | 'medium' | 'low';
}

// Optimize multiple simultaneous requests
const batchingStrategy = {
  maxBatchSize: 5,
  batchTimeout: 100,        // ms
  parallelRequests: 3,
  prioritizeUserActions: true
}
```

#### Image Optimization Pipeline
```typescript
const imageOptimization = {
  formats: ['webp', 'jpg'],        // Prefer WebP
  qualityLevels: {
    thumbnail: 70,
    medium: 80,
    large: 90
  },
  responsiveImages: true,          // Based on device pixel ratio
  progressiveLoading: true,        // For large images
  placeholderGeneration: true      // Blur placeholders
}
```

### Analytics & Monitoring

#### Mobile-Specific Metrics
```typescript
interface MobileAnalytics {
  performance: {
    apiResponseTime: number;
    imageLoadTime: number;
    cacheHitRate: number;
    offlineUsageRate: number;
  };
  user: {
    readingTime: number;
    articlesPerSession: number;
    shareRate: number;
    returnRate: number;
  };
  technical: {
    crashRate: number;
    memoryUsage: number;
    batteryImpact: number;
    dataUsage: number;
  };
}
```

## IMPLEMENTATION CHECKLIST

### Phase 1: Core API Integration
- [ ] Implement news list with pagination
- [ ] Add news detail fetching
- [ ] Implement basic caching
- [ ] Add error handling

### Phase 2: Performance & Offline
- [ ] Add image optimization
- [ ] Implement offline reading
- [ ] Add sync queue management
- [ ] Optimize request batching

### Phase 3: Advanced Features
- [ ] Add real-time updates
- [ ] Implement push notifications
- [ ] Add analytics tracking
- [ ] Performance monitoring