import {
  QueryClient,
  onlineManager,
  focusManager,
} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { ApiError } from '@/api';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false; // Do not retry client 4xx errors
          }
          return failureCount < 2;
        },
        refetchOnWindowFocus: Platform.OS === 'web',
        refetchOnReconnect: true,
      },
    },
  });
}

export const queryClient = createQueryClient();

export function setupNetworkAndFocusManagement(): () => void {
  // 1. Online manager integration with NetInfo
  const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
    const isOnline = Boolean(
      state.isConnected &&
      (state.isInternetReachable === null || state.isInternetReachable),
    );
    onlineManager.setOnline(isOnline);
  });

  // 2. Focus manager integration with AppState (foreground refetch)
  const appStateSubscription = AppState.addEventListener(
    'change',
    (status: AppStateStatus) => {
      if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
      }
    },
  );

  return () => {
    unsubscribeNetInfo();
    appStateSubscription.remove();
  };
}
