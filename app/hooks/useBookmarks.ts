import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';

interface UseBookmarksReturn {
  bookmarkedJobs: string[];
  loading: boolean;
  error: string | null;
  isBookmarked: (jobId: string) => boolean;
  toggleBookmark: (jobId: string) => Promise<boolean>;
  fetchBookmarks: () => Promise<void>;
}

export function useBookmarks(): UseBookmarksReturn {
  const { tokens } = useAuthStore();
  const [bookmarkedJobs, setBookmarkedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookmarks = useCallback(async (): Promise<void> => {
    if (!tokens?.token) {
      setError('No authentication token');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.getBookmarkedJobs(tokens.token);

      if (response.success && response.data) {
        const bookmarks = Array.isArray(response.data) ? response.data : [];
        setBookmarkedJobs(bookmarks);
      } else {
        // If the error is "Profile not found", initialize with empty bookmarks
        if (response.error?.message?.includes('Profile not found') || 
            response.error?.statusCode === 404) {
          console.warn('User profile not found, initializing empty bookmarks');
          setBookmarkedJobs([]);
          setError(null); // Clear error since this is expected for new users
        } else {
          throw new Error(response.error?.message || 'Failed to fetch bookmarks');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      
      // Handle profile not found gracefully
      if (errorMessage.includes('Profile not found') || 
          errorMessage.includes('404')) {
        console.warn('User profile not found, initializing empty bookmarks');
        setBookmarkedJobs([]);
        setError(null);
      } else {
        setError(errorMessage);
        console.error('Error fetching bookmarks:', err);
        setBookmarkedJobs([]);
      }
    } finally {
      setLoading(false);
    }
  }, [tokens?.token]);

  const isBookmarked = useCallback((jobId: string): boolean => {
    return bookmarkedJobs.includes(jobId);
  }, [bookmarkedJobs]);

  const toggleBookmark = useCallback(async (jobId: string): Promise<boolean> => {
    if (!tokens?.token) {
      setError('No authentication token');
      return false;
    }

    const currentlyBookmarked = isBookmarked(jobId);

    try {
      // Optimistically update UI
      if (currentlyBookmarked) {
        setBookmarkedJobs(prev => prev.filter(id => id !== jobId));
      } else {
        setBookmarkedJobs(prev => [...prev, jobId]);
      }

      // Make API call
      const response = currentlyBookmarked
        ? await apiService.removeBookmark(tokens.token, jobId)
        : await apiService.bookmarkJob(tokens.token, jobId);

      if (response.success) {
        return true;
      } else {
        // Revert optimistic update on failure
        if (currentlyBookmarked) {
          setBookmarkedJobs(prev => [...prev, jobId]);
        } else {
          setBookmarkedJobs(prev => prev.filter(id => id !== jobId));
        }
        
        // Handle profile not found during bookmark operations
        if (response.error?.message?.includes('Profile not found') || 
            response.error?.statusCode === 404) {
          console.warn('Profile not found during bookmark operation - this might indicate the user profile needs to be created');
          throw new Error('Tu perfil aún no está completamente configurado. Por favor, actualiza tu perfil primero.');
        } else {
          throw new Error(response.error?.message || 'Failed to toggle bookmark');
        }
      }
    } catch (err) {
      // Revert optimistic update on error
      if (currentlyBookmarked) {
        setBookmarkedJobs(prev => [...prev, jobId]);
      } else {
        setBookmarkedJobs(prev => prev.filter(id => id !== jobId));
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error toggling bookmark:', err);
      return false;
    }
  }, [tokens?.token, isBookmarked]);

  // Fetch bookmarks on mount
  useEffect(() => {
    if (tokens?.token) {
      fetchBookmarks();
    }
  }, [tokens?.token, fetchBookmarks]);

  return {
    bookmarkedJobs,
    loading,
    error,
    isBookmarked,
    toggleBookmark,
    fetchBookmarks,
  };
}