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
        throw new Error(response.error?.message || 'Failed to fetch bookmarks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching bookmarks:', err);
      setBookmarkedJobs([]);
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
        throw new Error(response.error?.message || 'Failed to toggle bookmark');
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