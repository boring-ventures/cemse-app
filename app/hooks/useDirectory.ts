import { useState, useEffect, useCallback } from 'react';
import { entrepreneurshipApiService } from '@/app/services/entrepreneurshipApiService';
import { useAuth } from '@/app/components/AuthContext';
import {
  Institution,
  DirectoryProfile,
  Post,
} from '@/app/types/entrepreneurship';

export interface UseDirectoryReturn {
  institutions: Institution[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filteredInstitutions: Institution[];
  fetchInstitutions: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  filterByType: (type: string) => Institution[];
  filterByRegion: (region: string) => Institution[];
}

export interface UseInstitutionProfileReturn {
  profile: DirectoryProfile | null;
  posts: Post[];
  loading: boolean;
  error: string | null;
  fetchProfile: (institutionId: string) => Promise<void>;
  fetchPosts: (institutionId: string, options?: { page?: number; limit?: number; category?: string }) => Promise<void>;
}

export interface UsePostReturn {
  post: Post | null;
  loading: boolean;
  error: string | null;
  fetchPost: (postId: string) => Promise<void>;
}

/**
 * Hook for managing directory functionality
 */
export function useDirectory(): UseDirectoryReturn {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInstitutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getPublicInstitutions();
      if (response.success && response.data) {
        setInstitutions(response.data);
      } else {
        setError(response.error?.message || 'Error fetching institutions');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredInstitutions = useState(() => {
    if (!searchQuery.trim()) return institutions;

    const query = searchQuery.toLowerCase();
    return institutions.filter(institution =>
      institution.name.toLowerCase().includes(query) ||
      institution.department.toLowerCase().includes(query) ||
      institution.region.toLowerCase().includes(query) ||
      institution.institutionType.toLowerCase().includes(query)
    );
  })[0];

  const filterByType = useCallback((type: string): Institution[] => {
    return institutions.filter(institution =>
      institution.institutionType.toLowerCase() === type.toLowerCase()
    );
  }, [institutions]);

  const filterByRegion = useCallback((region: string): Institution[] => {
    return institutions.filter(institution =>
      institution.region.toLowerCase() === region.toLowerCase()
    );
  }, [institutions]);

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  return {
    institutions,
    loading,
    error,
    searchQuery,
    filteredInstitutions,
    fetchInstitutions,
    setSearchQuery,
    filterByType,
    filterByRegion,
  };
}

/**
 * Hook for managing institution profile and posts
 */
export function useInstitutionProfile(institutionId?: string): UseInstitutionProfileReturn {
  const [profile, setProfile] = useState<DirectoryProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchProfile = useCallback(async (id: string) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getInstitutionProfile(token, id);
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error?.message || 'Error fetching institution profile');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPosts = useCallback(async (
    id: string,
    options?: { page?: number; limit?: number; category?: string }
  ) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getInstitutionPosts(token, id, options);
      if (response.success && response.data) {
        if (options?.page && options.page > 1) {
          // Append to existing posts for pagination
          setPosts(prev => [...prev, ...response.data!]);
        } else {
          // Replace posts for initial load or filter change
          setPosts(response.data);
        }
      } else {
        setError(response.error?.message || 'Error fetching institution posts');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (institutionId && token) {
      fetchProfile(institutionId);
      fetchPosts(institutionId, { page: 1, limit: 20 });
    }
  }, [institutionId, token, fetchProfile, fetchPosts]);

  return {
    profile,
    posts,
    loading,
    error,
    fetchProfile,
    fetchPosts,
  };
}

/**
 * Hook for managing a single post
 */
export function usePost(postId?: string): UsePostReturn {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchPost = useCallback(async (id: string) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await entrepreneurshipApiService.getPost(token, id);
      if (response.success && response.data) {
        setPost(response.data);
      } else {
        setError(response.error?.message || 'Error fetching post');
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (postId && token) {
      fetchPost(postId);
    }
  }, [postId, token, fetchPost]);

  return {
    post,
    loading,
    error,
    fetchPost,
  };
}

/**
 * Hook for directory search with debouncing
 */
export function useDirectorySearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { institutions } = useDirectory();

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    
    const lowerQuery = query.toLowerCase();
    const results = institutions.filter(institution =>
      institution.name.toLowerCase().includes(lowerQuery) ||
      institution.department.toLowerCase().includes(lowerQuery) ||
      institution.region.toLowerCase().includes(lowerQuery) ||
      institution.institutionType.toLowerCase().includes(lowerQuery) ||
      institution.customType?.toLowerCase().includes(lowerQuery)
    );

    setSearchResults(results);
    setLoading(false);
  }, [institutions]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, performSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    loading,
    error,
  };
}