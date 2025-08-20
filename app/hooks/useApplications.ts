import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';
import { JobApplication, ApplicationStatus, mapApplicationStatusToSpanish } from '@/app/types/jobs';

interface UseApplicationsReturn {
  applications: JobApplication[];
  loading: boolean;
  error: Error | null;
  refreshApplications: () => Promise<void>;
  withdrawApplication: (applicationId: string) => Promise<boolean>;
  filterByStatus: (status?: ApplicationStatus) => JobApplication[];
}

export function useApplications(): UseApplicationsReturn {
  const { user, tokens } = useAuthStore();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const transformApplicationData = (apiApplication: any): JobApplication => {
    return {
      ...apiApplication,
      // Transform API data to UI format
      jobId: apiApplication.jobOffer?.id || apiApplication.jobId,
      jobTitle: apiApplication.jobOffer?.title || apiApplication.jobTitle,
      company: apiApplication.jobOffer?.company?.name || apiApplication.company,
      applicationDate: new Date(apiApplication.appliedAt).toLocaleDateString('es-ES'),
      lastUpdate: apiApplication.reviewedAt ? 
        new Date(apiApplication.reviewedAt).toLocaleDateString('es-ES') : 
        new Date(apiApplication.appliedAt).toLocaleDateString('es-ES'),
      cvAttached: Boolean(apiApplication.cvFile),
      employerNotes: apiApplication.notes,
      // Map API status to UI status - keep the enum value, mapping will happen in UI
      status: apiApplication.status,
    };
  };


  const fetchApplications = useCallback(async () => {
    if (!tokens?.token) {
      setError(new Error('No authentication token'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getMyApplications(tokens.token);

      if (response.success && response.data) {
        let applicationsArray: any[] = [];
        
        if (Array.isArray(response.data)) {
          applicationsArray = response.data;
        } else if (response.data && Array.isArray(response.data.items)) {
          applicationsArray = response.data.items;
        }

        const transformedApplications = applicationsArray.map(transformApplicationData);
        setApplications(transformedApplications);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch applications');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  }, [tokens?.token]);

  const refreshApplications = useCallback(async () => {
    await fetchApplications();
  }, [fetchApplications]);

  const withdrawApplication = useCallback(async (applicationId: string): Promise<boolean> => {
    if (!tokens?.token) {
      setError(new Error('No authentication token'));
      return false;
    }

    try {
      const response = await apiService.withdrawApplication(tokens.token, applicationId);

      if (response.success) {
        // Remove the application from the local state
        setApplications(prev => prev.filter(app => app.id !== applicationId));
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to withdraw application');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Error withdrawing application:', error);
      return false;
    }
  }, [tokens?.token]);

  const filterByStatus = useCallback((status?: ApplicationStatus): JobApplication[] => {
    if (!status) return applications;
    
    return applications.filter(app => app.status === status);
  }, [applications]);

  useEffect(() => {
    if (tokens?.token) {
      fetchApplications();
    }
  }, [tokens?.token, fetchApplications]);

  return {
    applications,
    loading,
    error,
    refreshApplications,
    withdrawApplication,
    filterByStatus,
  };
}