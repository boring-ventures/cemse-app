import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import Shimmer from '../../../components/Shimmer';
import { useThemeColor } from '../../../hooks/useThemeColor';
import { useAuth } from '../../../components/AuthContext';
import { entrepreneurshipApiService } from '../../../services/entrepreneurshipApiService';
import { Institution } from '../../../types/entrepreneurship';

export default function DirectoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = institutions.filter(institution =>
        institution.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        institution.region.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredInstitutions(filtered);
    } else {
      setFilteredInstitutions(institutions);
    }
  }, [searchQuery, institutions]);

  const fetchInstitutions = async () => {
    try {
      const response = await entrepreneurshipApiService.getPublicInstitutions();
      if (response.success && response.data) {
        setInstitutions(response.data);
        setFilteredInstitutions(response.data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las instituciones');
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleInstitutionPress = (institutionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/entrepreneurship/directory/${institutionId}`);
  };

  const renderLoadingState = () => (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Directorio
        </ThemedText>
        <View style={styles.headerActions} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {[...Array(6)].map((_, index) => (
          <Shimmer key={index}>
            <View style={[styles.institutionCard, { backgroundColor: cardColor }]}>
              <View style={[styles.cardPlaceholder, { backgroundColor: borderColor }]} />
            </View>
          </Shimmer>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  if (loading) return renderLoadingState();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Directorio de Instituciones
        </ThemedText>
        <View style={styles.headerActions} />
      </ThemedView>

      {/* Search */}
      <ThemedView style={styles.searchContainer}>
        <View style={[styles.searchBox, { borderColor, backgroundColor: cardColor }]}>
          <Ionicons name="search" size={20} color={secondaryTextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Buscar instituciones..."
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </ThemedView>

      {/* Results */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <ThemedText style={[styles.resultsText, { color: secondaryTextColor }]}>
            {filteredInstitutions.length} instituciones encontradas
          </ThemedText>
        </View>

        {filteredInstitutions.map((institution) => (
          <TouchableOpacity
            key={institution.id}
            style={[styles.institutionCard, { backgroundColor: cardColor }]}
            onPress={() => handleInstitutionPress(institution.id)}
          >
            <View style={styles.cardContent}>
              <View style={styles.institutionInfo}>
                <ThemedText type="subtitle" style={[styles.institutionName, { color: textColor }]}>
                  {institution.name}
                </ThemedText>
                <View style={styles.locationInfo}>
                  <Ionicons name="location-outline" size={16} color={secondaryTextColor} />
                  <ThemedText style={[styles.locationText, { color: secondaryTextColor }]}>
                    {institution.department}, {institution.region}
                  </ThemedText>
                </View>
                <View style={styles.typeInfo}>
                  <View style={[styles.typeBadge, { backgroundColor: iconColor }]}>
                    <ThemedText style={styles.typeBadgeText}>
                      {institution.institutionType.replace('_', ' ')}
                    </ThemedText>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
            </View>
          </TouchableOpacity>
        ))}

        {filteredInstitutions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={64} color={secondaryTextColor} />
            <ThemedText type="subtitle" style={[styles.emptyTitle, { color: textColor }]}>
              No se encontraron instituciones
            </ThemedText>
            <ThemedText style={[styles.emptyMessage, { color: secondaryTextColor }]}>
              Intenta con otros términos de búsqueda
            </ThemedText>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  resultsText: {
    fontSize: 14,
  },
  institutionCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  institutionInfo: {
    flex: 1,
  },
  institutionName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
  },
  typeInfo: {
    flexDirection: 'row',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Loading states
  cardPlaceholder: {
    height: 100,
    borderRadius: 8,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomSpacing: {
    height: 40,
  },
});