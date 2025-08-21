import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useAuth } from '@/app/components/AuthContext';
import { entrepreneurshipApiService } from '@/app/services/entrepreneurshipApiService';
import { DirectoryProfile, Post } from '@/app/types/entrepreneurship';
import PostCard from './PostCard';
import Shimmer from '@/app/components/Shimmer';

/**
 * Institution Profile Screen Component
 * Displays detailed institution information and posts
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const InstitutionProfileScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // State
  const [profile, setProfile] = useState<DirectoryProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch profile data
  const fetchProfile = useCallback(async (showRefreshing = false) => {
    if (!id || !token) return;

    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await entrepreneurshipApiService.getInstitutionProfile(token, id);
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error?.message || 'Error al cargar perfil');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, token]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!id || !token) return;

    try {
      setLoadingPosts(true);
      const response = await entrepreneurshipApiService.getInstitutionPosts(token, id, {
        limit: 20,
      });
      if (response.success && response.data) {
        setPosts(response.data);
      }
    } catch (err: any) {
      console.error('Error loading posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  }, [id, token]);

  // Load data on mount
  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchProfile(true);
    fetchPosts();
  }, [fetchProfile, fetchPosts]);

  // Handle social link press
  const handleSocialLinkPress = (url?: string, platform?: string) => {
    if (!url) {
      Alert.alert('Enlace no disponible', `No se ha configurado el enlace de ${platform}`);
      return;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    });
  };

  // Handle website press
  const handleWebsitePress = () => {
    if (!profile?.website) return;

    let url = profile.website;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el sitio web');
    });
  };

  // Handle follow/unfollow
  const handleFollowToggle = () => {
    // TODO: Implement follow/unfollow API
    setIsFollowing(!isFollowing);
    Alert.alert(
      isFollowing ? 'Dejar de seguir' : 'Seguir',
      `${isFollowing ? 'Dejaste de seguir' : 'Ahora sigues'} a ${profile?.name}`
    );
  };

  // Handle post press
  const handlePostPress = (post: Post) => {
    router.push(`/entrepreneurship/directory/${id}/posts/${post.id}`);
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
          <ThemedText style={styles.headerTitle}>Perfil Institución</ThemedText>
          <View style={styles.headerAction} />
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Cover Image Skeleton */}
          <Shimmer>
            <View style={[styles.coverContainer, { backgroundColor: `${tintColor}20` }]} />
          </Shimmer>

          {/* Profile Container Skeleton */}
          <View style={[styles.profileContainer, { backgroundColor: cardBackground }]}>
            {/* Profile Header Skeleton */}
            <View style={styles.profileHeader}>
              <Shimmer>
                <View style={[styles.logoPlaceholder, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <View style={styles.profileInfo}>
                <Shimmer>
                  <View style={[styles.skeletonLine, styles.skeletonLineLarge, { backgroundColor: `${tintColor}20` }]} />
                </Shimmer>
                <Shimmer>
                  <View style={[styles.skeletonLine, styles.skeletonLineMedium, { backgroundColor: `${tintColor}20` }]} />
                </Shimmer>
                <Shimmer>
                  <View style={[styles.skeletonLine, styles.skeletonLineSmall, { backgroundColor: `${tintColor}20` }]} />
                </Shimmer>
              </View>
              <Shimmer>
                <View style={[styles.followButton, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
            </View>

            {/* Stats Skeleton */}
            <View style={styles.statsContainer}>
              {[1, 2, 3].map((_, index) => (
                <View key={index} style={styles.statItem}>
                  <Shimmer>
                    <View style={[styles.skeletonStat, { backgroundColor: `${tintColor}20` }]} />
                  </Shimmer>
                  <Shimmer>
                    <View style={[styles.skeletonStatLabel, { backgroundColor: `${tintColor}20` }]} />
                  </Shimmer>
                </View>
              ))}
            </View>

            {/* Description Skeleton */}
            <View style={styles.descriptionContainer}>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineLarge, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineMedium, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonLine, styles.skeletonLineSmall, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
            </View>
          </View>

          {/* Posts Section Skeleton */}
          <View style={styles.postsSection}>
            <Shimmer>
              <View style={[styles.skeletonLine, styles.skeletonLineLarge, { backgroundColor: `${tintColor}20` }]} />
            </Shimmer>
            <View style={styles.postsList}>
              {[1, 2, 3].map((_, index) => (
                <Shimmer key={index}>
                  <View style={[styles.skeletonPost, { backgroundColor: `${tintColor}20` }]} />
                </Shimmer>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
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
            onPress={() => fetchProfile()}
          >
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
        <ThemedText style={styles.headerTitle}>Perfil Institución</ThemedText>
        <TouchableOpacity style={styles.headerAction}>
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
        {/* Cover Image */}
        {profile.coverImage && (
          <View style={styles.coverContainer}>
            <Image source={{ uri: profile.coverImage }} style={styles.coverImage} />
          </View>
        )}

        {/* Profile Info */}
        <View style={[styles.profileContainer, { backgroundColor: cardBackground }]}>
          {/* Logo and Basic Info */}
          <View style={styles.profileHeader}>
            <View style={styles.logoContainer}>
              {profile.logo ? (
                <Image source={{ uri: profile.logo }} style={styles.logo} />
              ) : (
                <View style={[styles.logoPlaceholder, { backgroundColor: `${tintColor}20` }]}>
                  <Ionicons name="business" size={32} color={tintColor} />
                </View>
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <ThemedText style={styles.profileName}>{profile.name}</ThemedText>
              <View style={styles.profileMeta}>
                <Ionicons name="business-outline" size={16} color={textColor} />
                <ThemedText style={styles.profileIndustry}>{profile.industry}</ThemedText>
              </View>
              <View style={styles.profileMeta}>
                <Ionicons name="location" size={16} color={textColor} />
                <ThemedText style={styles.profileLocation}>{profile.location}</ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.followButton,
                {
                  backgroundColor: isFollowing ? 'transparent' : tintColor,
                  borderColor: tintColor,
                  borderWidth: 1,
                }
              ]}
              onPress={handleFollowToggle}
            >
              <ThemedText
                style={[
                  styles.followButtonText,
                  { color: isFollowing ? tintColor : 'white' }
                ]}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{profile.stats.followers}</ThemedText>
              <ThemedText style={styles.statLabel}>Seguidores</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{profile.stats.posts}</ThemedText>
              <ThemedText style={styles.statLabel}>Publicaciones</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statValue}>{profile.stats.projects}</ThemedText>
              <ThemedText style={styles.statLabel}>Proyectos</ThemedText>
            </View>
          </View>

          {/* Description */}
          {profile.description && (
            <View style={styles.descriptionContainer}>
              <ThemedText style={styles.descriptionText}>{profile.description}</ThemedText>
            </View>
          )}

          {/* Website */}
          {profile.website && (
            <TouchableOpacity style={styles.websiteContainer} onPress={handleWebsitePress}>
              <Ionicons name="globe-outline" size={16} color={tintColor} />
              <ThemedText style={[styles.websiteText, { color: tintColor }]}>
                {profile.website}
              </ThemedText>
            </TouchableOpacity>
          )}

          {/* Social Links */}
          {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <View style={styles.socialContainer}>
              <ThemedText style={styles.socialTitle}>Redes sociales</ThemedText>
              <View style={styles.socialLinks}>
                {profile.socialLinks.facebook && (
                  <TouchableOpacity
                    style={styles.socialLink}
                    onPress={() => handleSocialLinkPress(profile.socialLinks?.facebook, 'Facebook')}
                  >
                    <Ionicons name="logo-facebook" size={24} color="#1877f2" />
                  </TouchableOpacity>
                )}
                {profile.socialLinks.instagram && (
                  <TouchableOpacity
                    style={styles.socialLink}
                    onPress={() => handleSocialLinkPress(profile.socialLinks?.instagram, 'Instagram')}
                  >
                    <Ionicons name="logo-instagram" size={24} color="#e1306c" />
                  </TouchableOpacity>
                )}
                {profile.socialLinks.linkedin && (
                  <TouchableOpacity
                    style={styles.socialLink}
                    onPress={() => handleSocialLinkPress(profile.socialLinks?.linkedin, 'LinkedIn')}
                  >
                    <Ionicons name="logo-linkedin" size={24} color="#0077b5" />
                  </TouchableOpacity>
                )}
                {profile.socialLinks.twitter && (
                  <TouchableOpacity
                    style={styles.socialLink}
                    onPress={() => handleSocialLinkPress(profile.socialLinks?.twitter, 'Twitter')}
                  >
                    <Ionicons name="logo-twitter" size={24} color="#1da1f2" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Services Offered */}
          {profile.servicesOffered.length > 0 && (
            <View style={styles.servicesContainer}>
              <ThemedText style={styles.servicesTitle}>Servicios ofrecidos</ThemedText>
              <View style={styles.servicesList}>
                {profile.servicesOffered.map((service, index) => (
                  <View key={index} style={[styles.serviceChip, { backgroundColor: `${tintColor}15` }]}>
                    <ThemedText style={[styles.serviceText, { color: tintColor }]}>
                      {service}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Focus Areas */}
          {profile.focusAreas.length > 0 && (
            <View style={styles.focusContainer}>
              <ThemedText style={styles.focusTitle}>Áreas de enfoque</ThemedText>
              <View style={styles.focusList}>
                {profile.focusAreas.map((area, index) => (
                  <View key={index} style={[styles.focusChip, { borderColor }]}>
                    <ThemedText style={styles.focusText}>{area}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.postsSectionHeader}>
            <ThemedText style={styles.postsSectionTitle}>Publicaciones</ThemedText>
            {posts.length > 0 && (
              <ThemedText style={styles.postsCount}>
                {posts.length} publicaciones
              </ThemedText>
            )}
          </View>

          {loadingPosts ? (
            <View style={styles.postsLoading}>
              <Shimmer>
                <View style={[styles.skeletonPost, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonPost, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
              <Shimmer>
                <View style={[styles.skeletonPost, { backgroundColor: `${tintColor}20` }]} />
              </Shimmer>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.postsEmpty}>
              <Ionicons name="document-text-outline" size={48} color={textColor} />
              <ThemedText style={styles.postsEmptyTitle}>Sin publicaciones</ThemedText>
              <ThemedText style={styles.postsEmptyMessage}>
                Esta institución no tiene publicaciones aún
              </ThemedText>
            </View>
          ) : (
            <View style={styles.postsList}>
              {posts.map((post, index) => {
                const isLast = index === posts.length - 1;
                return (
                  <PostCard
                    key={post.id}
                    post={post}
                    onPress={() => handlePostPress(post)}
                    style={isLast ? [styles.postCard, styles.lastPostCard] : styles.postCard}
                  />
                );
              })}
            </View>
          )}
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
  coverContainer: {
    height: 200,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileContainer: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoContainer: {
    marginRight: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileIndustry: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.8,
  },
  profileLocation: {
    fontSize: 14,
    marginLeft: 6,
    opacity: 0.8,
  },
  followButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  websiteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  websiteText: {
    fontSize: 14,
    marginLeft: 8,
  },
  socialContainer: {
    marginBottom: 16,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialLink: {
    padding: 8,
  },
  servicesContainer: {
    marginBottom: 16,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  servicesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  serviceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  focusContainer: {
    marginBottom: 0,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  focusList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  focusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  focusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  postsSection: {
    margin: 16,
  },
  postsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  postsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  postsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  postsLoading: {
    alignItems: 'center',
    padding: 32,
  },
  postsLoadingText: {
    fontSize: 14,
    marginTop: 12,
    opacity: 0.7,
  },
  postsEmpty: {
    alignItems: 'center',
    padding: 32,
  },
  postsEmptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  postsEmptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  postsList: {
    gap: 16,
  },
  postCard: {
    marginBottom: 0,
  },
  lastPostCard: {
    marginBottom: 32,
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
  skeletonLineMedium: {
    width: '60%',
  },
  skeletonLineSmall: {
    width: '40%',
  },
  skeletonStat: {
    width: 40,
    height: 24,
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonStatLabel: {
    width: 60,
    height: 12,
    borderRadius: 4,
  },
  skeletonPost: {
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
});

export default InstitutionProfileScreen;