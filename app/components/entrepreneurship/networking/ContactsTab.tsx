import React, { useState, useCallback } from 'react';
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
import { ContactUser } from '@/app/types/entrepreneurship';

interface ContactsTabProps {
  contacts: ContactUser[];
  loading?: boolean;
  error?: string | null;
  refreshControl?: React.ReactElement<any>;
}

/**
 * Contacts Tab Component
 * Manage connected contacts with search and actions
 * Based on ENTREPRENEURSHIP_MOBILE_SPEC.md requirements
 */

const ContactsTab: React.FC<ContactsTabProps> = ({
  contacts,
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
  const [selectedSortBy, setSelectedSortBy] = useState<'name' | 'recent' | 'institution'>('name');

  // Sort options
  const sortOptions = [
    { key: 'name', label: 'Nombre' },
    { key: 'recent', label: 'Reciente' },
    { key: 'institution', label: 'Institución' },
  ];

  // Filter and sort contacts
  const filteredContacts = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.currentInstitution?.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    switch (selectedSortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'recent':
        return new Date(b.lastContactDate || b.connectionDate || 0).getTime() - 
               new Date(a.lastContactDate || a.connectionDate || 0).getTime();
      case 'institution':
        return (a.currentInstitution || '').localeCompare(b.currentInstitution || '');
      default:
        return 0;
    }
  });

  // Handle contact actions
  const handleMessage = (contact: ContactUser) => {
    router.push({
      pathname: '/entrepreneurship/network' as any,
      params: { contactId: contact.userId }
    });
  };

  const handleCall = (contact: ContactUser) => {
    if (contact.phoneNumber) {
      Alert.alert(
        'Llamar contacto',
        `¿Quieres llamar a ${contact.firstName} ${contact.lastName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Llamar',
            onPress: () => {
              Linking.openURL(`tel:${contact.phoneNumber}`);
            }
          }
        ]
      );
    } else {
      Alert.alert('No disponible', 'Este contacto no tiene número de teléfono');
    }
  };

  const handleEmail = (contact: ContactUser) => {
    if (contact.email) {
      Linking.openURL(`mailto:${contact.email}`);
    } else {
      Alert.alert('No disponible', 'Este contacto no tiene email');
    }
  };

  const handleViewProfile = (contact: ContactUser) => {
    router.push({
      pathname: '/entrepreneurship' as any,
      params: { userId: contact.userId }
    });
  };

  // Render contact item
  const renderContact = ({ item }: { item: ContactUser }) => (
    <View style={[styles.contactCard, { backgroundColor: cardBackground, borderColor }]}>
      {/* Contact Info */}
      <TouchableOpacity
        style={styles.contactInfo}
        onPress={() => handleViewProfile(item)}
      >
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
          
          {/* Status indicator */}
          <View style={[styles.statusIndicator, { backgroundColor: '#10b981' }]} />
        </View>

        {/* Details */}
        <View style={styles.contactDetails}>
          <ThemedText style={styles.contactName}>
            {item.firstName} {item.lastName}
          </ThemedText>
          
          {item.currentInstitution && (
            <ThemedText style={styles.contactInstitution} numberOfLines={1}>
              {item.currentInstitution}
            </ThemedText>
          )}

          <View style={styles.contactMeta}>
            {item.department && (
              <View style={styles.metaItem}>
                <Ionicons name="location" size={14} color={textColor} />
                <ThemedText style={styles.metaText}>
                  {item.municipality}, {item.department}
                </ThemedText>
              </View>
            )}
            
            {item.lastContactDate && (
              <View style={styles.metaItem}>
                <Ionicons name="time" size={14} color={textColor} />
                <ThemedText style={styles.metaText}>
                  Último contacto: {new Date(item.lastContactDate).toLocaleDateString()}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Skills preview */}
          {item.skills.length > 0 && (
            <View style={styles.skillsContainer}>
              {item.skills.slice(0, 2).map((skill, index) => (
                <View key={index} style={[styles.skillChip, { backgroundColor: `${tintColor}15` }]}>
                  <ThemedText style={[styles.skillText, { color: tintColor }]}>
                    {skill}
                  </ThemedText>
                </View>
              ))}
              {item.skills.length > 2 && (
                <ThemedText style={styles.moreSkills}>
                  +{item.skills.length - 2}
                </ThemedText>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Quick Actions */}
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: `${tintColor}15` }]}
          onPress={() => handleMessage(item)}
        >
          <Ionicons name="chatbubble" size={18} color={tintColor} />
        </TouchableOpacity>

        {item.phoneNumber && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b98115' }]}
            onPress={() => handleCall(item)}
          >
            <Ionicons name="call" size={18} color="#10b981" />
          </TouchableOpacity>
        )}

        {item.email && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#f59e0b15' }]}
            onPress={() => handleEmail(item)}
          >
            <Ionicons name="mail" size={18} color="#f59e0b" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Search and filter header
  const SearchHeader = () => (
    <View style={styles.searchHeader}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: cardBackground, borderColor }]}>
        <Ionicons name="search" size={20} color={textColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar contactos..."
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

      {/* Sort Options */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={sortOptions}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.sortContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.sortChip,
              {
                backgroundColor: selectedSortBy === item.key ? tintColor : 'transparent',
                borderColor: selectedSortBy === item.key ? tintColor : borderColor,
              }
            ]}
            onPress={() => setSelectedSortBy(item.key as any)}
          >
            <ThemedText
              style={[
                styles.sortChipText,
                { color: selectedSortBy === item.key ? 'white' : textColor }
              ]}
            >
              {item.label}
            </ThemedText>
          </TouchableOpacity>
        )}
      />

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <ThemedText style={styles.resultsCount}>
          {filteredContacts.length} contacto{filteredContacts.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>
    </View>
  );

  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color={textColor} />
      <ThemedText style={styles.emptyTitle}>
        {searchQuery ? 'Sin resultados' : 'No hay contactos'}
      </ThemedText>
      <ThemedText style={styles.emptyMessage}>
        {searchQuery 
          ? 'No se encontraron contactos con ese criterio de búsqueda'
          : 'Conecta con otros emprendedores para construir tu red'
        }
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <FlatList
        data={filteredContacts}
        renderItem={renderContact}
        keyExtractor={(item) => item.userId}
        refreshControl={refreshControl}
        ListHeaderComponent={SearchHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={[
          styles.listContent,
          filteredContacts.length === 0 && styles.emptyContent
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
  sortContainer: {
    paddingBottom: 16,
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  sortChipText: {
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
  contactCard: {
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
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  avatarContainer: {
    position: 'relative',
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
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactInstitution: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
    marginBottom: 8,
  },
  contactMeta: {
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
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 16,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
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

export default ContactsTab;