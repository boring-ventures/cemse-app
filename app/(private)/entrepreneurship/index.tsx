import { useThemeColor } from '@/app/hooks/useThemeColor';
import { FeatureCard, Resource, Program, SuccessStory } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { EntrepreneurshipCard } from '../../components/entrepreneurship/EntrepreneurshipCard';
import { ResourceCard } from '../../components/entrepreneurship/ResourceCard';
import Shimmer from '../../components/Shimmer';
import { useResources } from '../../hooks/useResources';
import { useAuth } from '../../components/AuthContext';

export default function EntrepreneurshipHub() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'resources' | 'programs'>('resources');
  const [programs, setPrograms] = useState<Program[]>([]);
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  
  const router = useRouter();
  const { user } = useAuth();
  const { resources, loading: loadingResources, error: resourcesError, fetchResources } = useResources();
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'card');

  // Mock feature cards data
  const features: FeatureCard[] = [
    {
      id: '1',
      title: 'Simulador de Plan',
      description: 'Crea tu plan de negocios paso a paso',
      icon: 'document-text-outline',
      route: '/entrepreneurship/business-plan-simulator',
      color: '#8B5CF6',
      isAvailable: true,
    },
    {
      id: '2',
      title: 'Centro de Recursos',
      description: 'Plantillas, guías y herramientas',
      icon: 'library-outline',
      route: '/entrepreneurship/resource-center',
      color: '#32D74B',
      isAvailable: true,
    },
    {
      id: '3',
      title: 'Red de Contactos',
      description: 'Conecta con otros emprendedores',
      icon: 'people-outline',
      route: '/entrepreneurship/network',
      color: '#FF9500',
      isAvailable: true,
    },
    {
      id: '4',
      title: 'Mentorías',
      description: 'Encuentra mentores expertos',
      icon: 'school-outline',
      route: '/entrepreneurship/mentors',
      color: '#5856D6',
      isAvailable: true,
    },
  ];

  // TODO: Replace with actual programs API when available
  // For now, keep empty until programs endpoint is implemented

  // Load programs data
  const loadPrograms = async () => {
    setLoadingPrograms(true);
    try {
      // TODO: Implement actual API call when programs endpoint is available
      // const response = await entrepreneurshipApiService.getPrograms(token);
      // if (response.success && response.data) {
      //   setPrograms(response.data);
      // }
      
      // Simulate API call delay and return empty array for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPrograms([]);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoadingPrograms(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await Promise.all([
        fetchResources(),
        loadPrograms()
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
      Alert.alert('Error', 'No se pudo actualizar la información');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreateBusinessPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/entrepreneurship/business-plan-simulator');
  };

  const handleExploreResources = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/entrepreneurship/resource-center');
  };

  const handleViewAllResources = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/entrepreneurship/resource-center');
  };

  const handleTabPress = (tab: 'resources' | 'programs') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleProgramPress = (program: Program) => {
    Alert.alert(
      program.name,
      `${program.description}\n\nOrganizador: ${program.organizer}\nDuración: ${program.duration}\nFecha límite: ${program.deadline}`,
      [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Más información', onPress: () => console.log('Program details:', program.id) }
      ]
    );
  };

  const handleResourcePress = (resource: Resource) => {
    console.log('Resource pressed:', resource.title);
    // Handle resource navigation
  };

  const handleResourceDownload = (resource: Resource) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Download resource:', resource.title);
    // Handle resource download
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <ThemedView style={styles.wrapper}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={iconColor}
              colors={[iconColor]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <LinearGradient
            colors={['#6B46C1', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIcons}>
                <Ionicons name="rocket" size={24} color="white" style={styles.heroIcon} />
                <Ionicons name="link" size={20} color="white" style={styles.heroIcon} />
                <Ionicons name="business" size={22} color="white" style={styles.heroIcon} />
              </View>
              
              <ThemedText type="title" style={styles.heroTitle}>
                🚀 Convierte tu Idea en Realidad
              </ThemedText>
              
              <ThemedText style={styles.heroSubtitle}>
                Crea tu plan de negocios paso a paso con nuestras herramientas gratuitas diseñadas para emprendedores bolivianos
              </ThemedText>
              
              <ThemedButton
                title="🚀 Crear Mi Plan Ahora"
                onPress={handleCreateBusinessPlan}
                type="primary"
                style={styles.heroCTA}
              />
            </View>
          </LinearGradient>

          {/* Main Features Grid */}
          <View style={styles.featuresSection}>
            <ThemedText type="title" style={[styles.sectionTitle, { color: textColor }]}>
              Herramientas Principales
            </ThemedText>
            
            <View style={styles.featuresGrid}>
              {features.map((feature) => (
                <EntrepreneurshipCard 
                  key={feature.id} 
                  feature={feature}
                />
              ))}
            </View>
          </View>

          {/* Tabbed Content Section */}
          <View style={styles.tabbedSection}>
            <View style={styles.tabbedHeader}>
              <View>
                <ThemedText type="title" style={[styles.sectionTitle, { color: textColor }]}>
                  {activeTab === 'resources' ? 'Recursos Destacados' : 'Programas Disponibles'}
                </ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: secondaryTextColor }]}>
                  {activeTab === 'resources' 
                    ? 'Descarga plantillas y guías para tu emprendimiento'
                    : 'Programas de aceleración e incubación disponibles'
                  }
                </ThemedText>
              </View>
              
              <TouchableOpacity 
                style={[styles.viewAllButton, { backgroundColor: iconColor + '15' }]}
                onPress={handleViewAllResources}
              >
                <ThemedText style={[styles.viewAllText, { color: iconColor }]}>
                  {activeTab === 'resources' ? '📖 Ver todos' : '🚀 Ver todos'}
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={iconColor} />
              </TouchableOpacity>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: activeTab === 'resources' ? iconColor : 'transparent',
                    borderColor: iconColor,
                  }
                ]}
                onPress={() => handleTabPress('resources')}
              >
                <Ionicons 
                  name="library" 
                  size={16} 
                  color={activeTab === 'resources' ? 'white' : iconColor} 
                />
                <ThemedText style={[
                  styles.tabButtonText,
                  { color: activeTab === 'resources' ? 'white' : iconColor }
                ]}>
                  Recursos
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  {
                    backgroundColor: activeTab === 'programs' ? iconColor : 'transparent',
                    borderColor: iconColor,
                  }
                ]}
                onPress={() => handleTabPress('programs')}
              >
                <Ionicons 
                  name="rocket" 
                  size={16} 
                  color={activeTab === 'programs' ? 'white' : iconColor} 
                />
                <ThemedText style={[
                  styles.tabButtonText,
                  { color: activeTab === 'programs' ? 'white' : iconColor }
                ]}>
                  Programas
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'resources' ? (
              <View style={styles.tabContent}>
                {loadingResources ? (
                  <View style={styles.loadingContent}>
                    {[1, 2, 3].map((_, index) => (
                      <Shimmer key={index}>
                        <View style={[styles.skeletonCard, { backgroundColor: `${iconColor}20` }]} />
                      </Shimmer>
                    ))}
                  </View>
                ) : resourcesError ? (
                  <View style={styles.errorContent}>
                    <Ionicons name="alert-circle" size={48} color="#ef4444" />
                    <ThemedText style={styles.errorTitle}>Error al cargar recursos</ThemedText>
                    <ThemedText style={styles.errorMessage}>{resourcesError}</ThemedText>
                    <TouchableOpacity
                      style={[styles.retryButton, { backgroundColor: iconColor }]}
                      onPress={fetchResources}
                    >
                      <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : resources.length === 0 ? (
                  <View style={styles.emptyContent}>
                    <Ionicons name="library-outline" size={48} color={secondaryTextColor} />
                    <ThemedText style={styles.emptyTitle}>Sin recursos disponibles</ThemedText>
                    <ThemedText style={styles.emptyMessage}>
                      No se encontraron recursos en este momento
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.resourcesList}>
                    {resources.slice(0, 3).map((resource) => (
                      <ResourceCard
                        key={resource.id}
                        resource={resource}
                        onPress={() => handleResourcePress(resource)}
                        onDownload={() => handleResourceDownload(resource)}
                      />
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.tabContent}>
                {loadingPrograms ? (
                  <View style={styles.loadingContent}>
                    {[1, 2].map((_, index) => (
                      <Shimmer key={index}>
                        <View style={[styles.skeletonCard, { backgroundColor: `${iconColor}20` }]} />
                      </Shimmer>
                    ))}
                  </View>
                ) : programs.length === 0 ? (
                  <View style={styles.emptyContent}>
                    <Ionicons name="rocket-outline" size={48} color={secondaryTextColor} />
                    <ThemedText style={styles.emptyTitle}>Sin programas disponibles</ThemedText>
                    <ThemedText style={styles.emptyMessage}>
                      Los programas estarán disponibles próximamente
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.programsList}>
                    {programs.map((program) => (
                      <TouchableOpacity
                        key={program.id}
                        style={[styles.programCard, { backgroundColor: cardBackground }]}
                        onPress={() => handleProgramPress(program)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.programHeader}>
                          <View style={[styles.programTypeIcon, { backgroundColor: `${iconColor}15` }]}>
                            <Ionicons name="rocket" size={20} color={iconColor} />
                          </View>
                          <View style={styles.programHeaderInfo}>
                            <ThemedText style={styles.programName}>{program.name}</ThemedText>
                            <View style={[styles.programTypeBadge, { backgroundColor: `${iconColor}15` }]}>
                              <ThemedText style={[styles.programTypeText, { color: iconColor }]}>
                                {program.type}
                              </ThemedText>
                            </View>
                          </View>
                        </View>
                        
                        <ThemedText style={styles.programDescription} numberOfLines={2}>
                          {program.description}
                        </ThemedText>
                        
                        <View style={styles.programMeta}>
                          <View style={styles.programMetaItem}>
                            <Ionicons name="business" size={14} color={secondaryTextColor} />
                            <ThemedText style={styles.programMetaText}>{program.organizer}</ThemedText>
                          </View>
                          <View style={styles.programMetaItem}>
                            <Ionicons name="time" size={14} color={secondaryTextColor} />
                            <ThemedText style={styles.programMetaText}>{program.duration}</ThemedText>
                          </View>
                          <View style={styles.programMetaItem}>
                            <Ionicons name="calendar" size={14} color={secondaryTextColor} />
                            <ThemedText style={styles.programMetaText}>Hasta: {program.deadline}</ThemedText>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Bottom CTA Section */}
          <LinearGradient
            colors={['#10B981', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaSection}
          >
            <View style={styles.ctaContent}>
              <View style={styles.ctaIcons}>
                <Ionicons name="people" size={24} color="white" style={styles.ctaIcon} />
                <Ionicons name="trending-up" size={22} color="white" style={styles.ctaIcon} />
              </View>
              
              <ThemedText type="subtitle" style={styles.ctaTitle}>
                📚 Recursos Exclusivos Disponibles
              </ThemedText>
              
              <ThemedText style={styles.ctaSubtitle}>
                Accede a plantillas, guías, videos y herramientas profesionales para hacer crecer tu emprendimiento
              </ThemedText>
              
              <ThemedButton
                title="📖 Ver Todos los Recursos"
                onPress={handleExploreResources}
                type="primary"
                style={styles.ctaCTA}
              />
            </View>
          </LinearGradient>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  wrapper: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIcons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  heroIcon: {
    opacity: 0.8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    opacity: 0.9,
  },
  heroCTA: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  featuresGrid: {
    gap: 16,
  },
  tabbedSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  tabbedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tabNavigation: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    minHeight: 200,
  },
  loadingContent: {
    gap: 16,
  },
  skeletonCard: {
    height: 120,
    borderRadius: 12,
  },
  errorContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 18,
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
  emptyContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
  programsList: {
    gap: 16,
  },
  programCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  programHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  programTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  programHeaderInfo: {
    flex: 1,
  },
  programName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  programTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  programTypeText: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  programDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    marginBottom: 12,
  },
  programMeta: {
    gap: 8,
  },
  programMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programMetaText: {
    fontSize: 12,
    marginLeft: 6,
    opacity: 0.7,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resourcesList: {
    gap: 12,
  },
  ctaSection: {
    marginHorizontal: 20,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaIcons: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  ctaIcon: {
    opacity: 0.9,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
  },
  ctaSubtitle: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.95,
  },
  ctaCTA: {
    backgroundColor: 'black',
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSpacing: {
    height: 40,
  },
}); 