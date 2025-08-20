import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CVData,
  CoverLetterData,
  OfflineAction,
  CVStorageService,
} from '@/app/types/cv';

/**
 * CV Storage Service
 * Handles offline data persistence and sync queue management
 * Features: Local storage, offline actions queue, data synchronization
 */

// Storage keys
const STORAGE_KEYS = {
  CV_DATA: 'cv_data',
  COVER_LETTER_DATA: 'cover_letter_data',
  OFFLINE_QUEUE: 'cv_offline_queue',
  COLLAPSED_SECTIONS: 'cv_collapsed_sections',
  LAST_SYNC: 'cv_last_sync',
} as const;

class CVStorageServiceImpl implements CVStorageService {
  /**
   * Save CV data to local storage
   */
  async save(cvData: CVData): Promise<void> {
    try {
      const dataToStore = {
        ...cvData,
        lastModified: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.CV_DATA, JSON.stringify(dataToStore));
      console.log('CV data saved to local storage');
    } catch (error) {
      console.error('Error saving CV data:', error);
      throw new Error('Failed to save CV data to local storage');
    }
  }

  /**
   * Load CV data from local storage
   */
  async load(): Promise<CVData | null> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.CV_DATA);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('CV data loaded from local storage');
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Error loading CV data:', error);
      return null;
    }
  }

  /**
   * Clear CV data from local storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.CV_DATA);
      console.log('CV data cleared from local storage');
    } catch (error) {
      console.error('Error clearing CV data:', error);
      throw new Error('Failed to clear CV data from local storage');
    }
  }

  /**
   * Save cover letter data to local storage
   */
  async saveCoverLetter(coverLetterData: CoverLetterData): Promise<void> {
    try {
      const dataToStore = {
        ...coverLetterData,
        lastModified: new Date().toISOString(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.COVER_LETTER_DATA, JSON.stringify(dataToStore));
      console.log('Cover letter data saved to local storage');
    } catch (error) {
      console.error('Error saving cover letter data:', error);
      throw new Error('Failed to save cover letter data to local storage');
    }
  }

  /**
   * Load cover letter data from local storage
   */
  async loadCoverLetter(): Promise<CoverLetterData | null> {
    try {
      const storedData = await AsyncStorage.getItem(STORAGE_KEYS.COVER_LETTER_DATA);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('Cover letter data loaded from local storage');
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Error loading cover letter data:', error);
      return null;
    }
  }

  /**
   * Queue an offline action for later synchronization
   */
  async queueAction(action: OfflineAction): Promise<void> {
    try {
      const existingQueue = await this.getQueuedActions();
      const updatedQueue = [...existingQueue, action];
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(updatedQueue));
      console.log('Offline action queued:', action.type);
    } catch (error) {
      console.error('Error queueing offline action:', error);
      throw new Error('Failed to queue offline action');
    }
  }

  /**
   * Get all queued offline actions
   */
  async getQueuedActions(): Promise<OfflineAction[]> {
    try {
      const storedQueue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (storedQueue) {
        return JSON.parse(storedQueue);
      }
      return [];
    } catch (error) {
      console.error('Error getting queued actions:', error);
      return [];
    }
  }

  /**
   * Clear offline queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
      console.log('Offline queue cleared');
    } catch (error) {
      console.error('Error clearing offline queue:', error);
      throw new Error('Failed to clear offline queue');
    }
  }

  /**
   * Remove specific action from queue
   */
  async removeActionFromQueue(actionId: string): Promise<void> {
    try {
      const queue = await this.getQueuedActions();
      const updatedQueue = queue.filter(action => action.id !== actionId);
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(updatedQueue));
      console.log('Action removed from queue:', actionId);
    } catch (error) {
      console.error('Error removing action from queue:', error);
      throw new Error('Failed to remove action from queue');
    }
  }

  /**
   * Save collapsed sections state
   */
  async saveCollapsedSections(collapsedSections: Record<string, boolean>): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COLLAPSED_SECTIONS, JSON.stringify(collapsedSections));
    } catch (error) {
      console.error('Error saving collapsed sections:', error);
    }
  }

  /**
   * Load collapsed sections state
   */
  async loadCollapsedSections(): Promise<Record<string, boolean> | null> {
    try {
      const storedSections = await AsyncStorage.getItem(STORAGE_KEYS.COLLAPSED_SECTIONS);
      if (storedSections) {
        return JSON.parse(storedSections);
      }
      return null;
    } catch (error) {
      console.error('Error loading collapsed sections:', error);
      return null;
    }
  }

  /**
   * Update last sync timestamp
   */
  async updateLastSync(): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, timestamp);
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
    }
  }

  /**
   * Get last sync timestamp
   */
  async getLastSync(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return null;
    }
  }

  /**
   * Check if data needs sync (has pending actions or is older than threshold)
   */
  async needsSync(): Promise<boolean> {
    try {
      const pendingActions = await this.getQueuedActions();
      if (pendingActions.length > 0) {
        return true;
      }

      const lastSync = await this.getLastSync();
      if (!lastSync) {
        return true;
      }

      // Check if last sync is older than 1 hour
      const lastSyncTime = new Date(lastSync).getTime();
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      
      return (now - lastSyncTime) > oneHour;
    } catch (error) {
      console.error('Error checking sync status:', error);
      return false;
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<{
    cvDataSize: number;
    coverLetterSize: number;
    queuedActionsCount: number;
    lastSync: string | null;
  }> {
    try {
      const cvData = await AsyncStorage.getItem(STORAGE_KEYS.CV_DATA);
      const coverLetterData = await AsyncStorage.getItem(STORAGE_KEYS.COVER_LETTER_DATA);
      const queuedActions = await this.getQueuedActions();
      const lastSync = await this.getLastSync();

      return {
        cvDataSize: cvData ? new Blob([cvData]).size : 0,
        coverLetterSize: coverLetterData ? new Blob([coverLetterData]).size : 0,
        queuedActionsCount: queuedActions.length,
        lastSync,
      };
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        cvDataSize: 0,
        coverLetterSize: 0,
        queuedActionsCount: 0,
        lastSync: null,
      };
    }
  }

  /**
   * Clear all CV-related storage
   */
  async clearAll(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.CV_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.COVER_LETTER_DATA),
        AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE),
        AsyncStorage.removeItem(STORAGE_KEYS.COLLAPSED_SECTIONS),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_SYNC),
      ]);
      console.log('All CV storage cleared');
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw new Error('Failed to clear all storage');
    }
  }

  /**
   * Export all CV data for backup
   */
  async exportData(): Promise<{
    cvData: CVData | null;
    coverLetterData: CoverLetterData | null;
    queuedActions: OfflineAction[];
    exportTimestamp: string;
  }> {
    try {
      const [cvData, coverLetterData, queuedActions] = await Promise.all([
        this.load(),
        this.loadCoverLetter(),
        this.getQueuedActions(),
      ]);

      return {
        cvData,
        coverLetterData,
        queuedActions,
        exportTimestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  }

  /**
   * Import CV data from backup
   */
  async importData(data: {
    cvData?: CVData;
    coverLetterData?: CoverLetterData;
    queuedActions?: OfflineAction[];
  }): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      if (data.cvData) {
        promises.push(this.save(data.cvData));
      }

      if (data.coverLetterData) {
        promises.push(this.saveCoverLetter(data.coverLetterData));
      }

      if (data.queuedActions && data.queuedActions.length > 0) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(data.queuedActions))
        );
      }

      await Promise.all(promises);
      console.log('Data imported successfully');
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }
}

// Export singleton instance
export const cvStorageService = new CVStorageServiceImpl();

// Export helper functions for direct use
export const CVStorage = {
  save: (cvData: CVData) => cvStorageService.save(cvData),
  load: () => cvStorageService.load(),
  clear: () => cvStorageService.clear(),
  saveCoverLetter: (data: CoverLetterData) => cvStorageService.saveCoverLetter(data),
  loadCoverLetter: () => cvStorageService.loadCoverLetter(),
  queueAction: (action: OfflineAction) => cvStorageService.queueAction(action),
  getQueuedActions: () => cvStorageService.getQueuedActions(),
  clearQueue: () => cvStorageService.clearQueue(),
  saveCollapsedSections: (sections: Record<string, boolean>) => cvStorageService.saveCollapsedSections(sections),
  loadCollapsedSections: () => cvStorageService.loadCollapsedSections(),
  needsSync: () => cvStorageService.needsSync(),
  getStats: () => cvStorageService.getStorageStats(),
  clearAll: () => cvStorageService.clearAll(),
  export: () => cvStorageService.exportData(),
  import: (data: any) => cvStorageService.importData(data),
};