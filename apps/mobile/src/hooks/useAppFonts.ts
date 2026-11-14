import {
  useFonts,
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';

export function useAppFonts() {
  return useFonts({
    'BeVietnamPro-Regular': BeVietnamPro_400Regular,
    'BeVietnamPro-Medium': BeVietnamPro_500Medium,
    'BeVietnamPro-SemiBold': BeVietnamPro_600SemiBold,
    'BeVietnamPro-Bold': BeVietnamPro_700Bold,
  });
}
