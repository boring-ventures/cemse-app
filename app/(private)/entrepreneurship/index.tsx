import { useThemeColor } from '@/app/hooks/useThemeColor';
import { FeatureCard, Resource } from '@/app/types/entrepreneurship';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedButton } from '../../components/ThemedButton';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { EntrepreneurshipCard } from '../../components/entrepreneurship/EntrepreneurshipCard';
import { ResourceCard } from '../../components/entrepreneurship/ResourceCard';

export default function EntrepreneurshipHub() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

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
      isAvailable: false,
    },
    {
      id: '4',
      title: 'Mentorías',
      description: 'Encuentra mentores expertos',
      icon: 'school-outline',
      route: '/entrepreneurship/mentors',
      color: '#5856D6',
      isAvailable: false,
    },
  ];

  // Mock popular resources data
  const popularResources: Resource[] = [
    {
      id: '1',
      type: 'Plantilla',
      level: 'Principiante',
      title: 'Plantilla de Plan de Negocios',
      description: 'Plantilla completa en Word para crear tu plan de negocios paso a paso',
      category: 'Planificación',
      duration: '30 minutos',
      rating: 4.8,
      ratingCount: 156,
      downloads: 2847,
      fileInfo: 'DOCX • 2.5 MB',
      fileSize: '2.5 MB',
      publishDate: '2024-01-14',
      tags: ['plan de negocios', 'plantilla', 'planificación'],
      isFavorite: false,
      author: 'CEMSE Bolivia',
    },
    {
      id: '2',
      type: 'Guía',
      level: 'Intermedio',
      title: 'Cómo Validar tu Idea de Negocio',
      description: 'Guía práctica para validar tu idea antes de invertir tiempo y dinero',
      category: 'Validación',
      duration: '45 minutos',
      rating: 4.6,
      ratingCount: 98,
      downloads: 1923,
      fileInfo: 'PDF • 5.1 MB',
      fileSize: '5.1 MB',
      publishDate: '2024-01-19',
      tags: ['validación', 'idea de negocio', 'investigación'],
      isFavorite: false,
      author: 'Dr. María Rodríguez',
    },
    {
      id: '3',
      type: 'Video',
      level: 'Intermedio',
      title: 'Finanzas para Emprendedores',
      description: 'Video curso sobre gestión financiera básica para startups',
      category: 'Finanzas',
      duration: '2 horas',
      rating: 4.9,
      ratingCount: 234,
      downloads: 3456,
      fileInfo: 'MP4 • 850 MB',
      fileSize: '850 MB',
      publishDate: '2024-01-09',
      tags: ['finanzas', 'startups', 'gestión financiera'],
      isFavorite: false,
      author: 'Carlos Mendoza',
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
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

          {/* Popular Resources Section */}
          <View style={styles.resourcesSection}>
            <View style={styles.resourcesHeader}>
              <View>
                <ThemedText type="title" style={[styles.sectionTitle, { color: textColor }]}>
                  Recursos Más Populares
                </ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: secondaryTextColor }]}>
                  Descarga plantillas y guías para tu emprendimiento
                </ThemedText>
              </View>
              
              <TouchableOpacity 
                style={[styles.viewAllButton, { backgroundColor: iconColor + '15' }]}
                onPress={handleViewAllResources}
              >
                <ThemedText style={[styles.viewAllText, { color: iconColor }]}>
                  📖 Ver todos
                </ThemedText>
                <Ionicons name="chevron-forward" size={16} color={iconColor} />
              </TouchableOpacity>
            </View>

            <View style={styles.resourcesList}>
              {popularResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onPress={() => handleResourcePress(resource)}
                  onDownload={() => handleResourceDownload(resource)}
                />
              ))}
            </View>
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
  resourcesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  resourcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
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