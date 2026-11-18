import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import { Icon } from './Icon';
import { Text, usePressed } from './ui';
import { useNetworkStatus } from '@/hooks';
import { STRINGS } from '@/lib';

export interface OfflineBannerProps {
  isOffline?: boolean;
  onRetry?: () => void;
  message?: string;
  testID?: string;
}

export function OfflineBanner({
  isOffline,
  onRetry,
  message = STRINGS.common.offlineMessage,
  testID = 'offline-banner',
}: OfflineBannerProps) {
  const { colors } = useTheme();
  const netStatus = useNetworkStatus();
  const { pressed, pressHandlers } = usePressed();

  const activeOffline =
    isOffline !== undefined ? isOffline : netStatus.isOffline;

  if (!activeOffline) {
    return null;
  }

  return (
    <View
      testID="offline-banner-strip"
      style={[
        styles.strip,
        {
          backgroundColor: colors.pendingTint,
          borderBottomColor: colors.pendingBorder,
        },
      ]}
    >
      <View
        testID={testID}
        accessible={true}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={styles.alertContent}
      >
        <Icon name="alertCircle" size={15} color={colors.pending} />
        <Text
          variant="caption"
          color={colors.pending}
          numberOfLines={2}
          style={styles.message}
        >
          {message}
        </Text>
      </View>

      {onRetry ? (
        <Pressable
          testID="offline-banner-retry-btn"
          onPress={onRetry}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel={STRINGS.common.retry}
          {...pressHandlers}
          style={[
            styles.retryBtn,
            {
              borderColor: colors.pendingBorder,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
        >
          <Icon name="refresh" size={12} color={colors.pending} />
          <Text
            variant="caption"
            color={colors.pending}
            style={styles.retryText}
          >
            {STRINGS.common.retry}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  message: {
    marginLeft: 6,
    flex: 1,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  retryText: {
    marginLeft: 4,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
});
