import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useDirectory } from '@/app/hooks/useDirectory';
import Shimmer from '@/app/components/Shimmer';

interface Organization {
  id: string;
  name: string;
  description: string;
  type: string;
  logoUrl?: string;
  contactEmail: string;
  website?: string;
  location: string;
  department: string;
  services: string[];
  isFollowing: boolean;
  followersCount: number;
  programsCount: number;
  lastActivity: string;
}

interface OrganizationsTabProps {
  loading?: boolean;
  error?: string | null;
  refreshControl?: React.ReactElement<any>;
}

/**
 * Organizations Tab Component
 * Browse and connect with institutions and organizations
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const OrganizationsTab: React.FC<OrganizationsTabProps> = ({
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
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  
  // API integration
  const { institutions, loading: loadingInstitutions, error: institutionsError, fetchInstitutions } = useDirectory();
  
  // Transform institutions to organizations format
  useEffect(() => {
    if (institutions && institutions.length > 0) {
      const transformedOrgs: Organization[] = institutions.map(inst => ({
        id: inst.id,
        name: inst.name,
        description: `Institución ${inst.institutionType.toLowerCase().replace('_', ' ')} ubicada en ${inst.department}, ${inst.region}`,
        type: inst.institutionType === 'GOBIERNOS_MUNICIPALES' ? 'Gobierno' :
              inst.institutionType === 'CENTROS_DE_FORMACION' ? 'Centro de Formación' :
              inst.institutionType === 'ONGS_Y_FUNDACIONES' ? 'ONG' : 'Institución',
        logoUrl: undefined,
        contactEmail: `contacto@${inst.name.toLowerCase().replace(/\s+/g, '')}.org`,
        website: `https://${inst.name.toLowerCase().replace(/\s+/g, '')}.org`,
        location: inst.region,
        department: inst.department,
        services: ['Servicios institucionales', 'Programas', 'Capacitación'],
        isFollowing: false,
        followersCount: Math.floor(Math.random() * 2000) + 100,
        programsCount: Math.floor(Math.random() * 20) + 1,
        lastActivity: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)).toISOString(),
      }));
      setOrganizations(transformedOrgs);
    }
  }, [institutions]);
  
  // Load data on component mount
  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  // Organization types for filtering
  const organizationTypes = [
    'ONG',
    'Incubadora',
    'Aceleradora',
    'Cámara',
    'Universidad',
    'Gobierno',
    'Comunidad',
  ];

  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = !selectedType || org.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // Handle type filter
  const handleTypeFilter = (type: string) => {
    const newType = selectedType === type ? null : type;
    setSelectedType(newType);
  };

  // Handle follow/unfollow
  const handleToggleFollow = async (org: Organization) => {
    const isCurrentlyFollowing = followingStatus[org.id] ?? org.isFollowing;
    
    try {
      // Update local state optimistically
      setFollowingStatus(prev => ({
        ...prev,
        [org.id]: !isCurrentlyFollowing
      }));
      
      // Here you would make API call
      // await organizationService.toggleFollow(org.id, !isCurrentlyFollowing);
      
      Alert.alert(
        isCurrentlyFollowing ? 'Dejaste de seguir' : 'Siguiendo',
        `${isCurrentlyFollowing ? 'Ya no sigues' : 'Ahora sigues'} a ${org.name}`
      );
    } catch (error) {
      // Revert on error
      setFollowingStatus(prev => ({
        ...prev,
        [org.id]: isCurrentlyFollowing
      }));
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  // Handle organization actions
  const handleViewProfile = (org: Organization) => {
    router.push({
      pathname: '/entrepreneurship' as any,
      params: { organizationId: org.id }
    });
  };

  const handleContact = (org: Organization) => {
    Alert.alert(
      'Contactar organización',
      `¿Cómo quieres contactar a ${org.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL(`mailto:${org.contactEmail}`);
          }
        },
        ...(org.website ? [{
          text: 'Sitio web',
          onPress: () => {
            Linking.openURL(org.website!);
          }
        }] : [])
      ]
    );
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

  // Render organization item
  const renderOrganization = ({ item }: { item: Organization }) => {
    const isFollowing = followingStatus[item.id] ?? item.isFollowing;
    
    return (
      <View style={[styles.orgCard, { backgroundColor: cardBackground, borderColor }]}>
        {/* Header */}
        <TouchableOpacity
          style={styles.orgHeader}
          onPress={() => handleViewProfile(item)}
        >
          <View style={styles.orgInfo}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              {item.logoUrl ? (
                <Image source={{ uri: item.logoUrl }} style={styles.logo} />
              ) : (
                <View style={[styles.logoPlaceholder, { backgroundColor: `${tintColor}20` }]}>
                  <ThemedText style={[styles.logoText, { color: tintColor }]}>
                    {item.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Details */}
            <View style={styles.orgDetails}>
              <View style={styles.orgTitleRow}>
                <ThemedText style={styles.orgName} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={[styles.typeBadge, { backgroundColor: `${tintColor}15` }]}>
                  <ThemedText style={[styles.typeText, { color: tintColor }]}>
                    {item.type}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.orgMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location" size={14} color={textColor} />
                  <ThemedText style={styles.metaText}>
                    {item.location}, {item.department}
                  </ThemedText>
                </View>
                
                <View style={styles.metaItem}>
                  <Ionicons name="time" size={14} color={textColor} />
                  <ThemedText style={styles.metaText}>
                    {formatTimeAgo(item.lastActivity)}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Description */}
        <ThemedText style={styles.orgDescription} numberOfLines={3}>
          {item.description}
        </ThemedText>

        {/* Services */}
        <View style={styles.servicesContainer}>
          {item.services.slice(0, 3).map((service, index) => (
            <View key={index} style={[styles.serviceChip, { backgroundColor: `${tintColor}10` }]}>
              <ThemedText style={[styles.serviceText, { color: tintColor }]}>
                {service}
              </ThemedText>
            </View>
          ))}
          {item.services.length > 3 && (
            <ThemedText style={styles.moreServices}>
              +{item.services.length - 3} más
            </ThemedText>
          )}
        </View>

        {/* Stats and Actions */}
        <View style={styles.orgFooter}>
          <View style={styles.orgStats}>
            <View style={styles.statItem}>
              <Ionicons name="people" size={16} color={textColor} />
              <ThemedText style={styles.statText}>
                {item.followersCount.toLocaleString()}
              </ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="briefcase" size={16} color={textColor} />
              <ThemedText style={styles.statText}>
                {item.programsCount} programas
              </ThemedText>
            </View>
          </View>

          <View style={styles.orgActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: `${tintColor}15` }]}
              onPress={() => handleContact(item)}
            >
              <Ionicons name="mail" size={18} color={tintColor} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.followButton,
                {
                  backgroundColor: isFollowing ? 'transparent' : tintColor,
                  borderColor: tintColor,
                  borderWidth: 1,
                }
              ]}
              onPress={() => handleToggleFollow(item)}
            >
              <Ionicons
                name={isFollowing ? "checkmark" : "add"}
                size={16}
                color={isFollowing ? tintColor : "white"}
              />
              <ThemedText
                style={[
                  styles.followButtonText,
                  { color: isFollowing ? tintColor : "white" }
                ]}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Search and filter header
  const SearchHeader = () => (
    <View style={styles.searchHeader}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar organizaciones..."
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

      {/* Type Filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={organizationTypes}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedType === item ? tintColor : 'transparent',
                borderColor: selectedType === item ? tintColor : borderColor,
              }
            ]}
            onPress={() => handleTypeFilter(item)}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: selectedType === item ? 'white' : textColor }
              ]}
            >
              {item}
            </ThemedText>
          </TouchableOpacity>
        )}
      />

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <ThemedText style={styles.resultsCount}>
          {filteredOrganizations.length} organización{filteredOrganizations.length !== 1 ? 'es' : ''}
        </ThemedText>
      </View>
    </View>
  );

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="business-outline" size={64} color={textColor} />
      <ThemedText style={styles.emptyTitle}>
        {searchQuery || selectedType ? 'Sin resultados' : 'No hay organizaciones'}
      </ThemedText>
      <ThemedText style={styles.emptyMessage}>
        {searchQuery || selectedType
          ? 'No se encontraron organizaciones con los filtros aplicados'
          : 'Explora organizaciones que apoyan el emprendimiento'
        }
      </ThemedText>
    </View>
  );

  // Loading state
  if (loadingInstitutions) {
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
  if (institutionsError) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <ThemedText style={styles.errorTitle}>Error al cargar organizaciones</ThemedText>
          <ThemedText style={styles.errorMessage}>{institutionsError}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor }]}
            onPress={fetchInstitutions}
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
        data={filteredOrganizations}
        renderItem={renderOrganization}
        keyExtractor={(item) => item.id}
        refreshControl={refreshControl}
        ListHeaderComponent={SearchHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredOrganizations.length === 0 && styles.emptyContent
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
  resultsHeader: {
    marginBottom: 8,
  },
  resultsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  separator: {
    height: 16,
  },
  orgCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orgHeader: {
    marginBottom: 12,
  },
  orgInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 18,
    fontWeight: '600',
  },
  orgDetails: {
    flex: 1,
  },
  orgTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orgName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  orgMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.7,
  },
  orgDescription: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 12,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  serviceChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreServices: {
    fontSize: 11,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  orgFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  orgStats: {
    flexDirection: 'row',
    gap: 16,
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
  orgActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
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
  },
  skeletonCard: {
    height: 200,
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

export default OrganizationsTab;