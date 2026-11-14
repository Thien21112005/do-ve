import { renderHook } from '@testing-library/react-native';
import { useAppFonts } from '../useAppFonts';
import * as GoogleFonts from '@expo-google-fonts/be-vietnam-pro';

jest.mock('@expo-google-fonts/be-vietnam-pro', () => ({
  useFonts: jest.fn(),
  BeVietnamPro_400Regular: 1,
  BeVietnamPro_500Medium: 2,
  BeVietnamPro_600SemiBold: 3,
  BeVietnamPro_700Bold: 4,
}));

describe('useAppFonts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls useFonts with Be Vietnam Pro weights', async () => {
    (GoogleFonts.useFonts as jest.Mock).mockReturnValue([true, null]);

    const { result } = await renderHook(() => useAppFonts());

    expect(GoogleFonts.useFonts).toHaveBeenCalledWith({
      'BeVietnamPro-Regular': 1,
      'BeVietnamPro-Medium': 2,
      'BeVietnamPro-SemiBold': 3,
      'BeVietnamPro-Bold': 4,
    });
    expect(result.current).toEqual([true, null]);
  });

  it('handles loading state properly', async () => {
    (GoogleFonts.useFonts as jest.Mock).mockReturnValue([false, null]);

    const { result } = await renderHook(() => useAppFonts());
    expect(result.current[0]).toBe(false);
  });
});
