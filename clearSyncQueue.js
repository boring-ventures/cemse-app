/**
 * Emergency script to clear stuck CV sync queue
 * Run this in the React Native debugger console or add it to your app temporarily
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const clearAllSyncQueues = async () => {
  try {
    console.log('🚨 EMERGENCY: Clearing all CV sync queues...');
    
    // Clear all possible queue storage keys
    const keysToRemove = [
      'cv_offline_queue',      // useNetworkSync queue
      'cv_data',               // useCV queue  
      'cover_letter_data',     // Cover letter cache
      'sync_retry_state'       // Any retry state
    ];
    
    await AsyncStorage.multiRemove(keysToRemove);
    
    console.log('✅ All sync queues cleared successfully');
    console.log('📊 Cleared keys:', keysToRemove);
    
    // Verify clearing
    const remaining = await AsyncStorage.multiGet(keysToRemove);
    const stillExists = remaining.filter(([key, value]) => value !== null);
    
    if (stillExists.length === 0) {
      console.log('✅ Verification successful - all queues are empty');
    } else {
      console.log('⚠️ Some items still exist:', stillExists);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to clear sync queues:', error);
    return false;
  }
};

// For immediate execution in debugger
if (typeof global !== 'undefined' && global.__DEV__) {
  global.clearAllSyncQueues = clearAllSyncQueues;
  console.log('🔧 Emergency function available as global.clearAllSyncQueues()');
}