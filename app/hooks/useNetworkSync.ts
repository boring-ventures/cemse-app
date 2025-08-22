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

// Sync Configuration Constants
const SYNC_CONFIG = {
  MAX_RETRY_ATTEMPTS: 3,
  MAX_QUEUE_SIZE: 20, // Reduced from 50 to prevent memory issues
  RETRY_DELAYS: [2000, 5000, 10000], // 2s, 5s, 10s - increased delays
  CLEANUP_INTERVAL: 300000, // 5 minutes
  MAX_FAILED_ITEM_AGE: 600000, // 10 minutes
};

// Internal Spanish Messages
const SYNC_MESSAGES = {
  SYNCING: (count: number, attempt: number) => `Sincronizando ${count} actualizaciones pendientes... (Intento ${attempt})`,
  SUCCESS: 'Sincronización completada exitosamente',
  ERROR: (attempt: number) => `Error al sincronizar actualizaciones pendientes (intento ${attempt})`,
  MAX_ATTEMPTS: 'Límite de reintentos alcanzado, limpiando cola',
  QUEUE_FULL: 'Cola de sincronización llena, eliminando actualizaciones antiguas',
  SKIP_TOO_SOON: (waitTime: number) => `Omitiendo sincronización - muy pronto después de fallos. Esperar ${waitTime}s`,
  CLEARED_FAILED: (count: number) => `Eliminadas ${count} actualizaciones fallidas de la cola`,
};

