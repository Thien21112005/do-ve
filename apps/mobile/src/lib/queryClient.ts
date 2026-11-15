import {
  QueryClient,
  onlineManager,
  focusManager,
} from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { ApiError } from '@/api';
import { CURRENT_APP_VERSION } from './version';

export const QUERY_STORAGE_KEY = 'dove.querycache.v1';
export const QUERY_CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days cache for offline viewing
export const API_SCHEMA_VERSION = '2026.11-v2';
export const QUERY_CACHE_BUSTER = `${CURRENT_APP_VERSION}-${API_SCHEMA_VERSION}`;

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: QUERY_STORAGE_KEY,
  throttleTime: 1000,
});

export function setupQueryClientPersistence(
  client: QueryClient = queryClient,
  persister = asyncStoragePersister,
  buster = QUERY_CACHE_BUSTER,
): [() => void, Promise<void>] {
  const [unsubscribe, restorePromise] = persistQueryClient({
    queryClient: client,
    persister,
    maxAge: QUERY_CACHE_MAX_AGE,
    buster,
  });
  return [unsubscribe, restorePromise];
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
        retry: (failureCount, error) => {
          if (failureCount >= 2) {
            return false;
          }
          if (error instanceof ApiError) {
            // T09.25: Explicitly retry transient timeout and network errors
            if (error.code === 'TIMEOUT_ERROR' || error.status === 408) {
              return true;
            }
            if (error.code === 'NETWORK_ERROR' || error.status === 0) {
              return true;
            }
            // Do not retry 429 (rate limited) or other client 4xx errors
            if (error.status >= 400 && error.status < 500) {
              return false;
            }
            // Server 5xx errors are retried
            return true;
          }
          return true;
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
