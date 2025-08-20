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
import { useNetworkSync } from '@/app/hooks/useNetworkSync';

interface NetworkStatusProps {
  onSyncPress?: () => Promise<void>;
}

/**
 * Network Status Component
 * Shows online/offline status and pending sync count
 * Provides manual sync button when offline updates are pending
 */

const NetworkStatus: React.FC<NetworkStatusProps> = ({ onSyncPress }) => {
  const { isOnline, pendingUpdates, forceSync } = useNetworkSync();
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
    if (syncing) return 'Syncing changes...';
    if (!isOnline) return 'Offline - Changes will sync when online';
    if (pendingUpdates.length > 0) {
      return `${pendingUpdates.length} change${pendingUpdates.length > 1 ? 's' : ''} pending sync`;
    }
    return 'All changes synced';
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
        </View>
        
        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
          
          {!isOnline && (
            <Text style={[styles.subText, { color: textColor, opacity: 0.7 }]}>
              Your changes are saved locally and will sync automatically when you're back online
            </Text>
          )}
        </View>
        
        {isOnline && pendingUpdates.length > 0 && !syncing && (
          <Pressable
            style={[styles.syncButton, { borderColor: getStatusColor() }]}
            onPress={handleSync}
          >
            <Ionicons name="sync-outline" size={16} color={getStatusColor()} />
            <Text style={[styles.syncButtonText, { color: getStatusColor() }]}>
              Sync Now
            </Text>
          </Pressable>
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
});

export default NetworkStatus;