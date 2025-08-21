# CEMSE News System Mobile Implementation Specification - COMPLETE ANALYSIS

## Executive Summary

This document provides a comprehensive technical specification for replicating the CEMSE News System in React Native for mobile applications. Based on detailed analysis of the actual web implementation, this specification includes COMPLETE component hierarchies, API integrations, data models, and mobile-specific adaptations required for pixel-perfect mobile replication specifically for YOUTH role users.

**Key Findings from Web Implementation Analysis:**
- News listing page with tabbed navigation (Company vs Institutional news)
- News detail page with engagement metrics (views, likes, comments, shares)
- NewsCard component with hover animations and interactive elements
- News carousel component for dashboard integration
- Complex filtering and search functionality
- Rich content display with HTML rendering
- Image handling with URL processing
- Real-time view counting and engagement tracking

## Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Core Components Analysis](#core-components-analysis)
3. [Data Models and Types](#data-models-and-types)
4. [API Integration Specifications](#api-integration-specifications)
5. [State Management Patterns](#state-management-patterns)
6. [UI/UX Components for Mobile](#ui-ux-components-for-mobile)
7. [Mobile-Specific Considerations](#mobile-specific-considerations)
8. [Implementation Roadmap](#implementation-roadmap)

---

## 1. System Architecture Overview

### Component Hierarchy (Based on Code Analysis)
```
News System (YOUTH Access)
├── News Main Page (/news)
│   ├── Header Section
│   │   ├── Title: "Centro de Noticias"
│   │   └── Description
│   ├── Tab Navigation (Tabs Component)
│   │   ├── Company News Tab (Building2 icon)
│   │   └── Institutional News Tab (Landmark icon)
│   ├── NewsCard Grid (Responsive)
│   │   ├── 1 column (mobile)
│   │   ├── 2 columns (tablet) 
│   │   └── 3 columns (desktop)
│   └── Animation System (Framer Motion)
│       ├── Tab switching animations
│       └── Card hover effects
├── News Detail Page (/news/[id])
│   ├── Loading State (Skeleton Components)
│   ├── Error State Display
│   ├── News Content Section
│   │   ├── Header with title and metadata
│   │   ├── Author information with avatar
│   │   ├── Publication date and read time
│   │   ├── Featured image display
│   │   ├── HTML content rendering
│   │   └── Tags display
│   ├── Engagement Metrics Bar
│   │   ├── Like button with count
│   │   ├── Comments button with count
│   │   ├── Share button with count
│   │   └── View count display
│   └── Related/Additional Content
├── NewsCard Component (Reusable)
│   ├── Image Section
│   │   ├── News image with overlay
│   │   ├── Category badge
│   │   └── Hover scale animation
│   ├── Content Section
│   │   ├── Author info with logo
│   │   ├── Title (line-clamped)
│   │   ├── Summary (line-clamped)
│   │   └── Metadata (date, views)
│   └── Interactive States
│       ├── Hover animations
│       ├── Click navigation
│       └── Loading states
└── NewsCarousel Component (Dashboard Integration)
    ├── Header with title and description
    ├── Two-column layout
    │   ├── Company News Column
    │   │   ├── Featured article (large)
    │   │   ├── Compact articles (2 items)
    │   │   └── Navigation arrows
    │   └── Government/NGO News Column
    │       ├── Featured article (large)
    │       ├── Compact articles (2 items)
    │       └── Navigation arrows
    ├── Loading States (Skeletons)
    ├── Empty States
    └── "View All News" CTA
```

### Navigation Structure for YOUTH Role
```
Youth Dashboard
├── News Tab/Section
│   ├── News Listing (/news)
│   │   ├── Company News Filter
│   │   └── Institutional News Filter
│   ├── News Detail (/news/[id])
│   │   ├── Full article view
│   │   ├── Engagement actions
│   │   └── Related content
│   └── News Integration Points
│       ├── Dashboard carousel
│       ├── Notification feed
│       └── Search results
```

---

## 2. Core Components Analysis

### 2.1 Main News Listing Component (page.tsx)

**File**: `src/app/news/page.tsx` (71 lines)

**Key Features**:
- Tab-based filtering (Company vs Institutional news)
- Responsive grid layout for news cards
- Loading and error state management
- Animation system with Framer Motion
- Integration with useNewsArticles hook

**ACTUAL State Management**:
```typescript
// From actual news/page.tsx implementation
interface NewsPageState {
  // Tab Navigation
  activeTab: "company" | "institutional"
  
  // Data from useNewsArticles hook
  newsArticles: NewsArticle[] | undefined
  loading: boolean
  error: Error | null
}

// Animation states for tab switching
interface AnimationState {
  tabKey: string // For AnimatePresence
  animationConfig: {
    initial: { opacity: 0, y: 20 }
    animate: { opacity: 1, y: 0 }
    exit: { opacity: 0, y: -20 }
    transition: { duration: 0.2 }
  }
}
```

**Mobile Adaptation Requirements**:
- Convert horizontal tabs to mobile-friendly segmented control
- Implement pull-to-refresh for news updates
- Add infinite scroll for pagination
- Optimize grid layout for touch interaction

### 2.2 News Detail Component ([id]/page.tsx)

**File**: `src/app/news/[id]/page.tsx` (172 lines)

**Core Features**:
- Dynamic route parameter handling with useParams
- Rich content display with HTML rendering
- Engagement metrics (views, likes, comments, shares)
- Loading states with skeleton components
- Error handling with user-friendly messages
- Automatic view tracking

**ACTUAL Implementation Details**:
```typescript
// From actual news detail implementation
interface NewsDetailState {
  // Data fetching
  news: NewsDetail | null
  loading: boolean
  error: string | null
  
  // Route handling
  id: string // from useParams
  
  // Content rendering
  htmlContent: string // dangerouslySetInnerHTML
}

interface NewsDetail {
  id: string
  title: string
  summary: string
  content: string // HTML content
  imageUrl: string
  authorName: string
  authorType: string
  authorLogo: string
  priority: string
  category: string
  publishedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
  tags: string[]
  featured: boolean
  readTime: number
}
```

**Mobile Implementation Requirements**:
- HTML content renderer for React Native
- Native sharing functionality
- Optimized image loading and caching
- Touch-friendly engagement buttons
- Offline reading capability

### 2.3 NewsCard Component 

**File**: `src/components/news/news-card.tsx` (104 lines)

**Core Features**:
- Responsive image display with overlay gradients
- Author information with avatar
- Interactive hover states and animations
- Navigation integration with Next.js router
- Category badge display
- View count and date formatting

**ACTUAL Component Structure**:
```typescript
interface NewsCardProps {
  news: {
    id: string
    title: string
    summary: string
    imageUrl: string
    authorName: string
    authorType: string
    authorLogo: string
    publishedAt: string
    viewCount: number
    category: string
  }
}

// Animation and interaction states
interface NewsCardState {
  isHovered: boolean // for animation triggers
  imageLoaded: boolean
  navigationPending: boolean
}
```

**Mobile Optimization**:
- Replace hover states with touch-friendly press states
- Implement lazy loading for images
- Add swipe gestures for quick actions
- Optimize text truncation for mobile screens

### 2.4 NewsCarousel Component

**File**: `src/components/news/news-carousel.tsx` (362 lines)

**Complex Features**:
- Dual-column layout (Company vs Government/NGO)
- Independent carousel navigation for each column
- Featured article + compact articles pattern
- Multiple API calls for different news types
- Loading states with skeleton components
- Empty state handling

**ACTUAL State Management**:
```typescript
interface NewsCarouselState {
  // Data arrays
  companyNews: NewsArticle[]
  governmentNews: NewsArticle[]
  
  // Loading states
  loading: boolean
  
  // Carousel indices
  companyIndex: number
  governmentIndex: number
  
  // API integration
  fetchNews: () => Promise<void>
}

// Multiple API calls pattern
const fetchNews = async () => {
  const [companyResponse, govResponse, ngoResponse] = await Promise.all([
    fetch("/api/news?type=company&featured=true&targetAudience=YOUTH&limit=6"),
    fetch("/api/news?type=government&targetAudience=YOUTH&limit=6"),
    fetch("/api/news?type=ngo&targetAudience=YOUTH&limit=6")
  ])
}
```

---

## 3. Data Models and Types

### 3.1 NewsArticle Interface (Complete Structure)

**File**: `src/types/news.ts`

```typescript
export interface NewsArticle {
  id: string
  title: string
  content: string // HTML content for detail view
  summary: string // Short description for cards
  imageUrl?: string
  videoUrl?: string
  authorId: string
  authorName: string
  authorType: NewsType // "COMPANY" | "GOVERNMENT" | "NGO"
  authorLogo?: string
  status: NewsStatus // "PUBLISHED" | "DRAFT" | "ARCHIVED"
  priority: NewsPriority // "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  featured: boolean
  tags: string[]
  category: string
  publishedAt: string // ISO date string
  createdAt: string
  updatedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number // MISSING: Share interaction count
  readTime: number // MISSING: Estimated reading time in minutes
  expiresAt?: string
  targetAudience: string[] // ["YOUTH", "COMPANIES", "ALL"]
  region?: string
  relatedLinks?: Array<{
    title: string
    url: string
  }>
}

export type NewsType = "COMPANY" | "GOVERNMENT" | "NGO"
export type NewsStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED"
export type NewsPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
```

### 3.2 Supporting Interfaces

```typescript
// For detail page specific data
interface NewsDetail extends NewsArticle {
  shareCount: number
  readTime: number // estimated reading time in minutes
}

// For comments system (future implementation)
export interface NewsComment {
  id: string
  newsId: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  replies?: NewsComment[]
}

// For search and filtering
export interface NewsFilters {
  type?: NewsType[]
  category?: string[]
  priority?: NewsPriority[]
  featured?: boolean
  dateFrom?: string
  dateTo?: string
  tags?: string[]
  targetAudience?: string[]
  region?: string
  search?: string
}

// For carousel API responses
interface NewsAPIResponse {
  news: NewsArticle[]
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  stats?: {
    total: number
    byType: {
      company: number
      government: number
      ngo: number
    }
  }
}
```

---

## 4. API Integration Specifications

### 4.1 News Article Endpoints (YOUTH Access)

**Primary Endpoint for YOUTH**: `/api/news/public`

#### GET /api/news/public
**Purpose**: Get public news articles (filtered for YOUTH audience)
**Authentication**: Not required
**Query Parameters**:
- `category`: Filter by category
- `authorType`: Filter by author type (company/government/ngo)
- `limit`: Number of items per page (default: 10)
- `page`: Page number (default: 1)
- `search`: Search term
- `featured`: Boolean for featured articles only

**Response Structure**:
```json
{
  "news": [
    {
      "id": "news-1",
      "title": "TechCorp Bolivia Lanza Programa de Becas 2024",
      "content": "Full HTML content...",
      "summary": "TechCorp Bolivia ofrece 50 becas completas...",
      "imageUrl": "/api/placeholder/800/400",
      "authorId": "company-1",
      "authorName": "TechCorp Bolivia",
      "authorType": "COMPANY",
      "authorLogo": "/logos/techcorp.svg",
      "status": "PUBLISHED",
      "priority": "HIGH",
      "featured": true,
      "tags": ["educación", "becas", "tecnología"],
      "category": "Educación y Becas",
      "publishedAt": "2024-02-28T09:00:00Z",
      "viewCount": 1250,
      "likeCount": 89,
      "commentCount": 23,
      "targetAudience": ["YOUTH"],
      "region": "Cochabamba"
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  },
  "stats": {
    "total": 150,
    "byType": {
      "company": 75,
      "government": 45,
      "ngo": 30
    }
  }
}
```

#### GET /api/news/[id]
**Purpose**: Get specific news article by ID
**Authentication**: Optional (affects view counting)
**Automatic Features**:
- Increments view count if user is authenticated
- Returns 404 for non-published articles if not authenticated

**Response**: Single NewsDetail object

### 4.2 useNewsArticles Hook Integration

**File**: `src/hooks/useNewsArticleApi.ts`

**Key Functions for YOUTH**:
```typescript
// Primary hook for news listing
export const useNewsArticles = () => {
  return useQuery({
    queryKey: NEWS_KEYS.lists(),
    queryFn: async () => {
      const result = await NewsArticleService.getAll()
      return result
    }
  })
}

// For public news access (YOUTH specific)
export const usePublicNews = () => {
  return useQuery({
    queryKey: NEWS_KEYS.public(),
    queryFn: async () => {
      const result = await NewsArticleService.getPublicNews()
      return result
    }
  })
}

// For searching news
export const useSearchNews = (query: string) => {
  return useQuery({
    queryKey: [...NEWS_KEYS.lists(), 'search', query],
    queryFn: async () => {
      const result = await NewsArticleService.searchNews(query)
      return result
    },
    enabled: !!query
  })
}

// For filtered news (by type, category, etc.)
export const useNewsByType = (type: string) => {
  return useQuery({
    queryKey: [...NEWS_KEYS.lists(), 'type', type],
    queryFn: async () => {
      const result = await NewsArticleService.getByType(type)
      return result
    },
    enabled: !!type
  })
}
```

### 4.3 NewsArticleService Methods

**File**: `src/services/newsarticle.service.ts`

**Key Methods for Mobile**:
```typescript
export class NewsArticleService {
  // Get public news for YOUTH users
  static async getPublicNews(): Promise<NewsArticle[]> {
    const result = await apiCall('/news/public')
    const newsArray = result.news || result
    
    // Process image URLs for mobile
    if (Array.isArray(newsArray)) {
      return newsArray.map(news => ({
        ...news,
        imageUrl: processImageUrl(news.imageUrl)
      }))
    }
    return newsArray
  }

  // Search functionality
  static async searchNews(query: string): Promise<NewsArticle[]> {
    const result = await apiCall(`/news/public?search=${encodeURIComponent(query)}`)
    return result.news || result
  }

  // Get by type (company/government/ngo)
  static async getByType(type: string): Promise<NewsArticle[]> {
    const result = await apiCall(`/news?authorType=${type}`)
    return result
  }

  // Get specific article
  static async getById(id: string): Promise<NewsArticle> {
    const result = await apiCall(`/news/${id}`)
    return {
      ...result,
      imageUrl: processImageUrl(result.imageUrl)
    }
  }

  // Increment view count
  static async incrementViews(id: string): Promise<NewsArticle> {
    const result = await apiCall(`/news/${id}/views`, {
      method: 'POST'
    })
    return result
  }
}
```

---

## 5. State Management Patterns

### 5.1 News Listing State Management

**Tab Navigation Pattern**:
```typescript
// From news/page.tsx
const NewsPage = () => {
  const [activeTab, setActiveTab] = useState("company")
  const { data: newsArticles, loading, error } = useNewsArticles()

  // Filter news based on active tab
  const filteredNews = useMemo(() => {
    if (!newsArticles) return []
    
    return newsArticles.filter(news => {
      if (activeTab === "company") {
        return news.authorType === "COMPANY"
      } else {
        return news.authorType === "GOVERNMENT" || news.authorType === "NGO"
      }
    })
  }, [newsArticles, activeTab])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      {/* Tab content with animations */}
    </Tabs>
  )
}
```

**Mobile Adaptation**:
```typescript
// React Native implementation
const useNewsState = () => {
  const [activeTab, setActiveTab] = useState<"company" | "institutional">("company")
  const [refreshing, setRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    setPage(1)
    await refetch()
    setRefreshing(false)
  }, [])

  // Infinite scroll handler
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    setPage(prev => prev + 1)
  }, [hasMore, loading])

  return {
    activeTab,
    setActiveTab,
    refreshing,
    onRefresh,
    loadMore,
    hasMore
  }
}
```

### 5.2 News Detail State Management

```typescript
// From news/[id]/page.tsx
const NewsDetailPage = () => {
  const { id } = useParams()
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/news/${id}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch news details")
        }
        
        const data = await response.json()
        setNews(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchNewsDetail()
  }, [id])
}
```

**Mobile Enhancement**:
```typescript
// Enhanced mobile state management
const useNewsDetail = (id: string) => {
  const [news, setNews] = useState<NewsDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [liked, setLiked] = useState(false)

  // Offline storage integration
  const loadFromCache = useCallback(async () => {
    const cached = await AsyncStorage.getItem(`news_${id}`)
    if (cached) {
      setNews(JSON.parse(cached))
    }
  }, [id])

  // Save to cache for offline reading
  const saveToCache = useCallback(async (newsData: NewsDetail) => {
    await AsyncStorage.setItem(`news_${id}`, JSON.stringify(newsData))
  }, [id])

  // Engagement actions
  const toggleLike = useCallback(async () => {
    if (!news) return
    
    try {
      const newLikeCount = liked ? news.likeCount - 1 : news.likeCount + 1
      
      // Optimistic update
      setLiked(!liked)
      setNews(prev => prev ? { ...prev, likeCount: newLikeCount } : null)
      
      // API call
      await NewsArticleService.toggleLike(id)
    } catch (error) {
      // Rollback on error
      setLiked(liked)
      setNews(prev => prev ? { ...prev, likeCount: news.likeCount } : null)
    }
  }, [news, liked, id])

  return {
    news,
    loading,
    error,
    bookmarked,
    liked,
    toggleLike,
    loadFromCache,
    saveToCache
  }
}
```

### 5.3 Carousel State Management

```typescript
// From news-carousel.tsx
const NewsCarousel = () => {
  const [companyNews, setCompanyNews] = useState<NewsArticle[]>([])
  const [governmentNews, setGovernmentNews] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [companyIndex, setCompanyIndex] = useState(0)
  const [governmentIndex, setGovernmentIndex] = useState(0)

  const fetchNews = async () => {
    try {
      setLoading(true)

      // Multiple parallel requests
      const [companyResponse, govResponse, ngoResponse] = await Promise.all([
        fetch("/api/news?type=company&featured=true&targetAudience=YOUTH&limit=6"),
        fetch("/api/news?type=government&targetAudience=YOUTH&limit=6"),
        fetch("/api/news?type=ngo&targetAudience=YOUTH&limit=6")
      ])

      const [companyData, govData, ngoData] = await Promise.all([
        companyResponse.json(),
        govResponse.json(), 
        ngoResponse.json()
      ])

      setCompanyNews(companyData.news || [])
      setGovernmentNews([...(govData.news || []), ...(ngoData.news || [])])
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  // Carousel navigation
  const nextCompany = () => {
    setCompanyIndex((prev) => (prev + 1) % Math.max(1, companyNews.length - 2))
  }

  const prevCompany = () => {
    setCompanyIndex(
      (prev) => (prev - 1 + Math.max(1, companyNews.length - 2)) % Math.max(1, companyNews.length - 2)
    )
  }
}
```

---

## 6. UI/UX Components for Mobile

### 6.1 Mobile News Listing Component

```typescript
// React Native implementation
import { FlatList, RefreshControl, ActivityIndicator } from 'react-native'
import { SegmentedControl } from 'react-native-segmented-control'

const MobileNewsListing = () => {
  const {
    activeTab,
    setActiveTab,
    refreshing,
    onRefresh,
    loadMore,
    hasMore
  } = useNewsState()

  const { data: newsArticles, loading, error } = usePublicNews()

  const filteredNews = useMemo(() => {
    if (!newsArticles) return []
    return newsArticles.filter(news => {
      if (activeTab === "company") {
        return news.authorType === "COMPANY"
      } else {
        return news.authorType === "GOVERNMENT" || news.authorType === "NGO"
      }
    })
  }, [newsArticles, activeTab])

  const renderNewsCard = ({ item }: { item: NewsArticle }) => (
    <MobileNewsCard news={item} />
  )

  const renderFooter = () => {
    if (!hasMore) return null
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Centro de Noticias</Text>
        <Text style={styles.subtitle}>
          Mantente informado sobre las últimas novedades y oportunidades
        </Text>
      </View>

      {/* Tab Control */}
      <SegmentedControl
        values={['Empresariales', 'Institucionales']}
        selectedIndex={activeTab === 'company' ? 0 : 1}
        onChange={(event) => {
          const index = event.nativeEvent.selectedSegmentIndex
          setActiveTab(index === 0 ? 'company' : 'institutional')
        }}
        style={styles.segmentedControl}
      />

      {/* News List */}
      <FlatList
        data={filteredNews}
        renderItem={renderNewsCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}
```

### 6.2 Mobile News Card Component

```typescript
import { TouchableOpacity, Image, View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import FastImage from 'react-native-fast-image'

interface MobileNewsCardProps {
  news: NewsArticle
  compact?: boolean
}

const MobileNewsCard = ({ news, compact = false }: MobileNewsCardProps) => {
  const navigation = useNavigation()

  const handlePress = () => {
    navigation.navigate('NewsDetail', { id: news.id })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "URGENT": return "#ef4444"
      case "HIGH": return "#f97316"
      case "MEDIUM": return "#3b82f6"
      case "LOW": return "#6b7280"
      default: return "#6b7280"
    }
  }

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.compactCard]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Image Section */}
      <View style={[styles.imageContainer, compact && styles.compactImageContainer]}>
        <FastImage
          source={{ uri: news.imageUrl }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        
        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
        />
        
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{news.category}</Text>
        </View>
        
        {/* Priority Badge */}
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(news.priority) }]}>
          <Text style={styles.priorityText}>
            {news.priority === "URGENT" ? "Urgente" :
             news.priority === "HIGH" ? "Importante" :
             news.priority === "MEDIUM" ? "Medio" : "Bajo"}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Author Info */}
        <View style={styles.authorRow}>
          <FastImage
            source={{ uri: news.authorLogo }}
            style={styles.authorAvatar}
          />
          <Text style={styles.authorName}>{news.authorName}</Text>
          <View style={styles.dateContainer}>
            <Icon name="clock" size={12} color="#6b7280" />
            <Text style={styles.dateText}>{formatDate(news.publishedAt)}</Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={[styles.title, compact && styles.compactTitle]}
          numberOfLines={compact ? 2 : 3}
        >
          {news.title}
        </Text>

        {/* Summary */}
        <Text
          style={[styles.summary, compact && styles.compactSummary]}
          numberOfLines={compact ? 1 : 2}
        >
          {news.summary}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {news.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Icon name="eye" size={12} color="#6b7280" />
            <Text style={styles.metricText}>{news.viewCount}</Text>
          </View>
          <View style={styles.metric}>
            <Icon name="heart" size={12} color="#6b7280" />
            <Text style={styles.metricText}>{news.likeCount}</Text>
          </View>
          <View style={styles.metric}>
            <Icon name="message-circle" size={12} color="#6b7280" />
            <Text style={styles.metricText}>{news.commentCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}
```

### 6.3 Mobile News Detail Component

```typescript
import { ScrollView, View, Text, TouchableOpacity, Share } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import HTMLView from 'react-native-htmlview'

const MobileNewsDetail = ({ route }: { route: any }) => {
  const { id } = route.params
  const {
    news,
    loading,
    error,
    liked,
    bookmarked,
    toggleLike,
    toggleBookmark
  } = useNewsDetail(id)

  const handleShare = async () => {
    if (!news) return
    
    try {
      await Share.share({
        message: `${news.title} - ${news.summary}`,
        url: `https://cemse.app/news/${news.id}`,
        title: news.title
      })
    } catch (error) {
      console.error('Error sharing news:', error)
    }
  }

  if (loading) {
    return <NewsDetailSkeleton />
  }

  if (error || !news) {
    return <ErrorScreen message={error || "Noticia no encontrada"} />
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{news.title}</Text>
          
          {/* Author Info */}
          <View style={styles.authorInfo}>
            <FastImage
              source={{ uri: news.authorLogo }}
              style={styles.authorAvatar}
            />
            <View style={styles.authorDetails}>
              <Text style={styles.authorName}>{news.authorName}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.publishDate}>
                  {new Date(news.publishedAt).toLocaleDateString()}
                </Text>
                <Text style={styles.readTime}>{news.readTime} min read</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Featured Image */}
        <FastImage
          source={{ uri: news.imageUrl }}
          style={styles.featuredImage}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* Content */}
        <View style={styles.contentContainer}>
          <HTMLView
            value={news.content}
            stylesheet={htmlStyles}
            renderNode={renderHTMLNode}
          />
        </View>

        {/* Tags */}
        <View style={styles.tagsSection}>
          {news.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Engagement Bar */}
      <View style={styles.engagementBar}>
        <TouchableOpacity
          style={[styles.actionButton, liked && styles.actionButtonActive]}
          onPress={toggleLike}
        >
          <Icon 
            name="heart" 
            size={20} 
            color={liked ? "#ef4444" : "#6b7280"} 
          />
          <Text style={styles.actionText}>{news.likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Icon name="message-circle" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{news.commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Icon name="share" size={20} color="#6b7280" />
          <Text style={styles.actionText}>{news.shareCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, bookmarked && styles.actionButtonActive]}
          onPress={toggleBookmark}
        >
          <Icon 
            name="bookmark" 
            size={20} 
            color={bookmarked ? "#3b82f6" : "#6b7280"} 
          />
        </TouchableOpacity>

        <View style={styles.viewCount}>
          <Icon name="eye" size={16} color="#6b7280" />
          <Text style={styles.viewText}>{news.viewCount} views</Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
```

### 6.4 Mobile News Carousel

```typescript
import { FlatList, Dimensions } from 'react-native'

const { width } = Dimensions.get('window')

const MobileNewsCarousel = () => {
  const {
    companyNews,
    governmentNews,
    loading,
    fetchNews
  } = useNewsCarousel()

  const renderCompanyNews = ({ item }: { item: NewsArticle }) => (
    <MobileNewsCard news={item} compact />
  )

  const renderGovernmentNews = ({ item }: { item: NewsArticle }) => (
    <MobileNewsCard news={item} compact />
  )

  if (loading) {
    return <NewsCarouselSkeleton />
  }

  return (
    <View style={styles.carouselContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Noticias Destacadas</Text>
        <Text style={styles.subtitle}>
          Mantente informado sobre las últimas oportunidades y anuncios importantes
        </Text>
      </View>

      {/* Company News Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="building" size={20} color="#3b82f6" />
          <Text style={styles.sectionTitle}>Noticias Empresariales</Text>
        </View>
        
        <FlatList
          data={companyNews.slice(0, 6)}
          renderItem={renderCompanyNews}
          keyExtractor={(item) => `company-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.8}
          decelerationRate="fast"
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* Government/NGO News Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="shield" size={20} color="#16a34a" />
          <Text style={styles.sectionTitle}>Noticias Institucionales</Text>
        </View>
        
        <FlatList
          data={governmentNews.slice(0, 6)}
          renderItem={renderGovernmentNews}
          keyExtractor={(item) => `gov-${item.id}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={width * 0.8}
          decelerationRate="fast"
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      {/* View All Button */}
      <TouchableOpacity style={styles.viewAllButton}>
        <Text style={styles.viewAllText}>Ver Todas las Noticias</Text>
        <Icon name="arrow-right" size={16} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  )
}
```

---

## 7. Mobile-Specific Considerations

### 7.1 Performance Optimization

**Image Loading and Caching**:
```typescript
// Use react-native-fast-image for optimized image loading
import FastImage from 'react-native-fast-image'

const optimizedImageProps = {
  priority: FastImage.priority.normal,
  cache: FastImage.cacheControl.immutable,
  resizeMode: FastImage.resizeMode.cover
}

// Preload images for better UX
const preloadImages = (newsArticles: NewsArticle[]) => {
  const imageUris = newsArticles
    .filter(news => news.imageUrl)
    .map(news => ({ uri: news.imageUrl! }))
  
  FastImage.preload(imageUris)
}
```

**List Performance**:
```typescript
// Use FlatList with performance optimizations
const optimizedFlatListProps = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 5,
  windowSize: 10,
  removeClippedSubviews: true,
  getItemLayout: (data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index
  })
}
```

### 7.2 Offline Functionality

**Offline Storage Strategy**:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage'
import NetInfo from '@react-native-community/netinfo'

const NewsOfflineManager = {
  // Cache news articles for offline reading
  cacheNews: async (news: NewsArticle[]) => {
    try {
      await AsyncStorage.setItem('cached_news', JSON.stringify(news))
      await AsyncStorage.setItem('cache_timestamp', Date.now().toString())
    } catch (error) {
      console.error('Error caching news:', error)
    }
  },

  // Load cached news when offline
  loadCachedNews: async (): Promise<NewsArticle[]> => {
    try {
      const cached = await AsyncStorage.getItem('cached_news')
      return cached ? JSON.parse(cached) : []
    } catch (error) {
      console.error('Error loading cached news:', error)
      return []
    }
  },

  // Check if cache is still valid (24 hours)
  isCacheValid: async (): Promise<boolean> => {
    try {
      const timestamp = await AsyncStorage.getItem('cache_timestamp')
      if (!timestamp) return false
      
      const cacheAge = Date.now() - parseInt(timestamp)
      return cacheAge < 24 * 60 * 60 * 1000 // 24 hours
    } catch (error) {
      return false
    }
  }
}
```

