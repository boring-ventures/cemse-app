import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/app/store/authStore';
import { apiService } from '@/app/services/apiService';
import {
  CVData,
  CoverLetterData,
  CVHookReturn,
  RecipientData,
  DEFAULT_CV_DATA,
  OfflineAction
} from '@/app/types/cv';

/**
 * Custom hook for CV data management with API integration and offline fallback
 * Implements exact patterns from web cv-manager.tsx for mobile
 */

const CV_STORAGE_KEY = 'cv_data';
const COVER_LETTER_STORAGE_KEY = 'cover_letter_data';
const OFFLINE_QUEUE_KEY = 'cv_offline_queue';

export function useCV(): CVHookReturn {
  const { tokens } = useAuthStore();
  const [cvData, setCvData] = useState<CVData | null>(null);
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  /**
   * Load cached CV data from AsyncStorage
   */
  const loadCachedData = async () => {
    try {
      const cachedCV = await AsyncStorage.getItem(CV_STORAGE_KEY);
      const cachedCoverLetter = await AsyncStorage.getItem(COVER_LETTER_STORAGE_KEY);
      
      if (cachedCV) {
        setCvData(JSON.parse(cachedCV));
      }
      
      if (cachedCoverLetter) {
        setCoverLetterData(JSON.parse(cachedCoverLetter));
      }
    } catch (error) {
      console.error('Error loading cached CV data:', error);
    }
  };

  /**
   * Cache CV data to AsyncStorage
   */
  const cacheCVData = async (data: CVData) => {
    try {
      await AsyncStorage.setItem(CV_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching CV data:', error);
    }
  };

  /**
   * Cache cover letter data to AsyncStorage
   */
  const cacheCoverLetterData = async (data: CoverLetterData) => {
    try {
      await AsyncStorage.setItem(COVER_LETTER_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching cover letter data:', error);
    }
  };

  /**
   * Queue offline action for later sync
   */
  const queueOfflineAction = async (action: OfflineAction) => {
    try {
      const existingQueue = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue = existingQueue ? JSON.parse(existingQueue) : [];
      queue.push(action);
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error queueing offline action:', error);
    }
  };

  /**
   * Get mock CV data as fallback
   */
  const getMockCVData = (): CVData => {
    return {
      ...DEFAULT_CV_DATA,
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        municipality: '',
        department: '',
        country: 'Bolivia'
      },
      education: {
        level: '',
        currentInstitution: '',
        graduationYear: new Date().getFullYear(),
        isStudying: false,
        educationHistory: [],
        currentDegree: '',
        universityName: '',
        universityStartDate: '',
        universityEndDate: null,
        universityStatus: '',
        gpa: 0,
        academicAchievements: []
      },
      skills: [],
      interests: [],
      languages: [],
      socialLinks: [],
      workExperience: [],
      projects: [],
      activities: [],
      achievements: [],
      certifications: []
    } as CVData;
  };

  /**
   * Fetch CV data from API with fallback strategies
   * Implements exact pattern from web useCV hook
   */
  const fetchCVData = useCallback(async (): Promise<void> => {
    if (!tokens?.token) {
      setError(new Error('No authentication token'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api'}/cv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCvData(data);
        await cacheCVData(data);
      } else {
        // Fallback to cached data or mock data
        const cachedData = await AsyncStorage.getItem(CV_STORAGE_KEY);
        if (cachedData) {
          setCvData(JSON.parse(cachedData));
        } else {
          const mockData = getMockCVData();
          setCvData(mockData);
          await cacheCVData(mockData);
        }
      }
    } catch (apiError) {
      console.error('Error fetching CV data:', apiError);
      setError(apiError as Error);
      
      // Fallback to cached data or mock data
      try {
        const cachedData = await AsyncStorage.getItem(CV_STORAGE_KEY);
        if (cachedData) {
          setCvData(JSON.parse(cachedData));
        } else {
          const mockData = getMockCVData();
          setCvData(mockData);
          await cacheCVData(mockData);
        }
      } catch (cacheError) {
        console.error('Error loading fallback data:', cacheError);
        const mockData = getMockCVData();
        setCvData(mockData);
      }
    } finally {
      setLoading(false);
    }
  }, [tokens?.token]);

  /**
   * Update CV data with optimistic updates and offline queueing
   * Implements exact pattern from web cv-manager.tsx
   */
  const updateCVData = useCallback(async (data: Partial<CVData>): Promise<any> => {
    if (!tokens?.token) {
      throw new Error('No authentication token');
    }

    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      const currentData = cvData || getMockCVData();
      const updatedData = { ...currentData, ...data };
      setCvData(updatedData);
      await cacheCVData(updatedData);

      // Try to sync with server
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api'}/cv`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const serverData = await response.json();
        const finalData = serverData.profile || serverData;
        setCvData(finalData);
        await cacheCVData(finalData);
        return serverData;
      } else {
        // Queue for offline sync
        const offlineAction: OfflineAction = {
          type: 'UPDATE_CV',
          data,
          timestamp: Date.now(),
          id: `update_${Date.now()}`
        };
        await queueOfflineAction(offlineAction);
        
        throw new Error('Failed to update CV data - queued for offline sync');
      }
    } catch (updateError) {
      console.error('Error updating CV data:', updateError);
      
      // Queue for offline sync
      const offlineAction: OfflineAction = {
        type: 'UPDATE_CV',
        data,
        timestamp: Date.now(),
        id: `update_${Date.now()}`
      };
      await queueOfflineAction(offlineAction);
      
      setError(updateError as Error);
      throw updateError;
    } finally {
      setLoading(false);
    }
  }, [tokens?.token, cvData]);

  /**
   * Fetch cover letter data from API
   */
  const fetchCoverLetterData = useCallback(async (): Promise<void> => {
    if (!tokens?.token) {
      setError(new Error('No authentication token'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api'}/cv/cover-letter`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCoverLetterData(data);
        await cacheCoverLetterData(data);
      } else {
        // Fallback to cached data
        const cachedData = await AsyncStorage.getItem(COVER_LETTER_STORAGE_KEY);
        if (cachedData) {
          setCoverLetterData(JSON.parse(cachedData));
        }
      }
    } catch (apiError) {
      console.error('Error fetching cover letter data:', apiError);
      setError(apiError as Error);
      
      // Fallback to cached data
      try {
        const cachedData = await AsyncStorage.getItem(COVER_LETTER_STORAGE_KEY);
        if (cachedData) {
          setCoverLetterData(JSON.parse(cachedData));
        }
      } catch (cacheError) {
        console.error('Error loading cached cover letter data:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [tokens?.token]);

  /**
   * Save cover letter data
   */
  const saveCoverLetterData = useCallback(async (
    content: string,
    template?: string,
    recipient?: RecipientData,
    subject?: string
  ): Promise<any> => {
    if (!tokens?.token) {
      throw new Error('No authentication token');
    }

    try {
      setLoading(true);
      setError(null);

      const coverLetterPayload = {
        content,
        template: template || 'professional',
        recipient: recipient || {
          department: '',
          companyName: '',
          address: '',
          city: '',
          country: 'Bolivia'
        },
        subject: subject || ''
      };

      // Optimistic update
      setCoverLetterData(coverLetterPayload);
      await cacheCoverLetterData(coverLetterPayload);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api'}/cv/cover-letter`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coverLetterPayload),
      });

      if (response.ok) {
        const serverData = await response.json();
        setCoverLetterData(serverData);
        await cacheCoverLetterData(serverData);
        return serverData;
      } else {
        // Queue for offline sync
        const offlineAction: OfflineAction = {
          type: 'SAVE_COVER_LETTER',
          data: coverLetterPayload,
          timestamp: Date.now(),
          id: `cover_letter_${Date.now()}`
        };
        await queueOfflineAction(offlineAction);
        
        throw new Error('Failed to save cover letter - queued for offline sync');
      }
    } catch (saveError) {
      console.error('Error saving cover letter data:', saveError);
      setError(saveError as Error);
      throw saveError;
    } finally {
      setLoading(false);
    }
  }, [tokens?.token]);

  /**
   * Generate CV for specific job application
   */
  const generateCVForApplication = useCallback(async (jobOfferId: string): Promise<any> => {
    if (!tokens?.token) {
      throw new Error('No authentication token');
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL_DEV || 'http://192.168.0.87:3001/api'}/cv/generate/${jobOfferId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        throw new Error('Failed to generate CV for application');
      }
    } catch (generateError) {
      console.error('Error generating CV for application:', generateError);
      setError(generateError as Error);
      throw generateError;
    } finally {
      setLoading(false);
    }
  }, [tokens?.token]);

  return {
    cvData,
    coverLetterData,
    loading,
    error,
    fetchCVData,
    updateCVData,
    fetchCoverLetterData,
    saveCoverLetterData,
    generateCVForApplication,
  };
}