import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { ThemedButton } from '../../components/ThemedButton';
import Shimmer from '../../components/Shimmer';
import { useThemeColor } from '../../hooks/useThemeColor';
import { useAuth } from '../../components/AuthContext';
import { useEntrepreneurship } from '../../hooks/useEntrepreneurship';
import { Entrepreneurship } from '../../types/entrepreneurship';

const BUSINESS_STAGE_COLORS = {
  IDEA: '#FF6B6B',
  STARTUP: '#4ECDC4',
  GROWING: '#45B7D1',
  ESTABLISHED: '#96CEB4',
};

const BUSINESS_STAGE_LABELS = {
  IDEA: 'Idea',
  STARTUP: 'Startup',
  GROWING: 'En Crecimiento',
  ESTABLISHED: 'Establecido',
};

export default function EntrepreneurshipDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { entrepreneurship, loading, error, fetchEntrepreneurship } = useEntrepreneurship(id);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');
  const iconColor = useThemeColor({}, 'tint');

  const isOwner = user?.id === entrepreneurship?.ownerId;

  const handleRefresh = async () => {
    if (!id) return;
    
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await fetchEntrepreneurship(id);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEdit = () => {
    if (!entrepreneurship?.id) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/entrepreneurship/${entrepreneurship.id}/edit` as any);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // In a real app, this would share the project
    Alert.alert(
      'Compartir Proyecto',
      '¿Deseas compartir este proyecto de emprendimiento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Compartir', onPress: () => console.log('Share project') },
      ]
    );
  };

  const handleContact = () => {
    if (!entrepreneurship?.owner) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate to messaging
    Alert.alert(
      'Contactar',
      `¿Deseas enviar un mensaje a ${entrepreneurship.owner.firstName} ${entrepreneurship.owner.lastName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Enviar Mensaje', onPress: () => console.log('Send message') },
      ]
    );
  };

  const handleOpenWebsite = async () => {
    if (!entrepreneurship?.website) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Linking.openURL(entrepreneurship.website);
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el sitio web');
    }
  };

  const handleSocialLink = async (platform: string, url: string) => {
    if (!url) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', `No se pudo abrir ${platform}`);
    }
  };

  const renderLoadingState = () => (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Proyecto
        </ThemedText>
        <View style={styles.headerActions} />
      </ThemedView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Shimmer>
          <View style={[styles.heroSection, { backgroundColor: cardColor }]}>
            <View style={[styles.logoPlaceholder, { backgroundColor: borderColor }]} />
            <View style={[styles.titlePlaceholder, { backgroundColor: borderColor }]} />
            <View style={[styles.badgesContainer]}>
              <View style={[styles.badgePlaceholder, { backgroundColor: borderColor }]} />
              <View style={[styles.badgePlaceholder, { backgroundColor: borderColor }]} />
            </View>
          </View>
        </Shimmer>

        <Shimmer>
          <View style={[styles.section, { backgroundColor: cardColor }]}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={[styles.textPlaceholder, { backgroundColor: borderColor }]} />
            ))}
          </View>
        </Shimmer>
      </ScrollView>
    </SafeAreaView>
  );

  const renderErrorState = () => (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Error
        </ThemedText>
        <View style={styles.headerActions} />
      </ThemedView>

      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={secondaryTextColor} />
        <ThemedText type="subtitle" style={[styles.errorTitle, { color: textColor }]}>
          Error al cargar el proyecto
        </ThemedText>
        <ThemedText style={[styles.errorMessage, { color: secondaryTextColor }]}>
          {error || 'No se pudo cargar la información del proyecto'}
        </ThemedText>
        <ThemedButton
          title="Intentar de nuevo"
          onPress={() => id && fetchEntrepreneurship(id)}
          style={styles.retryButton}
        />
      </View>
    </SafeAreaView>
  );

  if (loading) return renderLoadingState();
  if (error || !entrepreneurship) return renderErrorState();

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={iconColor} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          {entrepreneurship.name}
        </ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={iconColor} />
          </TouchableOpacity>
          {isOwner && (
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color={iconColor} />
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={iconColor}
            colors={[iconColor]}
          />
        }
      >
        {/* Hero Section */}
        <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
          <View style={styles.heroContent}>
            {entrepreneurship.logo && (
              <View style={[styles.logoContainer, { borderColor }]}>
                {/* In a real app, this would be an Image component */}
                <Ionicons name="business-outline" size={40} color={iconColor} />
              </View>
            )}
            
            <View style={styles.heroText}>
              <ThemedText type="title" style={[styles.projectTitle, { color: textColor }]}>
                {entrepreneurship.name}
              </ThemedText>
              
              <View style={styles.badgesContainer}>
                <View style={[
                  styles.badge,
                  { backgroundColor: BUSINESS_STAGE_COLORS[entrepreneurship.businessStage] + '20' }
                ]}>
                  <ThemedText style={[
                    styles.badgeText,
                    { color: BUSINESS_STAGE_COLORS[entrepreneurship.businessStage] }
                  ]}>
                    {BUSINESS_STAGE_LABELS[entrepreneurship.businessStage]}
                  </ThemedText>
                </View>
                
                <View style={[styles.badge, { backgroundColor: iconColor + '20' }]}>
                  <ThemedText style={[styles.badgeText, { color: iconColor }]}>
                    {entrepreneurship.category}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={16} color={secondaryTextColor} />
                <ThemedText style={[styles.locationText, { color: secondaryTextColor }]}>
                  {entrepreneurship.municipality}, {entrepreneurship.department}
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        {/* Description */}
        <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Descripción
          </ThemedText>
          <ThemedText style={[styles.description, { color: secondaryTextColor }]}>
            {entrepreneurship.description}
          </ThemedText>
        </ThemedView>

        {/* Business Details */}
        <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Detalles del Negocio
          </ThemedText>
          
          {entrepreneurship.founded && (
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color={iconColor} />
              <View style={styles.detailContent}>
                <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>
                  Fundado
                </ThemedText>
                <ThemedText style={[styles.detailValue, { color: textColor }]}>
                  {formatDate(entrepreneurship.founded)}
                </ThemedText>
              </View>
            </View>
          )}

          {entrepreneurship.employees && (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={20} color={iconColor} />
              <View style={styles.detailContent}>
                <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>
                  Empleados
                </ThemedText>
                <ThemedText style={[styles.detailValue, { color: textColor }]}>
                  {entrepreneurship.employees}
                </ThemedText>
              </View>
            </View>
          )}

          {entrepreneurship.businessModel && (
            <View style={styles.detailRow}>
              <Ionicons name="trending-up-outline" size={20} color={iconColor} />
              <View style={styles.detailContent}>
                <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>
                  Modelo de Negocio
                </ThemedText>
                <ThemedText style={[styles.detailValue, { color: textColor }]}>
                  {entrepreneurship.businessModel}
                </ThemedText>
              </View>
            </View>
          )}

          {entrepreneurship.targetMarket && (
            <View style={styles.detailRow}>
              <Ionicons name="radio-button-on-outline" size={20} color={iconColor} />
              <View style={styles.detailContent}>
                <ThemedText style={[styles.detailLabel, { color: secondaryTextColor }]}>
                  Mercado Objetivo
                </ThemedText>
                <ThemedText style={[styles.detailValue, { color: textColor }]}>
                  {entrepreneurship.targetMarket}
                </ThemedText>
              </View>
            </View>
          )}
        </ThemedView>

        {/* Contact Information */}
        <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Información de Contacto
          </ThemedText>

          {entrepreneurship.email && (
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.contactText, { color: textColor }]}>
                {entrepreneurship.email}
              </ThemedText>
            </View>
          )}

          {entrepreneurship.phone && (
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.contactText, { color: textColor }]}>
                {entrepreneurship.phone}
              </ThemedText>
            </View>
          )}

          {entrepreneurship.website && (
            <TouchableOpacity onPress={handleOpenWebsite} style={styles.contactRow}>
              <Ionicons name="globe-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.contactText, styles.linkText, { color: iconColor }]}>
                {entrepreneurship.website}
              </ThemedText>
            </TouchableOpacity>
          )}

          {entrepreneurship.address && (
            <View style={styles.contactRow}>
              <Ionicons name="location-outline" size={20} color={iconColor} />
              <ThemedText style={[styles.contactText, { color: textColor }]}>
                {entrepreneurship.address}
              </ThemedText>
            </View>
          )}
        </ThemedView>

        {/* Social Media */}
        {entrepreneurship.socialMedia && (
          <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
              Redes Sociales
            </ThemedText>
            
            <View style={styles.socialContainer}>
              {entrepreneurship.socialMedia.facebook && (
                <TouchableOpacity
                  onPress={() => handleSocialLink('Facebook', entrepreneurship.socialMedia!.facebook!)}
                  style={[styles.socialButton, { backgroundColor: '#1877F2' + '20' }]}
                >
                  <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                  <ThemedText style={[styles.socialText, { color: '#1877F2' }]}>
                    Facebook
                  </ThemedText>
                </TouchableOpacity>
              )}

              {entrepreneurship.socialMedia.instagram && (
                <TouchableOpacity
                  onPress={() => handleSocialLink('Instagram', entrepreneurship.socialMedia!.instagram!)}
                  style={[styles.socialButton, { backgroundColor: '#E4405F' + '20' }]}
                >
                  <Ionicons name="logo-instagram" size={24} color="#E4405F" />
                  <ThemedText style={[styles.socialText, { color: '#E4405F' }]}>
                    Instagram
                  </ThemedText>
                </TouchableOpacity>
              )}

              {entrepreneurship.socialMedia.linkedin && (
                <TouchableOpacity
                  onPress={() => handleSocialLink('LinkedIn', entrepreneurship.socialMedia!.linkedin!)}
                  style={[styles.socialButton, { backgroundColor: '#0A66C2' + '20' }]}
                >
                  <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
                  <ThemedText style={[styles.socialText, { color: '#0A66C2' }]}>
                    LinkedIn
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </ThemedView>
        )}

        {/* Owner Information */}
        {entrepreneurship.owner && (
          <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
              Propietario
            </ThemedText>

            <View style={styles.ownerContainer}>
              <View style={[styles.ownerAvatar, { backgroundColor: iconColor + '20' }]}>
                <ThemedText style={[styles.ownerInitials, { color: iconColor }]}>
                  {entrepreneurship.owner.firstName[0]}{entrepreneurship.owner.lastName[0]}
                </ThemedText>
              </View>
              
              <View style={styles.ownerInfo}>
                <ThemedText style={[styles.ownerName, { color: textColor }]}>
                  {entrepreneurship.owner.firstName} {entrepreneurship.owner.lastName}
                </ThemedText>
                <ThemedText style={[styles.ownerEmail, { color: secondaryTextColor }]}>
                  {entrepreneurship.owner.email}
                </ThemedText>
                {entrepreneurship.owner.currentInstitution && (
                  <ThemedText style={[styles.ownerInstitution, { color: secondaryTextColor }]}>
                    {entrepreneurship.owner.currentInstitution}
                  </ThemedText>
                )}
              </View>
            </View>

            {!isOwner && (
              <ThemedButton
                title="Contactar"
                onPress={handleContact}
                style={styles.contactButton}
              />
            )}
          </ThemedView>
        )}

        {/* Statistics */}
        <ThemedView style={[styles.section, { backgroundColor: cardColor }]}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: textColor }]}>
            Estadísticas
          </ThemedText>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {entrepreneurship.viewsCount.toLocaleString()}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
                Visualizaciones
              </ThemedText>
            </View>

            {entrepreneurship.rating && (
              <View style={styles.statItem}>
                <View style={styles.ratingContainer}>
                  <ThemedText style={[styles.statValue, { color: textColor }]}>
                    {entrepreneurship.rating.toFixed(1)}
                  </ThemedText>
                  <Ionicons name="star" size={16} color="#FFD700" />
                </View>
                <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
                  Calificación
                </ThemedText>
              </View>
            )}

            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {entrepreneurship.reviewsCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: secondaryTextColor }]}>
                Reseñas
              </ThemedText>
            </View>
          </View>
        </ThemedView>

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
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    marginBottom: 8,
  },
  heroSection: {
    marginTop: 0,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  heroText: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  socialText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ownerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerInitials: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  ownerEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  ownerInstitution: {
    fontSize: 14,
  },
  contactButton: {
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  // Loading states
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  titlePlaceholder: {
    height: 28,
    width: '70%',
    borderRadius: 6,
    marginBottom: 12,
  },
  badgePlaceholder: {
    height: 24,
    width: 80,
    borderRadius: 12,
    marginRight: 8,
  },
  textPlaceholder: {
    height: 16,
    width: '100%',
    borderRadius: 4,
    marginBottom: 8,
  },
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 32,
  },
  bottomSpacing: {
    height: 40,
  },
});