**Network State Management**:
```typescript
const useNetworkState = () => {
  const [isConnected, setIsConnected] = useState(true)
  const [networkType, setNetworkType] = useState<string>('')

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? false)
      setNetworkType(state.type)
    })

    return unsubscribe
  }, [])

  return { isConnected, networkType }
}
```

### 7.3 HTML Content Rendering

**Safe HTML Rendering for Mobile**:
```typescript
import HTMLView from 'react-native-htmlview'
import { Linking } from 'react-native'

const renderHTMLNode = (node: any, index: number, siblings: any, parent: any, defaultRenderer: any) => {
  if (node.name === 'a') {
    return (
      <Text
        key={index}
        style={styles.link}
        onPress={() => Linking.openURL(node.attribs.href)}
      >
        {defaultRenderer(node.children, parent)}
      </Text>
    )
  }

  if (node.name === 'img') {
    return (
      <FastImage
        key={index}
        source={{ uri: node.attribs.src }}
        style={styles.contentImage}
        resizeMode={FastImage.resizeMode.contain}
      />
    )
  }
}

const htmlStyles = StyleSheet.create({
  p: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: '#374151'
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#111827'
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827'
  },
  strong: {
    fontWeight: 'bold'
  },
  em: {
    fontStyle: 'italic'
  },
  link: {
    color: '#3b82f6',
    textDecorationLine: 'underline'
  }
})
```

