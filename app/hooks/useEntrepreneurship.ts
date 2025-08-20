import { useState, useEffect, useCallback } from 'react';
import { entrepreneurshipApiService } from '@/app/services/entrepreneurshipApiService';
import { useAuth } from '@/app/components/AuthContext';
import {
  Entrepreneurship,
  EditFormData,
} from '@/app/types/entrepreneurship';

export interface UseEntrepreneurshipReturn {
  entrepreneurships: Entrepreneurship[];
  loading: boolean;
  error: string | null;
  fetchEntrepreneurships: () => Promise<void>;
  fetchMyEntrepreneurships: () => Promise<void>;
}

export interface UseEntrepreneurshipDetailReturn {
  entrepreneurship: Entrepreneurship | null;
  loading: boolean;
  error: string | null;
  fetchEntrepreneurship: (id: string) => Promise<void>;
  updateEntrepreneurship: (id: string, data: Partial<EditFormData>) => Promise<boolean>;
  deleteEntrepreneurship: (id: string) => Promise<boolean>;
}

export interface UseCreateEntrepreneurshipReturn {
  loading: boolean;
  error: string | null;
  createEntrepreneurship: (data: Omit<EditFormData, 'id'>) => Promise<Entrepreneurship | null>;
}

/**
 * Hook for managing all entrepreneurships (public listing)
 */
export function useEntrepreneurships(): UseEntrepreneurshipReturn {
  const [entrepreneurships, setEntrepreneurships] = useState<Entrepreneurship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchEntrepreneurships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (token) {
        const response = await entrepreneurshipApiService.getEntrepreneurships(token);
        if (response.success && response.data) {
          setEntrepreneurships(response.data);
        } else {
          setError(response.error?.message || 'Error fetching entrepreneurships');
        }
      } else {
        const response = await entrepreneurshipApiService.getPublicEntrepreneurships();
        if (response.success && response.data) {
          setEntrepreneurships(response.data);
        } else {
          setError(response.error?.message || 'Error fetching public entrepreneurships');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMyEntrepreneurships = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getMyEntrepreneurships(token);
      if (response.success && response.data) {
        setEntrepreneurships(response.data);
      } else {
        setError(response.error?.message || 'Error fetching my entrepreneurships');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchEntrepreneurships();
  }, [fetchEntrepreneurships]);

  return {
    entrepreneurships,
    loading,
    error,
    fetchEntrepreneurships,
    fetchMyEntrepreneurships,
  };
}

/**
 * Hook for managing a specific entrepreneurship
 */
export function useEntrepreneurship(id?: string): UseEntrepreneurshipDetailReturn {
  const [entrepreneurship, setEntrepreneurship] = useState<Entrepreneurship | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchEntrepreneurship = useCallback(async (entrepreneurshipId: string) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getEntrepreneurship(token, entrepreneurshipId);
      if (response.success && response.data) {
        setEntrepreneurship(response.data);
      } else {
        setError(response.error?.message || 'Error fetching entrepreneurship');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const updateEntrepreneurship = useCallback(async (
    entrepreneurshipId: string, 
    data: Partial<EditFormData>
  ): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.updateEntrepreneurship(token, entrepreneurshipId, data);
      if (response.success && response.data) {
        setEntrepreneurship(response.data);
        return true;
      } else {
        setError(response.error?.message || 'Error updating entrepreneurship');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  const deleteEntrepreneurship = useCallback(async (entrepreneurshipId: string): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.deleteEntrepreneurship(token, entrepreneurshipId);
      if (response.success) {
        setEntrepreneurship(null);
        return true;
      } else {
        setError(response.error?.message || 'Error deleting entrepreneurship');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  useEffect(() => {
    if (id) {
      fetchEntrepreneurship(id);
    }
  }, [id, fetchEntrepreneurship]);

  return {
    entrepreneurship,
    loading,
    error,
    fetchEntrepreneurship,
    updateEntrepreneurship,
    deleteEntrepreneurship,
  };
}

/**
 * Hook for creating new entrepreneurships
 */
export function useCreateEntrepreneurship(): UseCreateEntrepreneurshipReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const createEntrepreneurship = useCallback(async (
    data: Omit<EditFormData, 'id'>
  ): Promise<Entrepreneurship | null> => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.createEntrepreneurship(token, data);
      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error?.message || 'Error creating entrepreneurship');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    loading,
    error,
    createEntrepreneurship,
  };
}

/**
 * Hook for uploading entrepreneurship assets
 */
export function useEntrepreneurshipUploads() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const uploadLogo = useCallback(async (
    entrepreneurshipId: string,
    imageFile: File | FormData
  ): Promise<string | null> => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.uploadLogo(token, entrepreneurshipId, imageFile);
      if (response.success && response.data) {
        return response.data.logoUrl;
      } else {
        setError(response.error?.message || 'Error uploading logo');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const uploadImages = useCallback(async (
    entrepreneurshipId: string,
    imageFiles: File[] | FormData
  ): Promise<string[] | null> => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.uploadImages(token, entrepreneurshipId, imageFiles);
      if (response.success && response.data) {
        return response.data.imageUrls;
      } else {
        setError(response.error?.message || 'Error uploading images');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    loading,
    error,
    uploadLogo,
    uploadImages,
  };
}