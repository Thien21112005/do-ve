import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { Icon } from './Icon';
import { useNetworkStatus } from '@/hooks';

export interface OfflineBannerProps {
  isOffline?: boolean;
  onRetry?: () => void;
  message?: string;
  testID?: string;
}

export function OfflineBanner({
  isOffline,
  onRetry,
  message = 'Không có kết nối mạng. Vui lòng kiểm tra lại.',
  testID = 'offline-banner',
}: OfflineBannerProps) {
  const { colors } = useTheme();
  const netStatus = useNetworkStatus();

  // If prop provided, use it; otherwise use hook
  const activeOffline =
    isOffline !== undefined ? isOffline : netStatus.isOffline;

  if (!activeOffline) {
    return null;
  }

  return (
    <View
      testID={testID}
      className="mx-4 my-2 px-3.5 py-2.5 rounded-xl border flex-row items-center justify-between"
      style={{
        backgroundColor: colors.pendingBg,
        borderColor: colors.pendingBorder,
      }}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <View className="flex-row items-center flex-1 mr-2">
        <Icon name="alertCircle" size={18} color={colors.pending} />
        <Text
          className="ml-2 text-xs font-medium flex-1"
          style={{ color: colors.pending }}
          numberOfLines={2}
        >
          {message}
        </Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          testID="offline-banner-retry-btn"
          onPress={onRetry}
          className="px-2.5 py-1 rounded-lg border flex-row items-center"
          style={{
            borderColor: colors.pending,
            backgroundColor: `${colors.pending}15`,
          }}
          accessibilityRole="button"
          accessibilityLabel="Thử kết nối lại"
        >
          <Icon name="refresh" size={13} color={colors.pending} />
          <Text
            className="ml-1 text-xs font-semibold"
            style={{ color: colors.pending }}
          >
            Thử lại
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
