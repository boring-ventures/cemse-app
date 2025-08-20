import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobOffer, JobApplication } from '@/app/types/jobs';

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiry?: number; // expiry time in minutes
}

class OfflineStorageService {
  private readonly CACHE_PREFIX = 'cemse_cache_';
  private readonly DEFAULT_EXPIRY = 60; // 60 minutes

  /**
   * Store data in offline cache with expiry
   */
  async store<T>(key: string, data: T, expiryMinutes?: number): Promise<void> {
    try {
      const cacheData: CachedData<T> = {
        data,
        timestamp: Date.now(),
        expiry: expiryMinutes || this.DEFAULT_EXPIRY,
      };

      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`, 
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  /**
   * Retrieve data from offline cache
   */
  async retrieve<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const cacheData: CachedData<T> = JSON.parse(cached);
      
      // Check if data has expired
      if (this.isExpired(cacheData)) {
        await this.remove(key);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return null;
    }
  }

  /**
   * Remove data from cache
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing offline data:', error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearAll(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing offline cache:', error);
    }
  }

  /**
   * Check if cached data has expired
   */
  private isExpired<T>(cacheData: CachedData<T>): boolean {
    if (!cacheData.expiry) return false;
    
    const now = Date.now();
    const expiryTime = cacheData.timestamp + (cacheData.expiry * 60 * 1000);
    
    return now > expiryTime;
  }

  /**
   * Get cache size and info
   */
  async getCacheInfo(): Promise<{
    totalKeys: number;
    cacheKeys: string[];
    estimatedSize: number;
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let estimatedSize = 0;
      for (const key of cacheKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          estimatedSize += value.length;
        }
      }

      return {
        totalKeys: keys.length,
        cacheKeys,
        estimatedSize,
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {
        totalKeys: 0,
        cacheKeys: [],
        estimatedSize: 0,
      };
    }
  }

  // Specific cache methods for jobs module
  
  /**
   * Cache job listings
   */
  async cacheJobs(jobs: JobOffer[], filters?: any): Promise<void> {
    const key = filters ? `jobs_${JSON.stringify(filters)}` : 'jobs_all';
    await this.store(key, jobs, 30); // Cache for 30 minutes
  }

  /**
   * Get cached job listings
   */
  async getCachedJobs(filters?: any): Promise<JobOffer[] | null> {
    const key = filters ? `jobs_${JSON.stringify(filters)}` : 'jobs_all';
    return await this.retrieve<JobOffer[]>(key);
  }

  /**
   * Cache job detail
   */
  async cacheJobDetail(jobId: string, job: JobOffer): Promise<void> {
    await this.store(`job_${jobId}`, job, 60); // Cache for 1 hour
  }

  /**
   * Get cached job detail
   */
  async getCachedJobDetail(jobId: string): Promise<JobOffer | null> {
    return await this.retrieve<JobOffer>(`job_${jobId}`);
  }

  /**
   * Cache user applications
   */
  async cacheApplications(applications: JobApplication[]): Promise<void> {
    await this.store('user_applications', applications, 15); // Cache for 15 minutes
  }

  /**
   * Get cached applications
   */
  async getCachedApplications(): Promise<JobApplication[] | null> {
    return await this.retrieve<JobApplication[]>('user_applications');
  }

  /**
   * Cache bookmarked job IDs
   */
  async cacheBookmarks(bookmarks: string[]): Promise<void> {
    await this.store('user_bookmarks', bookmarks, 60); // Cache for 1 hour
  }

  /**
   * Get cached bookmarks
   */
  async getCachedBookmarks(): Promise<string[] | null> {
    return await this.retrieve<string[]>('user_bookmarks');
  }

  /**
   * Store draft application
   */
  async storeDraftApplication(jobId: string, draft: any): Promise<void> {
    await this.store(`draft_${jobId}`, draft, 24 * 60); // Cache for 24 hours
  }

  /**
   * Get draft application
   */
  async getDraftApplication(jobId: string): Promise<any | null> {
    return await this.retrieve(`draft_${jobId}`);
  }

  /**
   * Remove draft application
   */
  async removeDraftApplication(jobId: string): Promise<void> {
    await this.remove(`draft_${jobId}`);
  }
}

export const offlineStorage = new OfflineStorageService();