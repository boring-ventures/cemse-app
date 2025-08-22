import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from 'react-native-reanimated';

import { ThemedText } from '@/app/components/ThemedText';
import { useThemeColor } from '@/app/hooks/useThemeColor';
import { useNetworkSync, useNetworkStatus } from '@/app/hooks/useNetworkSync';

interface NetworkStatusProps {
  onSyncPress?: () => Promise<void>;
}

/**
 * Network Status Component
 * Shows online/offline status and pending sync count
 * Provides manual sync button when offline updates are pending
 */

const NetworkStatus: React.FC<NetworkStatusProps> = ({ onSyncPress }) => {
  const { 
    isOnline, 
    pendingUpdates, 
    forceSync, 
    emergencyStop,
    retryAttempts, 
    syncInProgress, 
    getNextRetryDelay, 
    canRetry 
  } = useNetworkSync();
  const { 
    connectionType, 
    connectionQuality, 
    getConnectionStrength, 
    getQualityColor 
  } = useNetworkStatus();
  const [syncing, setSyncing] = React.useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const successColor = '#10b981';
  const warningColor = '#f59e0b';
  const errorColor = '#ef4444';

  // Animation for sync icon
  const rotation = useSharedValue(0);
  
  React.useEffect(() => {
    if (syncing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [syncing, rotation]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  // Handle manual sync
  const handleSync = async () => {
    if (!isOnline || pendingUpdates.length === 0) return;
    
    setSyncing(true);
    try {
      await forceSync();
      if (onSyncPress) {
        await onSyncPress();
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Handle emergency stop
  const handleEmergencyStop = async () => {
    setSyncing(true);
    try {
      await emergencyStop();
      console.log('Emergency stop executed successfully');
    } catch (error) {
      console.error('Emergency stop failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Don't render if online and no pending updates
  if (isOnline && pendingUpdates.length === 0) {
    return null;
  }

  const getStatusColor = () => {
    if (!isOnline) return errorColor;
    if (pendingUpdates.length > 0) return warningColor;
    return successColor;
  };

  const getStatusIcon = () => {
    if (syncing) return 'sync-outline';
    if (!isOnline) return 'cloud-offline-outline';
    if (pendingUpdates.length > 0) return 'cloud-upload-outline';
    return 'cloud-done-outline';
  };

  const getStatusText = () => {
    if (syncInProgress || syncing) return 'Syncing changes...';
    if (!isOnline) return 'Offline - Changes will sync when online';
    if (pendingUpdates.length > 0) {
      const retryText = retryAttempts > 0 ? ` (retry ${retryAttempts}/3)` : '';
      return `${pendingUpdates.length} change${pendingUpdates.length > 1 ? 's' : ''} pending sync${retryText}`;
    }
    return 'All changes synced';
  };

  const getConnectionInfo = () => {
    if (!isOnline) return null;
    
    const typeMap = {
      wifi: 'WiFi',
      cellular: 'Mobile',
      ethernet: 'Ethernet',
      unknown: 'Unknown'
    };
    
    const qualityMap = {
      excellent: 'Excellent',
      good: 'Good', 
      poor: 'Poor'
    };
    
    return `${typeMap[connectionType as keyof typeof typeMap] || 'Unknown'} • ${qualityMap[connectionQuality]} signal`;
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() + '15' }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Animated.View style={animatedStyle}>
            <Ionicons 
              name={getStatusIcon()} 
              size={20} 
              color={getStatusColor()} 
            />
          </Animated.View>
          
          {/* Connection quality indicator */}
          {isOnline && (
            <View style={styles.qualityIndicator}>
              <View 
                style={[
                  styles.qualityBar, 
                  { 
                    width: `${getConnectionStrength()}%`, 
                    backgroundColor: getQualityColor() 
                  }
                ]} 
              />
            </View>
          )}
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          
          {isOnline && getConnectionInfo() && (
            <Text style={[styles.subText, { color: getQualityColor(), opacity: 0.8 }]}>
              {getConnectionInfo()}
            </Text>
          )}
          
          {!isOnline && (
            <Text style={[styles.subText, { color: textColor, opacity: 0.7 }]}>
              Your changes are saved locally and will sync automatically when you're back online
            </Text>
          )}
          
          {retryAttempts > 0 && !canRetry() && (
            <Text style={[styles.subText, { color: errorColor, opacity: 0.8 }]}>
              Sync failed after {retryAttempts} attempts. Will retry automatically when connection improves.
            </Text>
          )}
        </View>
        
        {isOnline && pendingUpdates.length > 0 && !syncing && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.syncButton, { borderColor: getStatusColor() }]}
              onPress={handleSync}
            >
              <Ionicons name="sync-outline" size={16} color={getStatusColor()} />
              <Text style={[styles.syncButtonText, { color: getStatusColor() }]}>
                Sync Now
              </Text>
            </Pressable>
            
            {/* Emergency stop button for stuck syncs */}
            {(retryAttempts >= 2 || pendingUpdates.length > 50) && (
              <Pressable
                style={[styles.emergencyButton, { borderColor: errorColor }]}
                onPress={handleEmergencyStop}
              >
                <Ionicons name="stop-outline" size={16} color={errorColor} />
                <Text style={[styles.emergencyButtonText, { color: errorColor }]}>
                  Stop
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    gap: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qualityIndicator: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 1,
  },
  qualityBar: {
    height: '100%',
    borderRadius: 1,
    minWidth: 2,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subText: {
    fontSize: 12,
    lineHeight: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  syncButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  emergencyButtonText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default NetworkStatus;