export function useNetworkSync(): NetworkSyncHook {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingUpdates, setPendingUpdates] = useState<Array<Partial<CVData>>>([]);
  const [retryAttempts, setRetryAttempts] = useState(0);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<Date | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [failedItems, setFailedItems] = useState<Set<string>>(new Set());
  const { updateCVData } = useCV();
  
  // Smart retry configuration using SYNC_CONFIG
  const { MAX_RETRY_ATTEMPTS, RETRY_DELAYS, MAX_QUEUE_SIZE, CLEANUP_INTERVAL, MAX_FAILED_ITEM_AGE } = SYNC_CONFIG;

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected ?? false;
      const wasOffline = !isOnline;
      setIsOnline(isConnected);
      
      // Only trigger sync when transitioning from offline to online
      // and not when already syncing or max attempts reached
      if (isConnected && wasOffline && pendingUpdates.length > 0 && !syncInProgress && retryAttempts < MAX_RETRY_ATTEMPTS) {
        syncPendingUpdates();
      }
    });
    
    return unsubscribe;
  }, [isOnline, syncInProgress, retryAttempts]);

  // Load pending updates and setup cleanup on mount only
  useEffect(() => {
    loadPendingUpdates();
    
    // Setup cleanup interval for failed items
    const cleanupInterval = setInterval(cleanupFailedItems, CLEANUP_INTERVAL);
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);

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
   * Save pending updates to AsyncStorage with queue size limits
   */
  const savePendingUpdates = async (updates: Array<Partial<CVData>>) => {
    try {
      // Limit queue size to prevent memory issues
      let limitedUpdates = updates;
      if (updates.length > MAX_QUEUE_SIZE) {
        console.log(SYNC_MESSAGES.QUEUE_FULL);
        limitedUpdates = updates.slice(-MAX_QUEUE_SIZE); // Keep only the latest updates
      }
      
      const queue: OfflineAction[] = limitedUpdates.map((data, index) => ({
        type: 'UPDATE_CV',
        data,
        timestamp: Date.now(),
        id: `update_${Date.now()}_${index}`,
        attempts: 0,
      }));
      
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Error al guardar actualizaciones pendientes:', error);
    }
  };

  /**
   * Clean up failed items that are too old or exceeded max attempts
   */
  const cleanupFailedItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (!stored) return;
      
      const queue: OfflineAction[] = JSON.parse(stored);
      const now = Date.now();
      
      const validItems = queue.filter(action => {
        // Remove items that are too old or have exceeded max attempts
        const isOld = (now - action.timestamp) > MAX_FAILED_ITEM_AGE;
        const hasExceededAttempts = (action.attempts || 0) >= MAX_RETRY_ATTEMPTS;
        
        return !isOld && !hasExceededAttempts;
      });
      
      if (validItems.length !== queue.length) {
        const removedCount = queue.length - validItems.length;
        console.log(SYNC_MESSAGES.CLEARED_FAILED(removedCount));
        
        await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(validItems));
        setPendingUpdates(validItems.map(action => action.data));
      }
    } catch (error) {
      console.error('Error al limpiar elementos fallidos:', error);
    }
  };

  /**
   * Add update to offline queue with size limits
   */
  const queueUpdate = useCallback((update: Partial<CVData>) => {
    let newUpdates = [...pendingUpdates, update];
    
    // Enforce queue size limit
    if (newUpdates.length > MAX_QUEUE_SIZE) {
      console.log(SYNC_MESSAGES.QUEUE_FULL);
      newUpdates = newUpdates.slice(-MAX_QUEUE_SIZE);
    }
    
    setPendingUpdates(newUpdates);
    savePendingUpdates(newUpdates);
  }, [pendingUpdates]);

  /**
   * Sync all pending updates when online with smart retry logic and proper limits
   */
  const syncPendingUpdates = useCallback(async (forceRetry = false) => {
    // Circuit breaker: Immediate exit conditions
    if (!isOnline || pendingUpdates.length === 0) {
      return;
    }

    // Prevent concurrent sync attempts
    if (syncInProgress && !forceRetry) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    // Hard limit: If max attempts reached, clear everything
    if (retryAttempts >= MAX_RETRY_ATTEMPTS && !forceRetry) {
      console.log(SYNC_MESSAGES.MAX_ATTEMPTS);
      setPendingUpdates([]);
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      setRetryAttempts(0);
      setFailedItems(new Set());
      return;
    }

    // Rate limiting for automatic retries
    const now = new Date();
    if (!forceRetry && lastSyncAttempt) {
      const timeSinceLastAttempt = now.getTime() - lastSyncAttempt.getTime();
      const minWaitTime = RETRY_DELAYS[Math.min(retryAttempts, RETRY_DELAYS.length - 1)] || 5000;
      
      if (timeSinceLastAttempt < minWaitTime) {
        const waitTime = Math.ceil((minWaitTime - timeSinceLastAttempt) / 1000);
        console.log(SYNC_MESSAGES.SKIP_TOO_SOON(waitTime));
        return;
      }
    }

    setSyncInProgress(true);
    setLastSyncAttempt(now);
    const currentAttempt = retryAttempts + 1;

    try {
      console.log(SYNC_MESSAGES.SYNCING(pendingUpdates.length, currentAttempt));
      
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

      // Create a special sync flag to prevent re-queueing in useCV
      const syncUpdate = { ...mergedUpdate, _isNetworkSync: true };
      
      // Attempt to sync with server
      await updateCVData(syncUpdate);
      
      // Clear pending updates on successful sync
      setPendingUpdates([]);
      await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
      setRetryAttempts(0);
      setFailedItems(new Set());
      
      console.log(SYNC_MESSAGES.SUCCESS);
    } catch (error) {
      console.error(SYNC_MESSAGES.ERROR(currentAttempt), error);
      
      setRetryAttempts(currentAttempt);
      
      // Only schedule retry if we haven't exceeded max attempts and not forcing
      if (currentAttempt < MAX_RETRY_ATTEMPTS && isOnline) {
        const delay = RETRY_DELAYS[Math.min(currentAttempt - 1, RETRY_DELAYS.length - 1)] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        
        // Use a single timeout and prevent multiple concurrent retries
        setTimeout(() => {
          // Double-check conditions before retrying
          if (isOnline && !syncInProgress && retryAttempts < MAX_RETRY_ATTEMPTS && pendingUpdates.length > 0) {
            syncPendingUpdates(true);
          }
        }, delay);
      } else {
        // Max attempts reached or offline - clear queue to prevent infinite loops
        console.log(SYNC_MESSAGES.MAX_ATTEMPTS);
        setPendingUpdates([]);
        await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
        setRetryAttempts(0);
        setFailedItems(new Set());
      }
    } finally {
      setSyncInProgress(false);
    }
  }, [isOnline, pendingUpdates, updateCVData, retryAttempts, lastSyncAttempt, syncInProgress]);

  /**
   * Force sync (called manually) - resets retry attempts
   */
  const forceSync = useCallback(async () => {
    if (isOnline) {
      setRetryAttempts(0); // Reset attempts for manual sync
      setFailedItems(new Set());
      await syncPendingUpdates(true);
    }
  }, [isOnline, syncPendingUpdates]);

  /**
   * Clear all pending updates (emergency clear)
   */
  const clearPendingUpdates = useCallback(async () => {
    console.log('Limpiando todas las actualizaciones pendientes manualmente');
    setSyncInProgress(false); // Stop any ongoing sync
    setPendingUpdates([]);
    setFailedItems(new Set());
    setRetryAttempts(0);
    setLastSyncAttempt(null);
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    await AsyncStorage.removeItem('cv_offline_queue'); // Also clear useCV queue
  }, []);

  /**
   * Emergency circuit breaker - stops all sync activity immediately
   */
  const emergencyStop = useCallback(async () => {
    console.log('EMERGENCY STOP: Deteniendo toda actividad de sincronización');
    setSyncInProgress(false);
    setPendingUpdates([]);
    setFailedItems(new Set());
    setRetryAttempts(0);
    setLastSyncAttempt(null);
    
    // Clear all possible queue storage keys
    await AsyncStorage.multiRemove([
      OFFLINE_QUEUE_KEY,
      'cv_offline_queue',
      'sync_retry_state'
    ]);
  }, []);

  return {
    isOnline,
    pendingUpdates,
    syncPendingUpdates,
    queueUpdate,
    forceSync,
    clearPendingUpdates,
    emergencyStop,
    retryAttempts,
    syncInProgress,
    lastSyncAttempt,
    failedItemsCount: failedItems.size,
    cleanupFailedItems,
    getNextRetryDelay: () => {
      if (retryAttempts >= MAX_RETRY_ATTEMPTS) return null;
      return RETRY_DELAYS[retryAttempts] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
    },
    canRetry: () => retryAttempts < MAX_RETRY_ATTEMPTS,
    getSyncStatus: () => {
      if (syncInProgress) return 'syncing';
      if (pendingUpdates.length === 0) return 'idle';
      if (retryAttempts >= MAX_RETRY_ATTEMPTS) return 'failed';
      if (!isOnline) return 'offline';
      return 'pending';
    },
  };
}

