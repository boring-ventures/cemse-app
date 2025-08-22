import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader';
import { MetricCard } from '@/app/components/dashboard/MetricCard';
import { QuickAccessCard } from '@/app/components/dashboard/QuickAccessCard';
import { NewsCard, NewsItem } from '@/app/components/dashboard/NewsCard';
import { CVBuilderShortcut } from '@/app/components/dashboard/CVBuilderShortcut';
import { 
  DashboardHeaderSkeleton, 
  MetricCardSkeleton, 
  QuickAccessCardSkeleton,
  NewsCardSkeleton,
  CVBuilderShortcutSkeleton
} from '@/app/components/dashboard/DashboardSkeleton';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useAuthStore } from '@/app/store/authStore';
import { DashboardMetric, QuickAccessCard as QuickAccessCardType, UserDashboardData } from '@/app/types/dashboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, Alert } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [cvProgress, setCvProgress] = useState({ completionPercentage: 0, hasCV: false });

  // If not authenticated, ensure redirect happens (handled by _layout.tsx)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/(public)/login');
    }
  }, [isAuthenticated, user, router]);

  // Generate mock news data
  const generateNewsData = useCallback((): NewsItem[] => {
    return [
      {
        id: '1',
        type: 'business',
        title: 'Nueva plataforma de empleos para jóvenes profesionales en Chile',
        summary: 'Gobierno lanza iniciativa para conectar empresas con talentos emergentes',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        priority: 'high',
      },
      {
        id: '2',
        type: 'institutional',
        title: 'Programa de capacitación en habilidades digitales disponible',
        summary: 'Certificaciones gratuitas en programación y diseño UX/UI para jóvenes',
        date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        priority: 'medium',
      },
      {
        id: '3',
        type: 'business',
        title: 'Empresas tech incrementan contratación de desarrolladores junior',
        summary: 'Sector tecnológico muestra crecimiento del 40% en ofertas laborales',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        priority: 'medium',
      },
    ];
  }, []);

  // Mock data generation based on user data
  const generateDashboardData = useCallback((): UserDashboardData => {
    const username = user?.username || 'Usuario';
    
    const metrics: DashboardMetric[] = [
      {
        id: 'applications',
        title: 'Postulaciones Activas',
        value: 3,
        icon: 'document-text-outline',
        trend: 'up',
        trendValue: '+2'
      },
      {
        id: 'response_rate',
        title: 'Tasa de Respuesta',
        value: '53%',
        icon: 'trending-up-outline',
        trend: 'up',
        trendValue: '+8%'
      }
    ];

    const quickAccessCards: QuickAccessCardType[] = [
      {
        id: 'jobs',
        title: 'Búsqueda de Empleo',
        description: 'Encuentra oportunidades laborales que se ajusten a tu perfil',
        icon: 'briefcase-outline',
        metrics: ['156 Ofertas Activas', '3 Postulaciones', '1 Entrevistas'],
        route: '/(private)/jobs',
        actions: [
          {
            id: 'explore_jobs',
            title: 'Explorar Ofertas',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(private)/jobs');
            },
            variant: 'primary'
          },
          {
            id: 'my_applications',
            title: 'Mis Postulaciones',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(private)/jobs');
            }
          },
          {
            id: 'create_alert',
            title: 'Crear Alerta',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(private)/jobs');
            }
          }
        ]
      },
      {
        id: 'training',
        title: 'Capacitación y Recursos Formativos',
        description: 'Desarrolla nuevas habilidades y obtén certificaciones',
        icon: 'school-outline',
        metrics: ['45 Cursos Disponibles', '2 En Progreso', '8 Completados'],
        route: '/(private)/training',
        actions: [
          {
            id: 'view_courses',
            title: 'Ver Cursos',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(private)/training');
            },
            variant: 'primary'
          },
          {
            id: 'my_courses',
            title: 'Mis Cursos',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(private)/training');
            }
          },
          {
            id: 'certificates',
            title: 'Certificados',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(private)/training');
            }
          }
        ]
      },
      {
        id: 'entrepreneurship',
        title: 'Emprendimiento',
        description: 'Convierte tus ideas en negocios exitosos',
        icon: 'bulb-outline',
        metrics: ['28 Recursos', '12 Mentorías', '1 Mi Proyecto'],
        route: '/(private)/entrepreneurship',
        actions: [
          {
            id: 'business_ideas',
            title: 'Ideas de Negocio',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(private)/entrepreneurship');
            },
            variant: 'primary'
          },
          {
            id: 'find_mentor',
            title: 'Buscar Mentor',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(private)/entrepreneurship');
            }
          },
          {
            id: 'my_project',
            title: 'Mi Proyecto',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(private)/entrepreneurship');
            }
          }
        ]
      },
      {
        id: 'reports',
        title: 'Reportes Personales',
        description: 'Analiza tu progreso y rendimiento laboral',
        icon: 'analytics-outline',
        metrics: ['15 Postulaciones', '8 Respuestas', '53% Tasa Éxito'],
        route: '/(private)/profile',
        actions: [
          {
            id: 'view_reports',
            title: 'Ver Reportes',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(private)/profile');
            },
            variant: 'primary'
          },
          {
            id: 'cv_analysis',
            title: 'Análisis CV',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(private)/profile');
            }
          },
          {
            id: 'progress',
            title: 'Progreso',
            action: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(private)/profile');
            }
          }
        ]
      }
    ];

    return {
      welcomeMessage: `¡Hola ${username}!`,
      subtitle: 'Explora oportunidades de empleo, desarrolla tus habilidades y construye tu futuro profesional',
      metrics,
      quickAccessCards
    };
  }, [user, router]);

  // Initialize dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      if (user) {
        setDashboardData(generateDashboardData());
        setNewsData(generateNewsData());
        
        // Mock CV progress - in real app, this would come from API
        setCvProgress({
          completionPercentage: Math.floor(Math.random() * 80) + 20, // Random between 20-100
          hasCV: Math.random() > 0.3, // 70% chance of having a CV
        });
      }
      
      setIsLoading(false);
    };
    
    if (user) {
      loadDashboardData();
    }
  }, [user, generateDashboardData, generateNewsData]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Regenerate data (in real app, fetch from API)
    if (user) {
      setDashboardData(generateDashboardData());
      setNewsData(generateNewsData());
      
      // Update CV progress
      setCvProgress({
        completionPercentage: Math.floor(Math.random() * 80) + 20,
        hasCV: Math.random() > 0.3,
      });
    }
    
    setIsRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [user, generateDashboardData, generateNewsData]);

  // Handle news item press
  const handleNewsPress = useCallback((news: NewsItem) => {
    Alert.alert(
      news.title,
      news.summary,
      [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Leer más', onPress: () => {
          // In real app, navigate to news detail or open URL
          console.log('Open news:', news.url || news.id);
        }},
      ]
    );
  }, []);

  // Loading state with skeletons
  if (isLoading || !dashboardData) {
    return (
      <ThemedView style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <DashboardHeaderSkeleton />
          
          <View style={styles.content}>
            {/* Metrics Skeleton */}
            <View style={styles.metricsSection}>
              <View style={[styles.sectionTitleSkeleton, { backgroundColor: '#E0E0E0' }]} />
              <View style={styles.metricsGrid}>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </View>
            </View>

            {/* CV Builder Shortcut Skeleton */}
            <View style={styles.cvBuilderSection}>
              <CVBuilderShortcutSkeleton />
            </View>

            {/* News Skeleton */}
            <View style={styles.newsSection}>
              <View style={[styles.sectionTitleSkeleton, { backgroundColor: '#E0E0E0' }]} />
              <NewsCardSkeleton />
              <NewsCardSkeleton />
            </View>

          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#667eea"
            colors={['#667eea']}
          />
        }
      >
        {/* Dashboard Header with gradient */}
        <DashboardHeader 
          welcomeMessage={dashboardData.welcomeMessage}
          subtitle={dashboardData.subtitle}
        />

        <View style={styles.content}>
          {/* Metrics Grid */}
          <View style={styles.metricsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Panel de Control
            </ThemedText>
            <View style={styles.metricsGrid}>
              {dashboardData.metrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Navigate to specific metric detail if needed
                  }}
                />
              ))}
            </View>
          </View>

          {/* CV Builder Shortcut */}
          <View style={styles.cvBuilderSection}>
            <CVBuilderShortcut
              completionPercentage={cvProgress.completionPercentage}
              hasCV={cvProgress.hasCV}
            />
          </View>

          {/* News Section */}
          <View style={styles.newsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Noticias
            </ThemedText>
            {newsData.slice(0, 2).map((news) => (
              <NewsCard
                key={news.id}
                news={news}
                onPress={handleNewsPress}
              />
            ))}
          </View>

        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  metricsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8,
  },
  quickAccessSection: {
    marginBottom: 20,
  },
  cvBuilderSection: {
    marginBottom: 30,
  },
  newsSection: {
    marginBottom: 30,
  },
  sectionTitleSkeleton: {
    width: 150,
    height: 20,
    borderRadius: 10,
    marginBottom: 16,
    marginHorizontal: 20,
  },
}); 