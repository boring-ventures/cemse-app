import { DashboardHeader } from '@/app/components/dashboard/DashboardHeader';
import { MetricCard } from '@/app/components/dashboard/MetricCard';
import { ThemedText } from '@/app/components/ThemedText';
import { ThemedView } from '@/app/components/ThemedView';
import Shimmer from '@/app/components/Shimmer';
import { useAuthStore } from '@/app/store/authStore';
import { DashboardMetric, UserDashboardData } from '@/app/types/dashboard';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, TouchableOpacity, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { profile, user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // If not authenticated, ensure redirect happens (handled by _layout.tsx)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace('/(public)/login');
    }
  }, [isAuthenticated, user, router]);

  // Enhanced mock data generation based on user profile and feature analysis
  const generateDashboardData = useCallback((): UserDashboardData => {
    const firstName = profile?.first_name || 'Usuario';
    
    // Reduced to 4 key metrics that are most important for mobile users
    const metrics: DashboardMetric[] = [
      {
        id: 'applications',
        title: 'Postulaciones Activas',
        value: 5,
        icon: 'briefcase-outline',
        trend: 'up',
        trendValue: '+3'
      },
      {
        id: 'cv_completion',
        title: 'Perfil CV Completo',
        value: '85%',
        icon: 'document-text-outline',
        trend: 'up',
        trendValue: '+15%'
      },
      {
        id: 'projects',
        title: 'Proyectos Emprendimiento',
        value: 2,
        icon: 'bulb-outline',
        trend: 'up',
        trendValue: '+1'
      },
      {
        id: 'response_rate',
        title: 'Tasa de Respuesta',
        value: '67%',
        icon: 'trending-up-outline',
        trend: 'up',
        trendValue: '+14%'
      }
    ];

    return {
      welcomeMessage: `¡Hola ${firstName}!`,
      subtitle: 'Tu plataforma integral para el desarrollo profesional y emprendedor',
      metrics,
      quickAccessCards: [] // Removed the modules section as requested
    };
  }, [profile, router]);

  // Initialize dashboard data with loading state
  useEffect(() => {
    const initializeDashboard = async () => {
      console.log('🏠 Dashboard initialization - Auth Loading:', authLoading, 'Authenticated:', isAuthenticated, 'User:', !!user);
      
      // Don't initialize if auth is still loading
      if (authLoading) {
        console.log('🏠 Dashboard waiting for auth to complete...');
        return;
      }
      
      setIsLoading(true);
      
      // Wait for auth to be ready - _layout.tsx handles redirect if not authenticated
      if (!isAuthenticated || !user) {
        console.log('🏠 Dashboard - User not authenticated, stopping initialization');
        setIsLoading(false);
        return;
      }
      
      console.log('🏠 Dashboard - Starting data generation for user:', user.firstName);
      
      // Simulate loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate dashboard data (profile is computed from user)
      const data = generateDashboardData();
      setDashboardData(data);
      setIsLoading(false);
      
      console.log('🏠 Dashboard - Data loaded successfully:', data.welcomeMessage);
    };

    initializeDashboard();
  }, [authLoading, isAuthenticated, user, generateDashboardData]);

  // Enhanced pull to refresh handler
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API calls for real data refresh
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Regenerate data with updated metrics
      setDashboardData(generateDashboardData());
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsRefreshing(false);
    }
  }, [generateDashboardData]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header skeleton */}
        <Shimmer>
          <View style={styles.headerSkeleton} />
        </Shimmer>
        
        <View style={styles.content}>
          {/* Metrics skeleton */}
          <View style={styles.metricsSection}>
            <Shimmer>
              <View style={styles.sectionTitleSkeleton} />
            </Shimmer>
            <View style={styles.metricsGrid}>
              {[1, 2, 3, 4].map((index) => (
                <Shimmer key={index}>
                  <View style={styles.metricCardSkeleton} />
                </Shimmer>
              ))}
            </View>
          </View>

          {/* Quick actions skeleton */}
          <View style={styles.quickActionsSection}>
            <Shimmer>
              <View style={styles.sectionTitleSkeleton} />
            </Shimmer>
            <View style={styles.quickActionsGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <Shimmer key={index}>
                  <View style={styles.quickActionSkeleton} />
                </Shimmer>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );

  // Show loading skeleton while initializing
  if (authLoading || isLoading || !dashboardData) {
    console.log('🏠 Dashboard showing skeleton - Auth Loading:', authLoading, 'Dashboard Loading:', isLoading, 'Has Data:', !!dashboardData);
    return <LoadingSkeleton />;
  }

  console.log('🏠 Dashboard rendering content - User:', user?.firstName, 'Dashboard Data:', dashboardData.welcomeMessage);

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
            progressBackgroundColor="#ffffff"
          />
        }
      >
        {/* Dashboard Header with gradient */}
        <DashboardHeader 
          welcomeMessage={dashboardData.welcomeMessage}
          subtitle={dashboardData.subtitle}
        />

        <View style={styles.content}>
          {/* Metrics Grid - Redesigned for mobile */}
          <View style={styles.metricsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Panel de Control
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Resumen de tu actividad y progreso
            </ThemedText>
            <View style={styles.metricsGrid}>
              {dashboardData.metrics.map((metric) => (
                <MetricCard
                  key={metric.id}
                  metric={metric}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Navigate based on metric type
                    if (metric.id === 'applications') {
                      router.push('/(private)/jobs');
                    } else if (metric.id === 'courses') {
                      router.push('/(private)/training');
                    } else if (metric.id === 'projects') {
                      router.push('/(private)/entrepreneurship');
                    } else if (metric.id === 'cv_completion') {
                      router.push('/(private)/cv');
                    } else if (metric.id === 'response_rate') {
                      router.push('/(private)/jobs');
                    }
                  }}
                />
              ))}
            </View>
          </View>

          {/* Quick Actions - The main feature */}
          <View style={styles.quickActionsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Acciones Rápidas
            </ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              Accede rápidamente a las funciones más importantes
            </ThemedText>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(private)/jobs');
                }}
              >
                <Ionicons name="search-outline" size={28} color="#667eea" />
                <ThemedText style={styles.quickActionText}>Buscar Empleos</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(private)/cv');
                }}
              >
                <Ionicons name="document-text-outline" size={28} color="#667eea" />
                <ThemedText style={styles.quickActionText}>Mi CV</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(private)/entrepreneurship');
                }}
              >
                <Ionicons name="bulb-outline" size={28} color="#667eea" />
                <ThemedText style={styles.quickActionText}>Emprendimiento</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(private)/training');
                }}
              >
                <Ionicons name="school-outline" size={28} color="#667eea" />
                <ThemedText style={styles.quickActionText}>Capacitación</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(private)/news');
                }}
              >
                <Ionicons name="newspaper-outline" size={28} color="#667eea" />
                <ThemedText style={styles.quickActionText}>Noticias</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(private)/entrepreneurship/messaging');
                }}
              >
                <Ionicons name="chatbubbles-outline" size={28} color="#667eea" />
                <ThemedText style={styles.quickActionText}>Mensajes</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(private)/entrepreneurship/directory');
                }}
              >
                <Ionicons name="business-outline" size={28} color="#667eea" />
                <ThemedText style={styles.quickActionText}>Directorio</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickActionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push('/(private)/profile');
                }}
              >
                <Ionicons name="person-outline" size={28} color="#667eea" />
                <ThemedText style={styles.quickActionText}>Mi Perfil</ThemedText>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: 24, // Increased padding for better mobile layout
    paddingTop: 24,
    paddingBottom: 40,
  },
  metricsSection: {
    marginBottom: 40, // Increased spacing between sections
  },
  sectionTitle: {
    fontSize: 20, // Larger title for mobile
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 24, // Increased margin for better spacing
    paddingHorizontal: 0,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -8, // Adjusted for better spacing
  },
  quickActionsSection: {
    marginBottom: 20,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -12, // Increased margin for better spacing
  },
  quickActionButton: {
    width: (width - 48 - 24) / 2, // Account for increased container padding and margins
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    borderRadius: 16, // Larger border radius for modern look
    padding: 20, // Increased padding for better touch targets
    marginHorizontal: 12,
    marginBottom: 20, // Increased bottom margin
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100, // Increased height for better usability
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.15)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 13, // Slightly larger text
    fontWeight: '600',
    marginTop: 12, // Increased margin from icon
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Loading skeleton styles
  headerSkeleton: {
    height: 140,
    backgroundColor: '#f0f0f0',
    marginBottom: 24,
    borderRadius: 16,
  },
  sectionTitleSkeleton: {
    height: 24,
    width: 180,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    marginBottom: 16,
  },
  metricCardSkeleton: {
    width: (width - 48 - 16) / 2, // Match metric card width
    height: 120, // Increased height to match new design
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    margin: 8,
  },
  quickActionSkeleton: {
    width: (width - 48 - 24) / 2, // Match quick action button width
    height: 100,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 20,
  },
}); 