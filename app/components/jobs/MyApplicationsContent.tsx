import { FormField } from '@/app/components/FormField';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useApplications } from '@/app/hooks/useApplications';
import { JobApplication, JobsMetric, mapApplicationStatusToSpanish } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import { FormikProps, useFormik } from 'formik';
import React, { useState, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { ThemedButton } from '../ThemedButton';
import { ApplicationCard } from './ApplicationCard';
import { useRouter } from 'expo-router';
import Shimmer from '../Shimmer';

interface MyApplicationsContentProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

interface MetricCardProps {
  metric: JobsMetric;
  onPress?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, onPress }) => {
  const backgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  return (
    <TouchableOpacity
      style={[styles.metricCard, { backgroundColor, borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={metric.icon as any} size={20} color={iconColor} />
      </View>
      <ThemedText type="defaultSemiBold" style={[styles.metricValue, { color: textColor }]}>
        {metric.value}
      </ThemedText>
      <ThemedText style={[styles.metricTitle, { color: secondaryTextColor }]} numberOfLines={2}>
        {metric.title}
      </ThemedText>
    </TouchableOpacity>
  );
};

export const MyApplicationsContent: React.FC<MyApplicationsContentProps> = ({
  isRefreshing,
  onRefresh
}) => {
  const router = useRouter();
  const [filterBy, setFilterBy] = useState('Todos los estados');
  const [companyFilter, setCompanyFilter] = useState('Filtrar por empresa...');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');
  const cardBackgroundColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const { applications, loading, error, refreshApplications, withdrawApplication } = useApplications();

  // Search form
  const searchForm = useFormik({
    initialValues: { search: '' },
    onSubmit: (values) => {
      // TODO: Implement search filtering
      console.log('Search:', values.search);
    },
  });

  // Handle external refresh
  useEffect(() => {
    if (isRefreshing) {
      refreshApplications().finally(() => {
        onRefresh();
      });
    }
  }, [isRefreshing]);

  // Calculate metrics from real applications data
  const calculateMetrics = (): JobsMetric[] => {
    const total = applications.length;
    const sent = applications.filter(app => mapApplicationStatusToSpanish(app.status) === 'Enviada').length;
    const review = applications.filter(app => mapApplicationStatusToSpanish(app.status) === 'En revisión').length;
    const preselected = applications.filter(app => mapApplicationStatusToSpanish(app.status) === 'Preseleccionado').length;
    const rejected = applications.filter(app => mapApplicationStatusToSpanish(app.status) === 'Rechazada').length;
    const interview = applications.filter(app => mapApplicationStatusToSpanish(app.status) === 'Entrevista programada').length;
    const offer = applications.filter(app => mapApplicationStatusToSpanish(app.status) === 'Oferta recibida').length;

    return [
      {
        id: 'total',
        title: 'Total',
        value: total,
        icon: 'briefcase-outline',
      },
      {
        id: 'sent',
        title: 'Enviadas',
        value: sent,
        icon: 'send-outline',
      },
      {
        id: 'review',
        title: 'En revisión',
        value: review,
        icon: 'time-outline',
      },
      {
        id: 'preselected',
        title: 'Preseleccionado',
        value: preselected,
        icon: 'checkmark-circle-outline',
      },
      {
        id: 'rejected',
        title: 'Rechazadas',
        value: rejected,
        icon: 'close-circle-outline',
      },
      {
        id: 'interview',
        title: 'Entrevista programada',
        value: interview,
        icon: 'calendar-outline',
      },
      {
        id: 'offer',
        title: 'Oferta recibida',
        value: offer,
        icon: 'gift-outline',
      },
    ];
  };

  const metrics = calculateMetrics();

  // Application Card Skeleton Component
  const ApplicationCardSkeleton = () => (
    <Shimmer>
      <View style={[styles.applicationCardSkeleton, { backgroundColor: cardBackgroundColor, borderColor }]}>
        {/* Header skeleton */}
        <View style={styles.skeletonHeader}>
          <View style={[styles.skeletonJobIcon, { backgroundColor: iconColor + '20' }]} />
          <View style={styles.skeletonJobInfo}>
            <View style={[styles.skeletonJobTitle, { backgroundColor: secondaryTextColor + '30' }]} />
            <View style={[styles.skeletonCompanyName, { backgroundColor: secondaryTextColor + '30' }]} />
            <View style={[styles.skeletonLocation, { backgroundColor: secondaryTextColor + '30' }]} />
          </View>
          <View style={[styles.skeletonStatus, { backgroundColor: secondaryTextColor + '30' }]} />
        </View>
        
        {/* Meta info skeleton */}
        <View style={styles.skeletonMeta}>
          <View style={[styles.skeletonDate, { backgroundColor: secondaryTextColor + '30' }]} />
          <View style={[styles.skeletonSalary, { backgroundColor: secondaryTextColor + '30' }]} />
        </View>
        
        {/* Actions skeleton */}
        <View style={styles.skeletonActions}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={[styles.skeletonAction, { backgroundColor: secondaryTextColor + '30' }]} />
          ))}
        </View>
      </View>
    </Shimmer>
  );

  const handleWithdrawApplication = async (applicationId: string) => {
    Alert.alert(
      'Retirar aplicación',
      '¿Estás seguro que deseas retirar esta aplicación? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Retirar', 
          style: 'destructive',
          onPress: async () => {
            const success = await withdrawApplication(applicationId);
            if (success) {
              Alert.alert('Éxito', 'Aplicación retirada exitosamente');
            } else {
              Alert.alert('Error', 'No se pudo retirar la aplicación. Intenta nuevamente.');
            }
          }
        },
      ]
    );
  };

  if (error) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF453A" />
          <ThemedText style={[styles.errorTitle, { color: textColor }]}>
            Error al cargar aplicaciones
          </ThemedText>
          <ThemedText style={[styles.errorDescription, { color: secondaryTextColor }]}>
            {error.message}
          </ThemedText>
          <ThemedButton
            title="Reintentar"
            onPress={refreshApplications}
            type="primary"
            style={styles.retryButton}
          />
        </View>
      </ThemedView>
    );
  }

  const statusOptions = [
    'Todos los estados',
    'Enviada',
    'En revisión',
    'Preseleccionado',
    'Rechazada',
    'Entrevista programada',
    'Oferta recibida',
  ];

  const companies = ['Filtrar por empresa...', 'TechCorp Bolivia', 'Zenith Health', 'Mindful Co.', 'Premium Services'];

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing || loading}
            onRefresh={onRefresh}
            tintColor={iconColor}
            colors={[iconColor]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={[styles.title, { color: textColor }]}>
            Mis Aplicaciones
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: secondaryTextColor }]}>
            Gestiona y da seguimiento a tus postulaciones laborales
          </ThemedText>
        </View>

        {/* Metrics Horizontal Scroll */}
        <View style={styles.metricsSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.metricsContainer}
          >
            {metrics.map((metric, index) => (
              <View 
                key={metric.id} 
                style={[
                  styles.metricWrapper,
                  index === metrics.length - 1 && styles.lastMetric
                ]}
              >
                <MetricCard
                  metric={metric}
                  onPress={() => console.log('Metric pressed:', metric.id)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <FormField
              label=""
              placeholder="Buscar por trabajo o empresa..."
              formikKey="search"
              formikProps={searchForm as FormikProps<any>}
              leftIcon={<Ionicons name="search-outline" size={20} color={secondaryTextColor} />}
              style={styles.searchInput}
            />
          </View>
          
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={[styles.filterDropdown, { borderColor: iconColor + '40', flex: 1 }]}
            >
              <ThemedText style={[styles.filterText, { color: textColor }]}>
                {filterBy}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={secondaryTextColor} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.filterDropdown, { borderColor: iconColor + '40', flex: 1, marginLeft: 12 }]}
            >
              <ThemedText style={[styles.filterText, { color: textColor }]}>
                {companyFilter}
              </ThemedText>
              <Ionicons name="chevron-down" size={16} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Applications List */}
        <View style={styles.applicationsSection}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            {loading ? "Cargando aplicaciones..." : `${applications.length} aplicaciones`}
          </ThemedText>

          {loading ? (
            // Show skeleton application cards while loading
            <>            
              {[1, 2, 3, 4, 5].map((index) => (
                <ApplicationCardSkeleton key={`skeleton-${index}`} />
              ))}
            </>
          ) : applications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name="briefcase-outline" size={48} color={iconColor} />
              </View>
              <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
                No tienes aplicaciones aún
              </ThemedText>
              <ThemedText style={[styles.emptyDescription, { color: secondaryTextColor }]}>
                Cuando apliques a empleos, aparecerán aquí para que puedas dar seguimiento.
              </ThemedText>
            </View>
          ) : (
            applications.map((application) => (
              <ApplicationCard
                key={application.id}
                application={application}
                onPress={() => console.log('Application pressed:', application.id)}
                onViewJob={() => router.push(`/jobs/job-detail?id=${application.jobId}`)}
                onViewCV={() => console.log('View CV:', application.id)}
                onWithdraw={() => handleWithdrawApplication(application.id)}
                onViewDetails={() => console.log('View interview details:', application.id)}
                onRespond={() => console.log('Respond to offer:', application.id)}
                onChat={() => router.push(`/jobs/chat?applicationId=${application.id}&jobTitle=${encodeURIComponent(application.jobTitle)}&company=${encodeURIComponent(application.company)}` as any)}
              />
            ))
          )}
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  metricsSection: {
    marginBottom: 20,
  },
  metricsContainer: {
    paddingHorizontal: 0,
  },
  metricWrapper: {
    marginRight: 12,
  },
  lastMetric: {
    marginRight: 0,
  },
  metricCard: {
    width: 120,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  applicationsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  bottomSpacing: {
    height: 40,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    minWidth: 120,
  },
  // Application Card Skeleton Styles
  applicationCardSkeleton: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  skeletonJobIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  skeletonJobInfo: {
    flex: 1,
    gap: 6,
  },
  skeletonJobTitle: {
    height: 18,
    width: '70%',
    borderRadius: 4,
  },
  skeletonCompanyName: {
    height: 14,
    width: '50%',
    borderRadius: 4,
  },
  skeletonLocation: {
    height: 12,
    width: '60%',
    borderRadius: 4,
  },
  skeletonStatus: {
    height: 24,
    width: 80,
    borderRadius: 12,
  },
  skeletonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  skeletonDate: {
    height: 12,
    width: '30%',
    borderRadius: 4,
  },
  skeletonSalary: {
    height: 12,
    width: '25%',
    borderRadius: 4,
  },
  skeletonActions: {
    flexDirection: 'row',
    gap: 8,
  },
  skeletonAction: {
    height: 32,
    flex: 1,
    borderRadius: 6,
  },
}); 