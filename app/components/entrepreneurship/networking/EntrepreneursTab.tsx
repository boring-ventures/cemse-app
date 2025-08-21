import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { ContactUser } from '@/app/types/entrepreneurship';

interface EntrepreneursTabProps {
  users: ContactUser[];
  onSendRequest: (userId: string, message?: string) => Promise<boolean>;
  onSearch: (query?: string, filters?: any) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  refreshControl?: React.ReactElement<any>;
}

/**
 * Entrepreneurs Tab Component
 * Search and connect with other entrepreneurs
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const EntrepreneursTab: React.FC<EntrepreneursTabProps> = ({
  users,
  onSendRequest,
  onSearch,
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
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());

  // Departments for filtering
  const departments = [
    'La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 
    'Tarija', 'Sucre', 'Trinidad', 'Cobija'
  ];

  // Handle search
  const handleSearch = useCallback(async (query?: string, department?: string) => {
    const filters = department ? { department } : undefined;
    await onSearch(query, filters);
  }, [onSearch]);

  // Handle search input change
  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // Debounce search
    setTimeout(() => {
      if (text === searchQuery) {
        handleSearch(text, selectedDepartment || undefined);
      }
    }, 500);
  };

  // Handle department filter
  const handleDepartmentFilter = (department: string) => {
    const newDepartment = selectedDepartment === department ? null : department;
    setSelectedDepartment(newDepartment);
    handleSearch(searchQuery || undefined, newDepartment || undefined);
  };

  // Handle send request
  const handleSendRequest = async (user: ContactUser) => {
    // Show confirmation dialog with message input
    Alert.prompt(
      'Enviar solicitud de contacto',
      `¿Quieres conectar con ${user.firstName} ${user.lastName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Enviar',
          onPress: async (message) => {
            setSendingRequests(prev => new Set(prev).add(user.userId));
            
            try {
              const success = await onSendRequest(user.userId, message);
              if (success) {
                Alert.alert(
                  'Solicitud enviada',
                  `Se envió la solicitud de conexión a ${user.firstName}`
                );
              }
            } finally {
              setSendingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(user.userId);
                return newSet;
              });
            }
          }
        }
      ],
      'plain-text',
      '',
      'Mensaje opcional...'
    );
  };

  // Get contact status button
  const getContactStatusButton = (user: ContactUser) => {
    const isSending = sendingRequests.has(user.userId);
    
    if (isSending) {
      return (
        <View style={[styles.statusButton, styles.loadingButton]}>
          <Ionicons name="hourglass" size={16} color={textColor} />
          <ThemedText style={styles.statusButtonText}>Enviando...</ThemedText>
        </View>
      );
    }

    switch (user.contactStatus) {
      case 'CONNECTED':
        return (
          <View style={[styles.statusButton, styles.connectedButton, { backgroundColor: `${tintColor}20` }]}>
            <Ionicons name="checkmark-circle" size={16} color={tintColor} />
            <ThemedText style={[styles.statusButtonText, { color: tintColor }]}>
              Conectado
            </ThemedText>
          </View>
        );
      case 'SENT':
        return (
          <View style={[styles.statusButton, styles.pendingButton, { backgroundColor: `#f59e0b20` }]}>
            <Ionicons name="time" size={16} color="#f59e0b" />
            <ThemedText style={[styles.statusButtonText, { color: '#f59e0b' }]}>
              Enviada
            </ThemedText>
          </View>
        );
      case 'RECEIVED':
        return (
          <View style={[styles.statusButton, styles.receivedButton, { backgroundColor: `#3b82f620` }]}>
            <Ionicons name="mail" size={16} color="#3b82f6" />
            <ThemedText style={[styles.statusButtonText, { color: '#3b82f6' }]}>
              Recibida
            </ThemedText>
          </View>
        );
      default:
        return (
          <TouchableOpacity
            style={[styles.statusButton, styles.connectButton, { backgroundColor: tintColor }]}
            onPress={() => handleSendRequest(user)}
          >
            <Ionicons name="person-add" size={16} color="white" />
            <ThemedText style={[styles.statusButtonText, { color: 'white' }]}>
              Conectar
            </ThemedText>
          </TouchableOpacity>
        );
    }
  };

  // Render user item
  const renderUser = ({ item }: { item: ContactUser }) => (
    <View style={[styles.userCard, { backgroundColor: cardBackground, borderColor }]}>
      {/* User Info */}
      <View style={styles.userInfo}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {item.avatarUrl ? (
            <Image source={{ uri: item.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: `${tintColor}20` }]}>
              <ThemedText style={[styles.avatarText, { color: tintColor }]}>
                {item.firstName[0]}{item.lastName[0]}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={styles.userDetails}>
          <ThemedText style={styles.userName}>
            {item.firstName} {item.lastName}
          </ThemedText>
          
          {item.currentInstitution && (
            <ThemedText style={styles.userInstitution} numberOfLines={1}>
              {item.currentInstitution}
            </ThemedText>
          )}

          <View style={styles.userMeta}>
            {item.department && (
              <View style={styles.metaItem}>
                <Ionicons name="location" size={14} color={textColor} />
                <ThemedText style={styles.metaText}>
                  {item.municipality}, {item.department}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Skills */}
          {item.skills.length > 0 && (
            <View style={styles.skillsContainer}>
              {item.skills.slice(0, 3).map((skill, index) => (
                <View key={index} style={[styles.skillChip, { backgroundColor: `${tintColor}15` }]}>
                  <ThemedText style={[styles.skillText, { color: tintColor }]}>
                    {skill}
                  </ThemedText>
                </View>
              ))}
              {item.skills.length > 3 && (
                <ThemedText style={styles.moreSkills}>
                  +{item.skills.length - 3} más
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.userActions}>
        {getContactStatusButton(item)}
      </View>
    </View>
  );

  // Search header
  const SearchHeader = () => (
    <View style={styles.searchHeader}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar emprendedores..."
          placeholderTextColor={`${textColor}60`}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => {
            setSearchQuery('');
            handleSearch('', selectedDepartment || undefined);
          }}>
            <Ionicons name="close-circle" size={20} color={textColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Department Filters */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={departments}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filtersContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              {
                backgroundColor: selectedDepartment === item ? tintColor : 'transparent',
                borderColor: selectedDepartment === item ? tintColor : borderColor,
              }
            ]}
            onPress={() => handleDepartmentFilter(item)}
          >
            <ThemedText
              style={[
                styles.filterChipText,
                { color: selectedDepartment === item ? 'white' : textColor }
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
          {users.length} emprendedor{users.length !== 1 ? 'es' : ''} encontrado{users.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>
    </View>
  );

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={textColor} />
      <ThemedText style={styles.emptyTitle}>
        {searchQuery || selectedDepartment ? 'Sin resultados' : 'Explora emprendedores'}
      </ThemedText>
      <ThemedText style={styles.emptyMessage}>
        {searchQuery || selectedDepartment 
          ? 'No se encontraron emprendedores con los filtros aplicados'
          : 'Usa la búsqueda para encontrar emprendedores y expandir tu red'
        }
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.userId}
        refreshControl={refreshControl}
        ListHeaderComponent={SearchHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={[
          styles.listContent,
          users.length === 0 && styles.emptyContent
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
  userCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userInstitution: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 8,
  },
  userMeta: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.7,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  skillChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  moreSkills: {
    fontSize: 11,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  userActions: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    justifyContent: 'center',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  connectButton: {
    // backgroundColor set dynamically
  },
  connectedButton: {
    // backgroundColor set dynamically
  },
  pendingButton: {
    // backgroundColor set dynamically
  },
  receivedButton: {
    // backgroundColor set dynamically
  },
  loadingButton: {
    opacity: 0.6,
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
});

export default EntrepreneursTab;