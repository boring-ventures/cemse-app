import { FormField } from '@/app/components/FormField';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { JobApplication, JobsMetric } from '@/app/types/jobs';
import { Ionicons } from '@expo/vector-icons';
import { FormikProps, useFormik } from 'formik';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { ApplicationCard } from './ApplicationCard';

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
  const [filterBy, setFilterBy] = useState('Todos los estados');
  const [companyFilter, setCompanyFilter] = useState('Filtrar por empresa...');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'textSecondary');
  const iconColor = useThemeColor({}, 'tint');

  // Mock search form
  const searchForm = useFormik({
    initialValues: { search: '' },
    onSubmit: (values) => {
      console.log('Search:', values.search);
    },
  });

  // Mock metrics data
  const metrics: JobsMetric[] = [
    {
      id: 'total',
      title: 'Total',
      value: 4,
      icon: 'briefcase-outline',
    },
    {
      id: 'sent',
      title: 'Enviadas',
      value: 1,
      icon: 'send-outline',
    },
    {
      id: 'review',
      title: 'En revisión',
      value: 1,
      icon: 'time-outline',
    },
    {
      id: 'preselected',
      title: 'Preseleccionado',
      value: 1,
      icon: 'checkmark-circle-outline',
    },
    {
      id: 'rejected',
      title: 'Rechazadas',
      value: 1,
      icon: 'close-circle-outline',
    },
    {
      id: 'interview',
      title: 'Entrevista programada',
      value: 0,
      icon: 'calendar-outline',
    },
    {
      id: 'offer',
      title: 'Oferta recibida',
      value: 0,
      icon: 'gift-outline',
    },
  ];

  // Mock applications data
  const applications: JobApplication[] = [
    {
      id: '1',
      jobId: '1',
      jobTitle: 'Desarrollador Frontend React',
      company: 'TechCorp Bolivia',
      applicationDate: '29 jun 2025',
      lastUpdate: '29 jun 2025',
      status: 'Enviada',
      coverLetter: 'Estimados señores, me interesa mucho esta posición...',
      cvAttached: true,
    },
    {
      id: '2',
      jobId: '2',
      jobTitle: 'Asistente Contable',
      company: 'Zenith Health',
      applicationDate: '25 jun 2025',
      lastUpdate: '2 jul 2025',
      status: 'En revisión',
      rating: 4,
      coverLetter: 'Me complace postular para esta posición...',
      cvAttached: true,
    },
    {
      id: '3',
      jobId: '3',
      jobTitle: 'Asistente de Marketing',
      company: 'Mindful Co.',
      applicationDate: '20 jun 2025',
      lastUpdate: '28 jun 2025',
      status: 'Preseleccionado',
      rating: 5,
      employerNotes: 'Candidato con buen potencial creativo',
      coverLetter: 'Su oferta de trabajo me resulta muy atractiva...',
      cvAttached: true,
    },
    {
      id: '4',
      jobId: '4',
      jobTitle: 'Especialista en Ventas',
      company: 'Premium Services',
      applicationDate: '15 jun 2025',
      lastUpdate: '18 jun 2025',
      status: 'Rechazada',
      employerNotes: 'No cumple con los requisitos mínimos de experiencia',
      coverLetter: 'Me dirijo a ustedes para expresar mi interés...',
      cvAttached: true,
    },
  ];

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
            refreshing={isRefreshing}
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
            {applications.length} aplicaciones
          </ThemedText>

          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onPress={() => console.log('Application pressed:', application.id)}
              onViewJob={() => console.log('View job:', application.jobId)}
              onViewCV={() => console.log('View CV:', application.id)}
              onWithdraw={() => console.log('Withdraw application:', application.id)}
              onViewDetails={() => console.log('View interview details:', application.id)}
              onRespond={() => console.log('Respond to offer:', application.id)}
            />
          ))}
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
}); 