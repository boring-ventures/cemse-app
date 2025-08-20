import { useState, useEffect } from 'react';
// Note: @react-native-community/netinfo needs to be installed
// For now, we'll mock the network status

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isWifiEnabled?: boolean;
}

interface UseNetworkStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  networkStatus: NetworkStatus;
  connectionType: string;
}

export function useNetworkStatus(): UseNetworkStatusReturn {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    // Mock network status - assume connected
    // In production, install @react-native-community/netinfo
    setNetworkStatus({
      isConnected: true,
      isInternetReachable: true,
      type: 'cellular',
      isWifiEnabled: false,
    });

    // TODO: Implement real network monitoring when package is installed
    // const unsubscribe = NetInfo.addEventListener(state => { ... });
    // return unsubscribe;
  }, []);

  const isOnline = networkStatus.isConnected && networkStatus.isInternetReachable;
  const isOffline = !isOnline;

  return {
    isOnline,
    isOffline,
    networkStatus,
    connectionType: networkStatus.type,
  };
}