### 7.4 Push Notifications for News

**News Notification System**:
```typescript
import PushNotification from 'react-native-push-notification'

const NewsNotificationManager = {
  // Configure push notifications
  configure: () => {
    PushNotification.configure({
      onNotification: (notification) => {
        if (notification.userInteraction) {
          // User tapped notification - navigate to news detail
          if (notification.data?.newsId) {
            NavigationService.navigate('NewsDetail', {
              id: notification.data.newsId
            })
          }
        }
      },
      requestPermissions: Platform.OS === 'ios'
    })
  },

  // Show local notification for new urgent news
  showUrgentNewsNotification: (news: NewsArticle) => {
    PushNotification.localNotification({
      title: 'Noticia Urgente',
      message: news.title,
      data: { newsId: news.id },
      importance: 'high',
      priority: 'high'
    })
  }
}
```

### 7.5 Search and Filtering

**Mobile Search Implementation**:
```typescript
import { SearchBar } from 'react-native-elements'

const MobileNewsSearch = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<NewsFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  const { data: searchResults, loading } = useSearchNews(searchQuery)

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length >= 3) {
        // Trigger search
        setSearchQuery(query)
      }
    }, 500),
    []
  )

  return (
    <View style={styles.searchContainer}>
      <SearchBar
        placeholder="Buscar noticias..."
        onChangeText={debouncedSearch}
        showLoading={loading}
        platform="default"
        containerStyle={styles.searchBarContainer}
        inputContainerStyle={styles.searchBarInput}
      />

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Icon name="filter" size={20} color="#6b7280" />
      </TouchableOpacity>

      {/* Filter Modal */}
      <Modal visible={showFilters} animationType="slide">
        <NewsFilterModal
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
        />
      </Modal>
    </View>
  )
}
```

