/**
 * Mobile News Detail Component
 * Displays full news article with HTML content and engagement features
 * Based on NEWS_MOBILE_SPEC.md specification
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
  Image,
  Platform,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import Shimmer from '@/app/components/Shimmer';
import { useNewsDetail } from '@/app/hooks/useNews';
import { MobileNewsDetailProps } from '@/app/types/news';
import { useThemeColor } from '@/app/hooks/useThemeColor';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// HTML content renderer using WebView for complex HTML
const HTMLContentRenderer: React.FC<{
  content: string;
  textColor: string;
  backgroundColor: string;
}> = ({ content, textColor, backgroundColor }) => {
  const [webViewHeight, setWebViewHeight] = useState(400);
  
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 16px;
          line-height: 1.6;
          color: ${textColor};
          background-color: ${backgroundColor};
          margin: 0;
          padding: 16px;
          word-wrap: break-word;
        }
        
        p {
          margin-bottom: 16px;
          text-align: justify;
        }
        
        h1, h2, h3, h4, h5, h6 {
          margin-top: 24px;
          margin-bottom: 16px;
          font-weight: 600;
          line-height: 1.3;
        }
        
        h1 { font-size: 24px; }
        h2 { font-size: 20px; }
        h3 { font-size: 18px; }
        h4 { font-size: 16px; }
        
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        
        a {
          color: #3b82f6;
          text-decoration: none;
        }
        
        blockquote {
          border-left: 4px solid #3b82f6;
          margin: 16px 0;
          padding-left: 16px;
          font-style: italic;
          background-color: rgba(59, 130, 246, 0.05);
          padding: 16px;
          border-radius: 8px;
        }
        
        ul, ol {
          padding-left: 20px;
          margin-bottom: 16px;
        }
        
        li {
          margin-bottom: 8px;
        }
        
        strong, b {
          font-weight: 600;
        }
        
        em, i {
          font-style: italic;
        }
        
        code {
          background-color: rgba(156, 163, 175, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 14px;
        }
        
        pre {
          background-color: rgba(156, 163, 175, 0.1);
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 16px 0;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        
        th, td {
          border: 1px solid rgba(156, 163, 175, 0.3);
          padding: 8px 12px;
          text-align: left;
        }
        
        th {
          background-color: rgba(156, 163, 175, 0.1);
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      ${content}
      <script>
        // Send height to React Native
        function sendHeight() {
          const height = document.body.scrollHeight;
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'height', height }));
        }
        
        // Handle link clicks
        document.addEventListener('click', function(e) {
          if (e.target.tagName === 'A') {
            e.preventDefault();
            window.ReactNativeWebView.postMessage(JSON.stringify({ 
              type: 'link', 
              url: e.target.href 
            }));
          }
        });
        
        // Send height when loaded
        document.addEventListener('DOMContentLoaded', sendHeight);
        window.addEventListener('load', sendHeight);
        
        // Also send height after images load
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          img.addEventListener('load', sendHeight);
          // Set loading="lazy" for performance
          img.loading = 'lazy';
        });
      </script>
    </body>
    </html>
  `;
  
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'height') {
        setWebViewHeight(Math.max(data.height, 200));
      } else if (data.type === 'link') {
        Linking.openURL(data.url);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };
  
  return (
    <WebView
      source={{ html: htmlTemplate }}
      style={[styles.webView, { height: webViewHeight }]}
      onMessage={handleWebViewMessage}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      renderLoading={() => (
        <View style={styles.webViewLoading}>
          <Shimmer>
            <View style={styles.webViewPlaceholder} />
          </Shimmer>
        </View>
      )}
    />
  );
};

// Detail skeleton component
const NewsDetailSkeleton: React.FC = () => {
  const cardBackgroundColor = useThemeColor({}, 'card');
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.skeletonHeader}>
        <Shimmer>
          <View style={styles.skeletonImage} />
        </Shimmer>
        
        <View style={styles.skeletonHeaderContent}>
          <Shimmer>
            <View style={styles.skeletonTitle} />
          </Shimmer>
          <Shimmer>
            <View style={styles.skeletonSubtitle} />
          </Shimmer>
        </View>
      </View>
      
      <View style={[styles.skeletonContent, { backgroundColor: cardBackgroundColor }]}>
        <View style={styles.skeletonAuthorRow}>
          <Shimmer>
            <View style={styles.skeletonAvatar} />
          </Shimmer>
          <View style={styles.skeletonAuthorInfo}>
            <Shimmer>
              <View style={styles.skeletonAuthorName} />
            </Shimmer>
            <Shimmer>
              <View style={styles.skeletonDate} />
            </Shimmer>
          </View>
        </View>
        
        <Shimmer>
          <View style={styles.skeletonContentBlock} />
        </Shimmer>
        
        <View style={styles.skeletonTags}>
          <Shimmer><View style={styles.skeletonTag} /></Shimmer>
          <Shimmer><View style={styles.skeletonTag} /></Shimmer>
          <Shimmer><View style={styles.skeletonTag} /></Shimmer>
        </View>
      </View>
    </ScrollView>
  );
};

// Error component
const ErrorView: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => {
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  
  return (
    <View style={styles.errorContainer}>
      <Ionicons name="warning-outline" size={64} color="#ef4444" />
      <Text style={[styles.errorTitle, { color: textColor }]}>
        Error al cargar la noticia
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

export const MobileNewsDetail: React.FC<MobileNewsDetailProps> = ({
  newsId,
  news: preloadedNews
}) => {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const tintColor = useThemeColor({}, 'tint');

  // Use news detail hook
  const {
    news,
    loading,
    error,
    liked,
    bookmarked,
    sharing,
    refetch,
    toggleLike,
    toggleBookmark,
    shareNews
  } = useNewsDetail(newsId, preloadedNews, true);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // Handle share
  const handleShare = useCallback(async () => {
    if (!news) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      const shareContent = {
        message: `${news.title}\n\n${news.summary}`,
        url: `https://cemse.app/news/${news.id}`,
        title: news.title
      };

      const result = await Share.share(shareContent);
      
      if (result.action === Share.sharedAction) {
        // Track share count
        shareNews();
      }
    } catch (error) {
      console.error('Error sharing news:', error);
      Alert.alert('Error', 'No se pudo compartir la noticia');
    }
  }, [news, shareNews]);

  // Handle like
  const handleLike = useCallback(async () => {
    if (!news) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Note: toggleLike requires authentication token - would need to get from auth context
    // toggleLike(authToken);
    Alert.alert('Información', 'Función de me gusta próximamente');
  }, [news, toggleLike]);

  // Handle bookmark
  const handleBookmark = useCallback(async () => {
    if (!news) return;
    
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Note: toggleBookmark requires authentication token
    // toggleBookmark(authToken);
    Alert.alert('Información', 'Función de guardar próximamente');
  }, [news, toggleBookmark]);

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Format view count
  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Get priority color
  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "URGENT": return "#ef4444";
      case "HIGH": return "#f97316";
      case "MEDIUM": return "#3b82f6";
      case "LOW": return "#6b7280";
      default: return "#6b7280";
    }
  };

  if (loading) {
    return <NewsDetailSkeleton />;
  }

  if (error || !news) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ErrorView
          message={error || 'Noticia no encontrada'}
          onRetry={refetch}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: cardBackgroundColor, borderBottomColor: borderColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={handleBookmark}>
            <Ionicons 
              name={bookmarked ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={bookmarked ? tintColor : textColor} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: news.imageUrl || 'https://via.placeholder.com/400x200/cccccc/666666?text=No+Image'
            }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          
          {/* Priority Badge */}
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(news.priority) }
          ]}>
            <Text style={styles.priorityText}>
              {news.priority === "URGENT" ? "Urgente" :
               news.priority === "HIGH" ? "Alta prioridad" :
               news.priority === "MEDIUM" ? "Prioridad media" : "Baja prioridad"}
            </Text>
          </View>
          
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{news.category}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={[styles.contentContainer, { backgroundColor: cardBackgroundColor }]}>
          {/* Title */}
          <Text style={[styles.title, { color: textColor }]}>
            {news.title}
          </Text>

          {/* Author Info */}
          <View style={styles.authorContainer}>
            <View style={styles.authorInfo}>
              {news.authorLogo ? (
                <Image
                  source={{ uri: news.authorLogo }}
                  style={styles.authorAvatar}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.authorAvatar, styles.authorAvatarFallback]}>
                  <Ionicons 
                    name={news.authorType === 'COMPANY' ? 'business' : 'shield'} 
                    size={20} 
                    color="#6b7280" 
                  />
                </View>
              )}
              
              <View style={styles.authorDetails}>
                <Text style={[styles.authorName, { color: textColor }]}>
                  {news.authorName}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={[styles.publishDate, { color: secondaryTextColor }]}>
                    {formatDate(news.publishedAt)}
                  </Text>
                  <Text style={[styles.readTime, { color: secondaryTextColor }]}>
                    • {news.readTime || Math.ceil(news.content.length / 1000)} min de lectura
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Summary */}
          <Text style={[styles.summary, { color: secondaryTextColor }]}>
            {news.summary}
          </Text>

          {/* HTML Content */}
          <View style={styles.htmlContainer}>
            <HTMLContentRenderer
              content={news.content}
              textColor={textColor}
              backgroundColor={cardBackgroundColor}
            />
          </View>

          {/* Tags */}
          {news.tags && news.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={[styles.tagsTitle, { color: textColor }]}>Etiquetas:</Text>
              <View style={styles.tagsRow}>
                {news.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Related Links */}
          {news.relatedLinks && news.relatedLinks.length > 0 && (
            <View style={styles.relatedLinksContainer}>
              <Text style={[styles.relatedLinksTitle, { color: textColor }]}>
                Enlaces relacionados:
              </Text>
              {news.relatedLinks.map((link, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.relatedLink}
                  onPress={() => Linking.openURL(link.url)}
                >
                  <Ionicons name="link" size={16} color={tintColor} />
                  <Text style={[styles.relatedLinkText, { color: tintColor }]}>
                    {link.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Engagement Bar */}
      <View style={[
        styles.engagementBar, 
        { 
          backgroundColor: cardBackgroundColor,
          borderTopColor: borderColor 
        }
      ]}>
        <TouchableOpacity
          style={[styles.actionButton, liked && styles.actionButtonActive]}
          onPress={handleLike}
        >
          <Ionicons 
            name={liked ? "heart" : "heart-outline"} 
            size={24} 
            color={liked ? "#ef4444" : secondaryTextColor} 
          />
          <Text style={[
            styles.actionText, 
            { color: liked ? "#ef4444" : secondaryTextColor }
          ]}>
            {news.likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={24} color={secondaryTextColor} />
          <Text style={[styles.actionText, { color: secondaryTextColor }]}>
            {news.commentCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          disabled={sharing}
        >
          <Ionicons 
            name="share-outline" 
            size={24} 
            color={secondaryTextColor} 
          />
          <Text style={[styles.actionText, { color: secondaryTextColor }]}>
            {news.shareCount || 0}
          </Text>
        </TouchableOpacity>

        <View style={styles.viewCount}>
          <Ionicons name="eye-outline" size={20} color={secondaryTextColor} />
          <Text style={[styles.viewText, { color: secondaryTextColor }]}>
            {formatViewCount(news.viewCount)} vistas
          </Text>
        </View>
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  priorityBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    minHeight: screenHeight * 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 16,
  },
  authorContainer: {
    marginBottom: 20,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorAvatarFallback: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publishDate: {
    fontSize: 14,
  },
  readTime: {
    fontSize: 14,
  },
  summary: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  htmlContainer: {
    marginBottom: 24,
  },
  webView: {
    backgroundColor: 'transparent',
  },
  webViewLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  relatedLinksContainer: {
    marginBottom: 24,
  },
  relatedLinksTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  relatedLink: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  relatedLinkText: {
    fontSize: 14,
    marginLeft: 8,
    textDecorationLine: 'underline',
  },
  engagementBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  viewText: {
    fontSize: 12,
    marginLeft: 6,
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
  // Skeleton styles
  skeletonHeader: {
    height: 250,
    position: 'relative',
  },
  skeletonImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  skeletonHeaderContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  skeletonTitle: {
    width: '80%',
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonSubtitle: {
    width: '60%',
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 8,
  },
  skeletonContent: {
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  skeletonAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  skeletonAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e7eb',
    marginRight: 12,
  },
  skeletonAuthorInfo: {
    flex: 1,
  },
  skeletonAuthorName: {
    width: 120,
    height: 16,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 4,
  },
  skeletonDate: {
    width: 180,
    height: 14,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
  },
  skeletonContentBlock: {
    width: '100%',
    height: 300,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 20,
  },
  skeletonTags: {
    flexDirection: 'row',
  },
  skeletonTag: {
    width: 60,
    height: 28,
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
    marginRight: 8,
  },
});

export default MobileNewsDetail;