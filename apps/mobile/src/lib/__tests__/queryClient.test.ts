import {
  createQueryClient,
  setupNetworkAndFocusManagement,
} from '../queryClient';
import { onlineManager, focusManager } from '@tanstack/react-query';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { AppState, type AppStateStatus } from 'react-native';
import { ApiError } from '@/api';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
}));

describe('TanStack Query & Network Configuration', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('creates queryClient with correct cache and retry policy', () => {
    const client = createQueryClient();
    const defaultOptions = client.getDefaultOptions().queries;

    expect(defaultOptions?.staleTime).toBe(1000 * 60 * 5);
    expect(defaultOptions?.gcTime).toBe(1000 * 60 * 60 * 24);

    const retryFn = defaultOptions?.retry as (
      failureCount: number,
      error: unknown,
    ) => boolean;

    // Should not retry 4xx errors
    const clientError = new ApiError({
      status: 400,
      code: 'INVALID_TICKET',
    });
    expect(retryFn(0, clientError)).toBe(false);

    // Should retry network or 5xx errors up to 2 times
    const serverError = new ApiError({ status: 500 });
    expect(retryFn(0, serverError)).toBe(true);
    expect(retryFn(1, serverError)).toBe(true);
    expect(retryFn(2, serverError)).toBe(false);
  });

  it('connects onlineManager to NetInfo events', () => {
    let netInfoCallback: (state: Partial<NetInfoState>) => void = () => {};
    const mockUnsubscribe = jest.fn();

    (NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
      netInfoCallback = cb;
      return mockUnsubscribe;
    });

    const setOnlineSpy = jest.spyOn(onlineManager, 'setOnline');
    const cleanup = setupNetworkAndFocusManagement();

    // Simulate going offline
    netInfoCallback({ isConnected: false, isInternetReachable: false });
    expect(setOnlineSpy).toHaveBeenCalledWith(false);

    // Simulate going online
    netInfoCallback({ isConnected: true, isInternetReachable: true });
    expect(setOnlineSpy).toHaveBeenCalledWith(true);

    cleanup();
    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  it('connects focusManager to AppState change events', () => {
    let appStateCallback: (status: AppStateStatus) => void = () => {};
    const mockRemove = jest.fn();

    jest.spyOn(AppState, 'addEventListener').mockImplementation((_, cb) => {
      appStateCallback = cb;
      return { remove: mockRemove } as any;
    });

    const setFocusedSpy = jest.spyOn(focusManager, 'setFocused');
    const cleanup = setupNetworkAndFocusManagement();

    // App goes to background
    appStateCallback('background');
    expect(setFocusedSpy).toHaveBeenCalledWith(false);

    // App returns to foreground (active)
    appStateCallback('active');
    expect(setFocusedSpy).toHaveBeenCalledWith(true);

    cleanup();
    expect(mockRemove).toHaveBeenCalled();
  });
});