---

## 8. Implementation Roadmap

### Phase 1: Core News System (3-4 weeks)

**Week 1-2: Foundation Setup**
- [ ] Set up React Native project with navigation
- [ ] Implement basic data types and interfaces
- [ ] Create useNewsArticles and usePublicNews hooks
- [ ] Set up API service layer with offline fallback

**Week 3-4: News Listing Implementation**
- [ ] Build MobileNewsListing component with tabs
- [ ] Implement MobileNewsCard with animations
- [ ] Add pull-to-refresh and infinite scroll
- [ ] Create loading and error states

### Phase 2: News Detail and Content (2-3 weeks)

**Week 5-6: Detail View**
- [ ] Implement MobileNewsDetail component
- [ ] Add HTML content rendering (react-native-htmlview)
- [ ] Create engagement metrics bar
- [ ] Implement native sharing functionality

**Week 7: Content Features**
- [ ] Add bookmark functionality with local storage
- [ ] Implement offline content caching
- [ ] Create image zoom and gallery features
- [ ] Add read progress tracking

### Phase 3: Advanced Features (2-3 weeks)

**Week 8-9: Search and Filtering**
- [ ] Build search functionality with debouncing
- [ ] Create filter modal with categories and types
- [ ] Implement tag-based filtering
- [ ] Add search history and suggestions

