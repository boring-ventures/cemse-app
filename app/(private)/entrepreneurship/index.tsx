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
      color: '#007AFF',
      isAvailable: true,
    },
    {
      id: '2',
      title: 'Centro de Recursos',
      description: 'Plantillas, guías y herramientas',
      icon: 'library-outline',
      route: '/entrepreneurship/resource-center',
      color: '#32D74B',
      isAvailable: false,
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
      type: 'Planificación',
      title: 'Plantilla de Plan de Negocios',
      description: 'Plantilla completa en Word para crear tu plan de negocios paso a paso',
      rating: 4.8,
      downloads: 2847,
      category: 'plantillas',
      fileType: 'document',
      author: 'CEMSE Bolivia',
      tags: ['plan de negocios', 'plantilla', 'planificación'],
    },
    {
      id: '2',
      type: 'Validación',
      title: 'Cómo Validar tu Idea de Negocio',
      description: 'Guía práctica para validar tu idea antes de invertir tiempo y dinero',
      rating: 4.6,
      downloads: 1923,
      category: 'guías',
      fileType: 'guide',
      author: 'Dr. María Rodríguez',
      tags: ['validación', 'idea de negocio', 'investigación'],
    },
    {
      id: '3',
      type: 'Finanzas',
      title: 'Finanzas para Emprendedores',
      description: 'Video curso sobre gestión financiera básica para startups',
      rating: 4.9,
      downloads: 3456,
      category: 'cursos',
      fileType: 'video',
      duration: '2h 30m',
      author: 'Carlos Mendoza',
      tags: ['finanzas', 'startups', 'gestión financiera'],
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
    // For now, we'll just show a placeholder message
    console.log('Explore resources - Coming soon');
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
                Convierte tu Idea en Realidad
              </ThemedText>
              
              <ThemedText style={styles.heroSubtitle}>
                Accede a herramientas, recursos y mentorías para lanzar tu emprendimiento exitoso en Bolivia
              </ThemedText>
              
              <ThemedButton
                title="Crear Plan de Negocios"
                onPress={handleCreateBusinessPlan}
                type="primary"
                style={styles.heroCTA}
                textStyle={styles.heroCTAText}
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
              
              <TouchableOpacity style={styles.viewAllButton}>
                <ThemedText style={[styles.viewAllText, { color: iconColor }]}>
                  Ver todos
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
                ¿Listo para Emprender?
              </ThemedText>
              
              <ThemedText style={styles.ctaSubtitle}>
                Accede a recursos exclusivos y conecta con la comunidad emprendedora
              </ThemedText>
              
              <ThemedButton
                title="Explorar Recursos"
                onPress={handleExploreResources}
                type="outline"
                style={styles.ctaButton}
                textStyle={styles.ctaButtonText}
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
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  heroCTAText: {
    color: '#6B46C1',
    fontWeight: '600',
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
    fontSize: 16,
    lineHeight: 22,
  },
  featuresGrid: {
    marginTop: 16,
  },
  resourcesSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  resourcesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resourcesList: {
    gap: 0,
  },
  ctaSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginBottom: 24,
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
    opacity: 0.8,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: 'transparent',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  ctaButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
}); 