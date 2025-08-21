import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { usePost } from '@/app/hooks/useDirectory';
import Shimmer from '@/app/components/Shimmer';
import { Post } from '@/app/types/entrepreneurship';

/**
 * Post Detail Screen Component
 * Displays full post content with interactions
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const PostDetailScreen: React.FC = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // State
  const { post, loading, error, fetchPost } = usePost();
  const [refreshing, setRefreshing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Initialize data
  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId, fetchPost]);

  // Set initial like state
  useEffect(() => {
    if (post) {
      setLikeCount(post.likes);
      // TODO: Check if user has liked this post from API
      setIsLiked(false);
    }
  }, [post]);

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (!postId) return;
    
    setRefreshing(true);
    try {
      await fetchPost(postId);
    } finally {
      setRefreshing(false);
    }
  }, [postId, fetchPost]);

  // Handle like toggle
  const handleLikeToggle = () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    // TODO: Implement like API call
    // try {
    //   await entrepreneurshipApiService.togglePostLike(token, postId);
    // } catch (error) {
    //   // Revert optimistic update on error
    //   setIsLiked(!isLiked);
    //   setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
    // }
  };

  // Handle share
  const handleShare = async () => {
    if (!post) return;

    try {
      await Share.share({
        title: post.title,
        message: `${post.title}\n\n${post.content}\n\nCompartido desde CEMSE`,
        url: post.image, // Optional image URL
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // Handle comment action
  const handleComment = () => {
    Alert.alert(
      'Comentarios',
      'La funcionalidad de comentarios estará disponible próximamente',
      [{ text: 'Entendido', style: 'default' }]
    );
  };

  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return dateString;
    }
  };

  // Get category color
  const getCategoryColor = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'convocatoria':
        return '#10b981'; // Green
      case 'evento':
        return '#f59e0b'; // Amber
      case 'noticia':
        return '#3b82f6'; // Blue
      case 'programa':
        return '#8b5cf6'; // Purple
      case 'recurso':
        return '#ef4444'; // Red
      case 'oportunidad':
        return '#06b6d4'; // Cyan
      default:
        return tintColor;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={tintColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Publicación</ThemedText>
          <View style={styles.headerAction} />
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Post Container Skeleton */}
          <View style={[styles.postContainer, { backgroundColor: cardBackground }]}>
            {/* Category Badge Skeleton */}
            <Shimmer>
              <View style={[styles.skeletonCategoryBadge, { backgroundColor: `${tintColor}20` }]} />
            </Shimmer>

            {/* Post Meta Skeleton */}
            <View style={styles.postMeta}>
              <View style={styles.authorInfo}>
                <Shimmer>
                  <View style={[styles.skeletonCircle, { backgroundColor: `${tintColor}20` }]} />
                </Shimmer>
                <Shimmer>
                  <View style={[styles.skeletonLine, styles.skeletonLineMedium, { backgroundColor: `${tintColor}20` }]} />
                </Shimmer>
              </View>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineSmall, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
            </View>

            {/* Title Skeleton */}
            <Shimmer>
              <View style={[styles.skeletonTitle, { backgroundColor: `${tintColor}20` }]} />
            </Shimmer>

            {/* Image Skeleton */}
            <Shimmer>
              <View style={[styles.skeletonImage, { backgroundColor: `${tintColor}20` }]} />
            </Shimmer>

            {/* Content Skeleton */}
            <View style={styles.contentContainer}>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineLarge, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineFull, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineMedium, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
            </View>

            {/* Stats Skeleton */}
            <View style={styles.statsContainer}>
              <Shimmer>
                <View style={[styles.skeletonStat, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonStat, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
            </View>

            {/* Actions Skeleton */}
            <View style={styles.actionsContainer}>
              {[1, 2, 3].map((_, index) => (
                <Shimmer key={index}>
                  <View style={[styles.skeletonAction, { backgroundColor: `${tintColor}20` }]} />
                </Shimmer>
              ))}
            </View>
          </View>

          {/* Comments Section Skeleton */}
          <View style={[styles.commentsSection, { backgroundColor: cardBackground }]}>
            <Shimmer>
              <View style={[styles.skeletonLine, styles.skeletonLineMedium, { backgroundColor: `${tintColor}20` }]} />
            </Shimmer>
            <View style={styles.commentsEmpty}>
              <Shimmer>
                <View style={[styles.skeletonCircle, styles.skeletonCircleLarge, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineMedium, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineSmall, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={tintColor} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <ThemedText style={styles.errorTitle}>Error al cargar</ThemedText>
          <ThemedText style={styles.errorMessage}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={handleRefresh}
          >
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = getCategoryColor(post.category);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={tintColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Publicación</ThemedText>
        <TouchableOpacity style={styles.headerAction} onPress={handleShare}>
          <Ionicons name="share" size={24} color={tintColor} />
        </TouchableOpacity>
      </View>

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
        {/* Post Container */}
        <View style={[styles.postContainer, { backgroundColor: cardBackground }]}>
          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
            <ThemedText style={[styles.categoryText, { color: categoryColor }]}>
              {post.category}
            </ThemedText>
          </View>

          {/* Post Meta */}
          <View style={styles.postMeta}>
            <View style={styles.authorInfo}>
              <Ionicons name="person-circle-outline" size={20} color={textColor} />
              <ThemedText style={styles.authorName}>{post.author}</ThemedText>
            </View>
            <View style={styles.dateInfo}>
              <Ionicons name="time-outline" size={16} color={textColor} />
              <ThemedText style={styles.dateText}>
                {formatDate(post.createdAt)}
              </ThemedText>
            </View>
          </View>

          {/* Post Title */}
          <ThemedText style={styles.postTitle}>{post.title}</ThemedText>

          {/* Post Image */}
          {post.image && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: post.image }}
                style={styles.postImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Post Content */}
          <View style={styles.contentContainer}>
            <ThemedText style={styles.postContent}>{post.content}</ThemedText>
          </View>

          {/* Interaction Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={16}
                color={isLiked ? "#ef4444" : textColor}
              />
              <ThemedText style={styles.statText}>{likeCount}</ThemedText>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={16} color={textColor} />
              <ThemedText style={styles.statText}>{post.comments}</ThemedText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isLiked && { backgroundColor: `${tintColor}10` }
              ]}
              onPress={handleLikeToggle}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={20}
                color={isLiked ? "#ef4444" : textColor}
              />
              <ThemedText
                style={[
                  styles.actionText,
                  isLiked && { color: "#ef4444" }
                ]}
              >
                {isLiked ? "Te gusta" : "Me gusta"}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
              <Ionicons name="chatbubble-outline" size={20} color={textColor} />
              <ThemedText style={styles.actionText}>Comentar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color={textColor} />
              <ThemedText style={styles.actionText}>Compartir</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments Section */}
        <View style={[styles.commentsSection, { backgroundColor: cardBackground }]}>
          <View style={styles.commentsSectionHeader}>
            <ThemedText style={styles.commentsSectionTitle}>
              Comentarios ({post.comments})
            </ThemedText>
          </View>
          
          {/* Comments Placeholder */}
          <View style={styles.commentsEmpty}>
            <Ionicons name="chatbubbles-outline" size={48} color={textColor} />
            <ThemedText style={styles.commentsEmptyTitle}>
              Sin comentarios aún
            </ThemedText>
            <ThemedText style={styles.commentsEmptyMessage}>
              Sé el primero en comentar esta publicación
            </ThemedText>
            <TouchableOpacity
              style={[styles.commentButton, { backgroundColor: tintColor }]}
              onPress={handleComment}
            >
              <ThemedText style={styles.commentButtonText}>
                Escribir comentario
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerAction: {
    padding: 8,
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
  postContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  postMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
    marginBottom: 16,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  postImage: {
    width: '100%',
    height: 250,
  },
  contentContainer: {
    marginBottom: 20,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  commentsSection: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  commentsSectionHeader: {
    marginBottom: 16,
  },
  commentsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsEmpty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  commentsEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  commentsEmptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  commentButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  commentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  // Skeleton styles
  skeletonLine: {
    height: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonLineLarge: {
    width: '80%',
    height: 20,
  },
  skeletonLineFull: {
    width: '100%',
  },
  skeletonLineMedium: {
    width: '60%',
  },
  skeletonLineSmall: {
    width: '40%',
  },
  skeletonCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  skeletonCircleLarge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
  },
  skeletonCategoryBadge: {
    width: 100,
    height: 28,
    borderRadius: 16,
    marginBottom: 16,
  },
  skeletonTitle: {
    width: '90%',
    height: 32,
    borderRadius: 8,
    marginBottom: 16,
  },
  skeletonImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
  },
  skeletonStat: {
    width: 60,
    height: 16,
    borderRadius: 8,
  },
  skeletonAction: {
    height: 44,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 4,
  },
});

export default PostDetailScreen;