**Week 10: Carousel and Dashboard Integration**
- [ ] Port NewsCarousel to mobile format
- [ ] Implement horizontal scrolling lists
- [ ] Add dashboard widget for featured news
- [ ] Create news notification system

### Phase 4: Performance and Polish (1-2 weeks)

**Week 11: Optimization**
- [ ] Implement image caching and optimization
- [ ] Add performance monitoring
- [ ] Optimize list rendering for large datasets
- [ ] Implement background refresh

**Week 12: Testing and Refinement**
- [ ] Comprehensive testing across devices
- [ ] Performance testing and optimization
- [ ] Accessibility improvements
- [ ] Bug fixes and UI polish

## ⚠️ CRITICAL IMPLEMENTATION CORRECTIONS

### API Endpoint Corrections (ESSENTIAL)
The original specification contained incorrect API endpoints. Use these VERIFIED endpoints:

**✅ CORRECT Endpoints:**
- News listing: `GET /api/news/public`
- News detail: `GET /api/news/{id}`
- News search: `GET /api/news/public?search={query}`
- News by type: `GET /api/news?authorType={type}`

**❌ INCORRECT Endpoints (Do NOT use):**
- ~~`/api/newsarticle/public`~~ 
- ~~`/api/newsarticle/{id}`~~

### Complete Data Model (UPDATED)
The NewsArticle interface now includes all missing fields:
- `shareCount: number` - Share interaction count
- `readTime: number` - Estimated reading time in minutes
- `authorLogo?: string` - Author's logo URL

