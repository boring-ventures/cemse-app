import { useState, useEffect, useCallback } from 'react';
import { entrepreneurshipApiService } from '@/app/services/entrepreneurshipApiService';
import { useAuth } from '@/app/components/AuthContext';
import {
  ContactUser,
  ContactRequest,
  ContactStats,
} from '@/app/types/entrepreneurship';

export interface UseNetworkingReturn {
  users: ContactUser[];
  requests: ContactRequest[];
  contacts: ContactUser[];
  stats: ContactStats | null;
  loading: boolean;
  error: string | null;
  searchUsers: (query?: string, filters?: any) => Promise<void>;
  sendContactRequest: (receiverId: string, message?: string) => Promise<boolean>;
  acceptRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  fetchReceivedRequests: () => Promise<void>;
  fetchMyContacts: () => Promise<void>;
  fetchStats: () => Promise<void>;
}

/**
 * Hook for managing networking functionality
 */
export function useNetworking(): UseNetworkingReturn {
  const [users, setUsers] = useState<ContactUser[]>([]);
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [contacts, setContacts] = useState<ContactUser[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const searchUsers = useCallback(async (
    query?: string,
    filters?: {
      department?: string;
      municipality?: string;
      skills?: string[];
    }
  ) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.searchContacts(token, query, filters);
      if (response.success && response.data) {
        setUsers(response.data);
      } else {
        setError(response.error?.message || 'Error searching users');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const sendContactRequest = useCallback(async (
    receiverId: string,
    message?: string
  ): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.sendContactRequest(token, {
        receiverId,
        message,
      });

      if (response.success && response.data) {
        // Update user status in the list
        setUsers(prev =>
          prev.map(user =>
            user.userId === receiverId
              ? { ...user, contactStatus: 'SENT' }
              : user
          )
        );

        return true;
      } else {
        setError(response.error?.message || 'Error sending contact request');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  const acceptRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.acceptContactRequest(token, requestId);
      if (response.success) {
        // Remove from requests list
        setRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Refresh contacts and stats
        await fetchMyContacts();
        await fetchStats();

        return true;
      } else {
        setError(response.error?.message || 'Error accepting request');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  const rejectRequest = useCallback(async (requestId: string): Promise<boolean> => {
    if (!token) {
      setError('Authentication required');
      return false;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.rejectContactRequest(token, requestId);
      if (response.success) {
        // Remove from requests list
        setRequests(prev => prev.filter(req => req.id !== requestId));
        
        // Refresh stats
        await fetchStats();

        return true;
      } else {
        setError(response.error?.message || 'Error rejecting request');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
      return false;
    }
  }, [token]);

  const fetchReceivedRequests = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getReceivedRequests(token);
      if (response.success && response.data) {
        setRequests(response.data);
      } else {
        setError(response.error?.message || 'Error fetching requests');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchMyContacts = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getMyContacts(token);
      if (response.success && response.data) {
        setContacts(response.data);
      } else {
        setError(response.error?.message || 'Error fetching contacts');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setError(null);

      const response = await entrepreneurshipApiService.getContactStats(token);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error?.message || 'Error fetching stats');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      searchUsers();
      fetchReceivedRequests();
      fetchMyContacts();
      fetchStats();
    }
  }, [token, searchUsers, fetchReceivedRequests, fetchMyContacts, fetchStats]);

  return {
    users,
    requests,
    contacts,
    stats,
    loading,
    error,
    searchUsers,
    sendContactRequest,
    acceptRequest,
    rejectRequest,
    fetchReceivedRequests,
    fetchMyContacts,
    fetchStats,
  };
}

/**
 * Hook for contact search with debouncing
 */
export function useContactSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ContactUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const debouncedSearch = useCallback(
    async (query: string, filters?: any) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await entrepreneurshipApiService.searchContacts(token, query, filters);
        if (response.success && response.data) {
          setSearchResults(response.data);
        } else {
          setError(response.error?.message || 'Error searching contacts');
        }
      } catch (err: any) {
        setError(err.message || 'Unexpected error occurred');
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        debouncedSearch(searchQuery);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, debouncedSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
  };
}