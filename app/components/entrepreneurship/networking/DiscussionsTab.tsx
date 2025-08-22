import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import Shimmer from '@/app/components/Shimmer';

interface Discussion {
  id: string;
  title: string;
  description: string;
  authorName: string;
  authorAvatar?: string;
  participantCount: number;
  messageCount: number;
  lastActivity: string;
  tags: string[];
  isActive: boolean;
  category: string;
}

interface DiscussionsTabProps {
  loading?: boolean;
  error?: string | null;
  refreshControl?: React.ReactElement<any>;
}

/**
 * Discussions Tab Component
 * Browse and participate in entrepreneurship discussions
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const DiscussionsTab: React.FC<DiscussionsTabProps> = ({
  loading = false,
  error = null,
  refreshControl,
}) => {
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const cardBackground = useThemeColor({}, 'card');

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loadingDiscussions, setLoadingDiscussions] = useState(true);
  const [discussionsError, setDiscussionsError] = useState<string | null>(null);
  
  // Load discussions data - Using mock data for now until API is available
  // TODO: Replace with actual API call when discussions endpoint is implemented
  const loadDiscussions = useCallback(async () => {
    setLoadingDiscussions(true);
    setDiscussionsError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now, keep empty array - remove this when API is available
      setDiscussions([]);
      
      // TODO: Uncomment when discussions API is available
      // const response = await entrepreneurshipApiService.getDiscussions(token);
      // if (response.success && response.data) {
      //   setDiscussions(response.data);
      // } else {
      //   setDiscussionsError(response.error?.message || 'Error fetching discussions');
      // }
    } catch (error: any) {
      setDiscussionsError(error.message || 'Error loading discussions');
    } finally {
      setLoadingDiscussions(false);
    }
  }, []);
  
  useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  // Categories for filtering
  const categories = [
    'Marketing',
    'Financiamiento',
    'Tecnología',
    'Networking',
    'Legal',
    'Recursos Humanos',
  ];

  // Filter discussions
  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || discussion.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle category filter
  const handleCategoryFilter = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
  };

  // Handle discussion actions
  const handleJoinDiscussion = (discussion: Discussion) => {
    router.push({
      pathname: '/entrepreneurship/network' as any,
      params: { discussionId: discussion.id }
    });
  };

  const handleCreateDiscussion = () => {
    router.push('/entrepreneurship/network' as any);
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    }
  };

  // Render discussion item
  const renderDiscussion = ({ item }: { item: Discussion }) => (
    <TouchableOpacity
      style={[styles.discussionCard, { backgroundColor: cardBackground, borderColor }]}
      onPress={() => handleJoinDiscussion(item)}
    >
      {/* Header */}
      <View style={styles.discussionHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatarContainer}>
            {item.authorAvatar ? (
              <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: `${tintColor}20` }]}>
                <ThemedText style={[styles.avatarText, { color: tintColor }]}>
                  {item.authorName.split(' ').map(n => n[0]).join('')}
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.authorDetails}>
            <ThemedText style={styles.authorName}>{item.authorName}</ThemedText>
            <ThemedText style={styles.discussionTime}>
              {formatTimeAgo(item.lastActivity)}
            </ThemedText>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.isActive ? `${tintColor}20` : '#6b7280' + '20' }
          ]}>
            <ThemedText style={[
              styles.statusText,
              { color: item.isActive ? tintColor : '#6b7280' }
            ]}>
              {item.isActive ? 'Activa' : 'Inactiva'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.discussionContent}>
        <ThemedText style={styles.discussionTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>
        
        <ThemedText style={styles.discussionDescription} numberOfLines={3}>
          {item.description}
        </ThemedText>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: `${tintColor}15` }]}>
              <ThemedText style={[styles.tagText, { color: tintColor }]}>
                #{tag}
              </ThemedText>
            </View>
          ))}
          {item.tags.length > 3 && (
            <ThemedText style={styles.moreTags}>
              +{item.tags.length - 3}
            </ThemedText>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.discussionStats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={16} color={textColor} />
          <ThemedText style={styles.statText}>
            {item.participantCount} participantes
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="chatbubbles" size={16} color={textColor} />
          <ThemedText style={styles.statText}>
            {item.messageCount} mensajes
          </ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Search and filter header
  const SearchHeader = () => (
    <View style={styles.searchHeader}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar discusiones..."
          placeholderTextColor={`${textColor}60`}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedCategory === item ? tintColor : 'transparent',
                borderColor: selectedCategory === item ? tintColor : borderColor,
              }
            ]}
            onPress={() => handleCategoryFilter(item)}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: selectedCategory === item ? 'white' : textColor }
              ]}
            >
              {item}
            </ThemedText>
          </TouchableOpacity>
        )}
      />

      {/* Results and create button */}
      <View style={styles.actionsHeader}>
        <ThemedText style={styles.resultsCount}>
          {filteredDiscussions.length} discusión{filteredDiscussions.length !== 1 ? 'es' : ''}
        </ThemedText>
        
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: tintColor }]}
          onPress={handleCreateDiscussion}
        >
          <Ionicons name="add" size={16} color="white" />
          <ThemedText style={styles.createButtonText}>Nueva</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubbles-outline" size={64} color={textColor} />
      <ThemedText style={styles.emptyTitle}>
        {searchQuery || selectedCategory ? 'Sin resultados' : 'No hay discusiones'}
      </ThemedText>
      <ThemedText style={styles.emptyMessage}>
        {searchQuery || selectedCategory
          ? 'No se encontraron discusiones con los filtros aplicados'
          : 'Sé el primero en iniciar una discusión sobre emprendimiento'
        }
      </ThemedText>
      
      {(!searchQuery && !selectedCategory) && (
        <TouchableOpacity
          style={[styles.emptyAction, { backgroundColor: tintColor }]}
          onPress={handleCreateDiscussion}
        >
          <Ionicons name="add" size={20} color="white" />
          <ThemedText style={styles.emptyActionText}>Crear discusión</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  // Loading state
  if (loadingDiscussions) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.listContent}>
          <SearchHeader />
          {[1, 2, 3].map((_, index) => (
            <Shimmer key={index}>
              <View style={[styles.skeletonCard, { backgroundColor: `${tintColor}20` }]} />
            </Shimmer>
          ))}
        </View>
      </ThemedView>
    );
  }
  
  // Error state
  if (discussionsError) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <ThemedText style={styles.errorTitle}>Error al cargar discusiones</ThemedText>
          <ThemedText style={styles.errorMessage}>{discussionsError}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={loadDiscussions}
          >
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={filteredDiscussions}
        renderItem={renderDiscussion}
        keyExtractor={(item) => item.id}
        refreshControl={refreshControl}
        ListHeaderComponent={SearchHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredDiscussions.length === 0 && styles.emptyContent
        ]}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  searchHeader: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  separator: {
    height: 16,
  },
  discussionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  discussionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  discussionTime: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  statusContainer: {
    marginLeft: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  discussionContent: {
    marginBottom: 16,
  },
  discussionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
  },
  discussionDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 11,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  discussionStats: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  skeletonCard: {
    height: 180,
    borderRadius: 12,
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DiscussionsTab;