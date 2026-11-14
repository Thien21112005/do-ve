import { renderHook } from '@testing-library/react-native';
import { useNetworkStatus } from '../useNetworkStatus';
import NetInfo from '@react-native-community/netinfo';

describe('useNetworkStatus hook', () => {
  it('returns online status when connected', async () => {
    (NetInfo.useNetInfo as jest.Mock).mockReturnValue({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
    });

    const { result } = await renderHook(() => useNetworkStatus());

    expect(result.current.isConnected).toBe(true);
    expect(result.current.isOffline).toBe(false);
  });

  it('returns isOffline=true when disconnected', async () => {
    (NetInfo.useNetInfo as jest.Mock).mockReturnValue({
      isConnected: false,
      isInternetReachable: false,
      type: 'none',
    });

    const { result } = await renderHook(() => useNetworkStatus());

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isOffline).toBe(true);
  });
});