/**
 * Enhanced Network Status Hook with connection quality indicators
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [connectionQuality, setConnectionQuality] = useState<'poor' | 'good' | 'excellent'>('good');
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
      setConnectionType(state.type || 'unknown');
      setIsInternetReachable(state.isInternetReachable ?? null);
      
      // Determine connection quality based on connection details
      if (state.details) {
        const details = state.details as any;
        
        if (state.type === 'wifi') {
          // For WiFi, use signal strength
          const strength = details.strength;
          if (strength >= 80) {
            setConnectionQuality('excellent');
          } else if (strength >= 50) {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('poor');
          }
        } else if (state.type === 'cellular') {
          // For cellular, use cell signal strength
          const cellularGeneration = details.cellularGeneration;
          if (cellularGeneration === '4g' || cellularGeneration === '5g') {
            setConnectionQuality('excellent');
          } else if (cellularGeneration === '3g') {
            setConnectionQuality('good');
          } else {
            setConnectionQuality('poor');
          }
        } else {
          setConnectionQuality('good');
        }
      } else {
        setConnectionQuality('good');
      }
    });
    
    return unsubscribe;
  }, []);

  return {
    isOnline,
    connectionType,
    connectionQuality,
    isInternetReachable,
    isWifi: connectionType === 'wifi',
    isCellular: connectionType === 'cellular',
    isEthernet: connectionType === 'ethernet',
    getConnectionStrength: () => {
      if (!isOnline) return 0;
      switch (connectionQuality) {
        case 'excellent': return 100;
        case 'good': return 75;
        case 'poor': return 25;
        default: return 50;
      }
    },
    getQualityColor: () => {
      switch (connectionQuality) {
        case 'excellent': return '#10b981'; // green
        case 'good': return '#f59e0b'; // yellow
        case 'poor': return '#ef4444'; // red
        default: return '#6b7280'; // gray
      }
    }
  };
}