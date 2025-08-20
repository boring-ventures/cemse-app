import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CVData, OfflineAction, NetworkSyncHook } from '@/app/types/cv';
import { useCV } from './useCV';

/**
 * Network Sync Hook
 * Manages offline/online state and syncs pending updates when connection is restored
 * Implements exact patterns from the specification for mobile offline support
 */

const OFFLINE_QUEUE_KEY = 'cv_offline_queue';

export function useNetworkSync(): NetworkSyncHook {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<Array<Partial<CVData>>>([]);
  const { updateCVData } = useCV();

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      setIsOnline(isConnected);
      
      // When connection is restored, sync pending updates
      if (isConnected && pendingUpdates.length > 0) {
        syncPendingUpdates();
      }
    });
    
    // Load pending updates from storage on mount
    loadPendingUpdates();
    
    return unsubscribe;
  }, [pendingUpdates.length]);

  /**
   * Load pending updates from AsyncStorage
   */
  const loadPendingUpdates = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (stored) {
        const queue = JSON.parse(stored);
        setPendingUpdates(queue.map((action: OfflineAction) => action.data));
      }
    } catch (error) {
      console.error('Error loading pending updates:', error);
    }
  };

  /**
   * Save pending updates to AsyncStorage
   */
  const savePendingUpdates = async (updates: Array<Partial<CVData>>) => {
    try {
      const queue: OfflineAction[] = updates.map((data, index) => ({
        type: 'UPDATE_CV',
        data,
        timestamp: Date.now(),
        id: `update_${Date.now()}_${index}`
      }));
      
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error saving pending updates:', error);
    }
  };

  /**
   * Add update to offline queue
   */
  const queueUpdate = useCallback((update: Partial<CVData>) => {
    const newUpdates = [...pendingUpdates, update];
    setPendingUpdates(newUpdates);
    savePendingUpdates(newUpdates);
  }, [pendingUpdates]);

  /**
   * Sync all pending updates when online
   */
  const syncPendingUpdates = useCallback(async () => {
    if (!isOnline || pendingUpdates.length === 0) return;

    try {
      console.log(`Syncing ${pendingUpdates.length} pending updates...`);
      
      // Merge all pending updates into a single update
      const mergedUpdate = pendingUpdates.reduce((acc, update) => ({
        ...acc,
        ...update,
        // Merge arrays properly
        ...(update.skills && { skills: update.skills }),
        ...(update.interests && { interests: update.interests }),
        ...(update.languages && { languages: update.languages }),
        ...(update.workExperience && { workExperience: update.workExperience }),
        ...(update.projects && { projects: update.projects }),
      }), {} as Partial<CVData>);

      // Attempt to sync with server
      await updateCVData(mergedUpdate);
      
      // Clear pending updates on successful sync
      setPendingUpdates([]);
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      
      console.log('Successfully synced pending updates');
    } catch (error) {
      console.error('Error syncing pending updates:', error);
      // Keep updates in queue for next attempt
    }
  }, [isOnline, pendingUpdates, updateCVData]);

  /**
   * Force sync (called manually)
   */
  const forcSync = useCallback(async () => {
    if (isOnline) {
      await syncPendingUpdates();
    }
  }, [isOnline, syncPendingUpdates]);

  /**
   * Clear all pending updates (emergency clear)
   */
  const clearPendingUpdates = useCallback(async () => {
    setPendingUpdates([]);
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  }, []);

  return {
    isOnline,
    pendingUpdates,
    syncPendingUpdates,
    queueUpdate,
    forceSync: forcSync,
    clearPendingUpdates,
  };
}

/**
 * Hook to get network status only (lighter version)
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      setConnectionType(state.type || 'unknown');
    });
    
    return unsubscribe;
  }, []);

  return {
    isOnline,
    connectionType,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular',
    isEthernet: connectionType === 'ethernet',
  };
}