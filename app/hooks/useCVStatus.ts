import { useState, useCallback } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';

interface CVStatusData {
  hasCV: boolean;
  hasCoverLetter: boolean;
  cvUrl?: string;
  coverLetterUrl?: string;
  cvData?: any;
}

interface UseCVStatusReturn extends CVStatusData {
  loading: boolean;
  error: string | null;
  checkCVStatus: () => Promise<CVStatusData>;
  refreshCVStatus: () => Promise<void>;
}

export function useCVStatus(): UseCVStatusReturn {
  const { tokens } = useAuthStore();
  const [cvStatus, setCVStatus] = useState<CVStatusData>({
    hasCV: false,
    hasCoverLetter: false,
    cvUrl: '',
    coverLetterUrl: '',
    cvData: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkCVStatus = useCallback(async (): Promise<CVStatusData> => {
    if (!tokens?.token) {
      setError('No authentication token');
      return cvStatus;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getCVStatus(tokens.token);

      if (response.success && response.data) {
        const statusData: CVStatusData = {
          hasCV: response.data.hasCV,
          hasCoverLetter: response.data.hasCoverLetter,
          cvUrl: response.data.cvUrl || '',
          coverLetterUrl: response.data.coverLetterUrl || '',
          cvData: response.data.cvData,
        };

        setCVStatus(statusData);
        return statusData;
      } else {
        throw new Error(response.error?.message || 'Failed to check CV status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error checking CV status:', err);
      return cvStatus;
    } finally {
      setLoading(false);
    }
  }, [tokens?.token, cvStatus]);

  const refreshCVStatus = useCallback(async (): Promise<void> => {
    await checkCVStatus();
  }, [checkCVStatus]);

  return {
    ...cvStatus,
    loading,
    error,
    checkCVStatus,
    refreshCVStatus,
  };
}