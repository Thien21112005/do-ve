import { useNetInfo } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const netInfo = useNetInfo();

  const isConnected = netInfo.isConnected !== false;
  const isInternetReachable = netInfo.isInternetReachable ?? null;
  const isOffline = netInfo.isConnected === false;

  return {
    isConnected,
    isInternetReachable,
    isOffline,
  };
}
