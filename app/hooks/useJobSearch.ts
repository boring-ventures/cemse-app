import { useState, useCallback } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';
import { JobOffer, JobSearchFilters, JobOfferResponse } from '@/app/types/jobs';

interface UseJobSearchReturn {
  jobs: JobOffer[];
  loading: boolean;
  error: Error | null;
  searchJobs: (filters?: JobSearchFilters) => Promise<void>;
  refreshJobs: () => Promise<void>;
  clearJobs: () => void;
}

export function useJobSearch(): UseJobSearchReturn {
  const { user, tokens } = useAuthStore();
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cachedResults, setCachedResults] = useState<{ [key: string]: JobOffer[] }>({});

  const transformJobData = (apiJob: JobOfferResponse): JobOffer => {
    return {
      ...apiJob,
      // Transform API data to UI format
      companyData: apiJob.company,
      company: typeof apiJob.company === 'string' ? apiJob.company : apiJob.company?.name || 'Sin especificar',
      companyRating: apiJob.company?.rating || 4.0,
      workMode: apiJob.workModality === 'ON_SITE' ? 'Presencial' : 
                apiJob.workModality === 'REMOTE' ? 'Remoto' : 'Híbrido',
      skills: [...apiJob.skillsRequired, ...apiJob.desiredSkills],
      jobType: apiJob.contractType === 'FULL_TIME' ? 'Tiempo completo' :
               apiJob.contractType === 'PART_TIME' ? 'Medio tiempo' : 'Prácticas',
      currency: apiJob.salaryCurrency || 'Bs.',
      publishedDate: new Date(apiJob.publishedAt).toLocaleDateString('es-ES'),
      applicantCount: apiJob.applicationsCount,
      viewCount: apiJob.viewsCount,
      isFeatured: apiJob.featured,
      isFavorite: false, // TODO: Implement favorites
      companySize: apiJob.company?.size,
      industry: apiJob.company?.sector,
      companyDescription: apiJob.company?.description,
      responsibilities: apiJob.requirements,
      benefits: apiJob.benefits,
      createdAt: apiJob.createdAt || new Date().toISOString(),
      updatedAt: apiJob.updatedAt || new Date().toISOString(),
    };
  };

  const searchJobs = useCallback(async (filters?: JobSearchFilters) => {
    if (!tokens?.token) {
      setError(new Error('No authentication token'));
      return;
    }

    const searchKey = JSON.stringify(filters || {});
    
    if (cachedResults[searchKey]) {
      setJobs(cachedResults[searchKey]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiFilters = filters ? {
        search: filters.query,
        location: filters.location,
        contractType: filters.contractType,
        workModality: filters.workModality,
        experienceLevel: filters.experienceLevel,
        salaryMin: filters.salaryMin,
        salaryMax: filters.salaryMax,
      } : undefined;

      const response = await apiService.getJobOffers(tokens.token, apiFilters);

      if (response.success && response.data) {
        const transformedJobs = response.data.map(transformJobData);
        setJobs(transformedJobs);
        setCachedResults(prev => ({
          ...prev,
          [searchKey]: transformedJobs
        }));
      } else {
        throw new Error(response.error?.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      console.error('Error searching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [tokens?.token, cachedResults]);

  const refreshJobs = useCallback(async () => {
    setCachedResults({});
    await searchJobs();
  }, [searchJobs]);

  const clearJobs = useCallback(() => {
    setJobs([]);
    setError(null);
    setCachedResults({});
  }, []);

  return {
    jobs,
    loading,
    error,
    searchJobs,
    refreshJobs,
    clearJobs,
  };
}