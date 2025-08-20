import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader';
import { MetricCard } from '@/app/components/dashboard/MetricCard';
import { QuickAccessCard } from '@/app/components/dashboard/QuickAccessCard';
import { MobileNewsCarousel } from '@/app/components/news/MobileNewsCarousel';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import { useAuthStore } from '@/app/store/authStore';
import { DashboardMetric, QuickAccessCard as QuickAccessCardType, UserDashboardData } from '@/app/types/dashboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user, isAuthenticated } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);

  // If not authenticated, ensure redirect happens (handled by _layout.tsx)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/(public)/login');
    }
  }, [isAuthenticated, user, router]);

  // Mock data generation based on user profile
  const generateDashboardData = useCallback((): UserDashboardData => {
    const firstName = profile?.first_name || 'Usuario';
    
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
        id: 'courses',
        title: 'Cursos en Progreso',
        value: 2,
        icon: 'school-outline',
        trend: 'stable',
        trendValue: '0'
      },
      {
        id: 'projects',
        title: 'Proyecto Emprendimiento',
        value: 1,
        icon: 'bulb-outline',
        trend: 'up',
        trendValue: '+1'
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
      welcomeMessage: `¡Bienvenido ${firstName}!`,
      subtitle: 'Explora oportunidades de empleo, desarrolla tus habilidades y construye tu futuro profesional',
      metrics,
      quickAccessCards
    };
  }, [profile, router]);

  // Initialize dashboard data
  useEffect(() => {
    if (profile) {
      setDashboardData(generateDashboardData());
    }
  }, [profile, generateDashboardData]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Regenerate data (in real app, fetch from API)
    setDashboardData(generateDashboardData());
    
    setIsRefreshing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [generateDashboardData]);

  if (!dashboardData) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Cargando dashboard...</ThemedText>
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

          {/* News Carousel */}
          <View style={styles.newsSection}>
            <MobileNewsCarousel
              title="Noticias Destacadas"
              subtitle="Mantente informado sobre las últimas oportunidades y anuncios importantes"
              maxItems={6}
              enableNavigation={true}
            />
          </View>

          {/* Quick Access Cards */}
          <View style={styles.quickAccessSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Acceso Rápido
            </ThemedText>
            {dashboardData.quickAccessCards.map((card) => (
              <QuickAccessCard
                key={card.id}
                card={card}
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
    marginHorizontal: -6,
  },
  newsSection: {
    marginBottom: 30,
    marginHorizontal: -20, // Compensate for container padding to allow full-width carousel
  },
  quickAccessSection: {
    marginBottom: 20,
  },
}); 