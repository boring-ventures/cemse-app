import { useState, useCallback } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';
import { JobApplication } from '@/app/types/jobs';

interface ApplicationStatusResult {
  hasApplied: boolean;
  application?: JobApplication;
}

interface UseApplicationStatusReturn {
  applicationStatus: {
    hasApplied: boolean;
    application?: JobApplication;
    loading: boolean;
  };
  checkApplicationStatus: (jobId: string) => Promise<ApplicationStatusResult>;
  cancelApplication: (applicationId: string) => Promise<boolean>;
  refreshStatus: (jobId: string) => Promise<void>;
}

export function useApplicationStatus(): UseApplicationStatusReturn {
  const { tokens } = useAuthStore();
  const [applicationStatus, setApplicationStatus] = useState<{
    hasApplied: boolean;
    application?: JobApplication;
    loading: boolean;
  }>({ hasApplied: false, loading: false });

  const checkApplicationStatus = useCallback(async (jobId: string): Promise<ApplicationStatusResult> => {
    if (!tokens?.token || !jobId) {
      return { hasApplied: false };
    }

    setApplicationStatus(prev => ({ ...prev, loading: true }));

    try {
      // Get all user applications and check if any match the job ID
      const response = await apiService.getMyApplications(tokens.token);

      if (response.success && response.data) {
        let applicationsArray: any[] = [];
        
        if (Array.isArray(response.data)) {
          applicationsArray = response.data;
        } else if (response.data && Array.isArray(response.data.items)) {
          applicationsArray = response.data.items;
        }

        // Find application for this specific job
        const application = applicationsArray.find(app => 
          app.jobOffer?.id === jobId || app.jobId === jobId
        );

        const result: ApplicationStatusResult = {
          hasApplied: !!application,
          application: application ? {
            ...application,
            jobId: application.jobOffer?.id || application.jobId,
            jobTitle: application.jobOffer?.title || application.jobTitle,
            company: application.jobOffer?.company?.name || application.company,
            applicationDate: new Date(application.appliedAt).toLocaleDateString('es-ES'),
            lastUpdate: application.reviewedAt ? 
              new Date(application.reviewedAt).toLocaleDateString('es-ES') : 
              new Date(application.appliedAt).toLocaleDateString('es-ES'),
            cvAttached: Boolean(application.cvFile),
          } : undefined
        };

        setApplicationStatus({
          hasApplied: result.hasApplied,
          application: result.application,
          loading: false
        });

        return result;
      } else {
        throw new Error(response.error?.message || 'Failed to check application status');
      }
    } catch (error) {
      console.error('Error checking application status:', error);
      setApplicationStatus({ hasApplied: false, loading: false });
      return { hasApplied: false };
    }
  }, [tokens?.token]);

  const cancelApplication = useCallback(async (applicationId: string): Promise<boolean> => {
    if (!tokens?.token || !applicationId) {
      return false;
    }

    try {
      const response = await apiService.withdrawApplication(tokens.token, applicationId);

      if (response.success) {
        // Update local state to reflect cancellation
        setApplicationStatus({
          hasApplied: false,
          application: undefined,
          loading: false
        });
        return true;
      } else {
        throw new Error(response.error?.message || 'Failed to cancel application');
      }
    } catch (error) {
      console.error('Error canceling application:', error);
      return false;
    }
  }, [tokens?.token]);

  const refreshStatus = useCallback(async (jobId: string): Promise<void> => {
    await checkApplicationStatus(jobId);
  }, [checkApplicationStatus]);

  return {
    applicationStatus,
    checkApplicationStatus,
    cancelApplication,
    refreshStatus,
  };
}