import { useState, useEffect, useCallback } from 'react';
import { entrepreneurshipApiService } from '@/app/services/entrepreneurshipApiService';
import { useAuth } from '@/app/components/AuthContext';
import {
  Resource,
  ResourceFilter,
} from '@/app/types/entrepreneurship';

export interface UseResourcesReturn {
  resources: Resource[];
  favoriteResources: Resource[];
  loading: boolean;
  error: string | null;
  filters: Partial<ResourceFilter>;
  searchQuery: string;
  fetchResources: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  downloadResource: (resourceId: string) => Promise<string | null>;
  rateResource: (resourceId: string, rating: number) => Promise<boolean>;
  addToFavorites: (resourceId: string) => Promise<boolean>;
  removeFromFavorites: (resourceId: string) => Promise<boolean>;
  updateFilters: (newFilters: Partial<ResourceFilter>) => void;
  setSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

const initialFilters: Partial<ResourceFilter> = {
  types: [],
  levels: [],
  categories: [],
  durations: [],
  dateRanges: [],
  searchQuery: '',
};

/**
 * Hook for managing resources functionality
 */
export function useResources(): UseResourcesReturn {
  const [resources, setResources] = useState<Resource[]>([]);
  const [favoriteResources, setFavoriteResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Partial<ResourceFilter>>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const { token } = useAuth();

  const fetchResources = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentFilters = {
        ...filters,
        searchQuery: searchQuery || filters.searchQuery || '',
      };

      const response = await entrepreneurshipApiService.getResources(token, currentFilters, {
        page: 1,
        limit: 50,
        sortBy: 'publishedDate',
        sortOrder: 'desc',
      });

      if (response.success && response.data) {
        setResources(response.data);
      } else {
        setError(response.error?.message || 'Error fetching resources');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token, filters, searchQuery]);

  const fetchFavorites = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.getFavoriteResources(token);
      if (response.success && response.data) {
        setFavoriteResources(response.data);
      } else {
        setError(response.error?.message || 'Error fetching favorite resources');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    }
  }, [token]);

  const downloadResource = useCallback(async (resourceId: string): Promise<string | null> => {
    if (!token) {
      setError('Authentication required');
      return null;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.downloadResource(token, resourceId);
      if (response.success && response.data) {
        // Update download count in local state
        setResources(prev =>
          prev.map(resource =>
            resource.id === resourceId
              ? { ...resource, downloads: resource.downloads + 1 }
              : resource
          )
        );

        return response.data.downloadUrl;
      } else {
        setError(response.error?.message || 'Error downloading resource');
        return null;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return null;
    }
  }, [token]);

  const rateResource = useCallback(async (
    resourceId: string,
    rating: number
  ): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.rateResource(token, resourceId, rating);
      if (response.success) {
        // Update rating in local state (simplified calculation)
        setResources(prev =>
          prev.map(resource =>
            resource.id === resourceId
              ? {
                  ...resource,
                  rating: ((resource.rating * resource.ratingCount) + rating) / (resource.ratingCount + 1),
                  ratingCount: resource.ratingCount + 1,
                }
              : resource
          )
        );

        return true;
      } else {
        setError(response.error?.message || 'Error rating resource');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  const addToFavorites = useCallback(async (resourceId: string): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.addToFavorites(token, resourceId);
      if (response.success) {
        // Update favorite status in local state
        setResources(prev =>
          prev.map(resource =>
            resource.id === resourceId
              ? { ...resource, isFavorite: true }
              : resource
          )
        );

        // Refresh favorites list
        await fetchFavorites();

        return true;
      } else {
        setError(response.error?.message || 'Error adding to favorites');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token, fetchFavorites]);

  const removeFromFavorites = useCallback(async (resourceId: string): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.removeFromFavorites(token, resourceId);
      if (response.success) {
        // Update favorite status in local state
        setResources(prev =>
          prev.map(resource =>
            resource.id === resourceId
              ? { ...resource, isFavorite: false }
              : resource
          )
        );

        // Remove from favorites list
        setFavoriteResources(prev => prev.filter(resource => resource.id !== resourceId));

        return true;
      } else {
        setError(response.error?.message || 'Error removing from favorites');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  const updateFilters = useCallback((newFilters: Partial<ResourceFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    setSearchQuery('');
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResources();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  useEffect(() => {
    if (token) {
      fetchFavorites();
    }
  }, [token, fetchFavorites]);

  return {
    resources,
    favoriteResources,
    loading,
    error,
    filters,
    searchQuery,
    fetchResources,
    fetchFavorites,
    downloadResource,
    rateResource,
    addToFavorites,
    removeFromFavorites,
    updateFilters,
    setSearchQuery,
    clearFilters,
  };
}

/**
 * Hook for managing a single resource
 */
export function useResource(resourceId?: string) {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchResource = useCallback(async (id: string) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getResource(token, id);
      if (response.success && response.data) {
        setResource(response.data);
      } else {
        setError(response.error?.message || 'Error fetching resource');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (resourceId && token) {
      fetchResource(resourceId);
    }
  }, [resourceId, token, fetchResource]);

  return {
    resource,
    loading,
    error,
    fetchResource,
  };
}