### Actual File Structure (VERIFIED)
```
src/app/news/page.tsx - News listing (71 lines)
src/app/news/[id]/page.tsx - News detail (172 lines)
src/components/news/news-card.tsx - Card component (104 lines)
src/components/news/news-carousel.tsx - Carousel (362 lines)
src/components/news/news-detail.tsx - Detail modal (318 lines)
src/hooks/useNewsArticleApi.ts - API hooks (415 lines)
src/services/newsarticle.service.ts - Service layer (346 lines)
src/types/news.ts - Type definitions (79 lines)
```

---

## File Structure for Mobile Implementation

```
src/
├── components/
│   ├── news/
│   │   ├── MobileNewsListing.tsx
│   │   ├── MobileNewsCard.tsx
│   │   ├── MobileNewsDetail.tsx
│   │   ├── MobileNewsCarousel.tsx
│   │   ├── NewsDetailSkeleton.tsx
│   │   ├── NewsCarouselSkeleton.tsx
│   │   └── NewsFilterModal.tsx
│   ├── common/
│   │   ├── HTMLRenderer.tsx
│   │   ├── EngagementBar.tsx
│   │   ├── SearchBar.tsx
│   │   └── LoadingStates.tsx
├── hooks/
│   ├── useNewsArticles.ts
│   ├── usePublicNews.ts
│   ├── useNewsDetail.ts
│   ├── useNewsCarousel.ts
│   ├── useNewsSearch.ts
│   └── useOfflineNews.ts
├── services/
│   ├── api/
│   │   ├── newsApi.ts
│   │   └── newsService.ts
│   ├── storage/
│   │   ├── NewsStorage.ts
│   │   └── OfflineManager.ts
│   └── notifications/
│       └── NewsNotifications.ts
├── types/
│   ├── news.ts
│   ├── api.ts
│   └── navigation.ts
├── utils/
│   ├── htmlUtils.ts
│   ├── imageUtils.ts
│   ├── dateUtils.ts
│   └── shareUtils.ts
└── screens/
    ├── NewsListScreen.tsx
    ├── NewsDetailScreen.tsx
    └── NewsSearchScreen.tsx
```

---

## Conclusion

This specification provides a complete technical roadmap for implementing the CEMSE News System in React Native specifically for YOUTH role users. The mobile implementation maintains full feature parity with the web version while adding mobile-specific enhancements like offline reading, native sharing, and optimized touch interactions.

**Key Success Factors**:
1. **Data Consistency**: Maintain exact NewsArticle structure and API compatibility
2. **Performance**: Implement efficient image loading and list rendering
3. **Offline Capability**: Enable news reading without internet connection
4. **User Experience**: Optimize for mobile touch interactions and gestures
5. **Content Rendering**: Safely render HTML content with proper styling

**Critical Mobile Features**:
- Pull-to-refresh for news updates
- Infinite scroll for large news lists
- Native sharing capabilities
- Offline content caching
- Push notifications for urgent news
- Touch-optimized engagement actions
- Search with autocomplete and filters

The specification covers all major components, data flows, and technical requirements needed for a successful mobile implementation of the News System for YOUTH users.

---

## FINAL IMPLEMENTATION CHECKLIST - YOUTH SPECIFIC FEATURES

### MANDATORY Features for YOUTH Mobile App:

**1. News Access and Filtering**
- [ ] Company news tab with enterprise opportunities
- [ ] Institutional news tab (Government + NGO content)
- [ ] Target audience filtering (automatically filtered for YOUTH)
- [ ] Priority-based news sorting (URGENT, HIGH, MEDIUM, LOW)
- [ ] Category-based filtering (Education, Employment, etc.)

**2. Content Consumption**
- [ ] Rich HTML content rendering with proper styling
- [ ] Image optimization and lazy loading
- [ ] Offline reading capability with caching
- [ ] Read progress tracking and bookmarking
- [ ] Native sharing functionality

**3. Engagement Features**
- [ ] View count tracking (automatic)
- [ ] Like functionality with optimistic updates
- [ ] Comment system integration (future)
- [ ] Share counter tracking
- [ ] Bookmark/Save for later functionality

**4. Mobile UX Enhancements**
- [ ] Pull-to-refresh for latest news
- [ ] Infinite scroll with pagination
- [ ] Touch-friendly card interactions
- [ ] Fast image loading with caching
- [ ] Smooth animations and transitions

**5. Search and Discovery**
- [ ] Full-text search across news content
- [ ] Tag-based filtering and search
- [ ] Search history and suggestions
- [ ] Recent and trending news sections

**VALIDATION CRITERIA**:
- [ ] All news is properly filtered for YOUTH audience
- [ ] Offline reading works seamlessly
- [ ] Image loading is optimized for mobile data
- [ ] HTML content renders correctly on mobile
- [ ] Engagement actions work with proper feedback
- [ ] Search provides relevant results quickly
- [ ] Performance maintains 60fps scrolling

This complete specification ensures the mobile News System provides YOUTH users with an optimized, feature-rich news consumption experience that matches the web functionality while adding mobile-specific enhancements.