import React from 'react';
import {
  View,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { Button } from './ui/Button';
import { Text } from './ui/Text';
import { useTheme } from '../theme';
import { isVersionOutdated, CURRENT_APP_VERSION } from '../lib/version';
import { STRINGS } from '../lib/strings';
import type { AppConfigResponse } from '../types';

export const DEFAULT_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=vn.lottery.dove';
export const DEFAULT_APP_STORE_URL =
  'https://apps.apple.com/app/dove-do-ve-so/id6470000000';

/**
 * Returns the destination store URL for forced app update (T09.51).
 * Uses backend provided storeUrl when available, otherwise falls back to real Play Store / App Store URLs.
 */
export function getStoreUpdateUrl(config?: AppConfigResponse | null): string {
  if (config?.storeUrl && config.storeUrl.trim().length > 0) {
    return config.storeUrl.trim();
  }
  return Platform.OS === 'ios' ? DEFAULT_APP_STORE_URL : DEFAULT_PLAY_STORE_URL;
}

export interface AppVersionGateProps {
  config?: AppConfigResponse | null;
  currentVersion?: string;
  onUpdate?: () => void;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const AppVersionGate: React.FC<AppVersionGateProps> = ({
  config,
  currentVersion = CURRENT_APP_VERSION,
  onUpdate,
  onRetry,
  children,
}) => {
  const { colors } = useTheme();

  const isMaintenance = Boolean(config?.maintenance);
  const isOutdated = Boolean(
    config?.minSupportedVersion &&
      isVersionOutdated(currentVersion, config.minSupportedVersion),
  );

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    } else {
      const targetUrl = getStoreUpdateUrl(config);
      Linking.openURL(targetUrl).catch(() => {});
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Underlying navigation tree is ALWAYS preserved to prevent state loss (T09.52) */}
      {children}

      {/* Case 1: Maintenance Mode Overlay */}
      {isMaintenance && (
        <View
          testID="maintenance-screen"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.background, zIndex: 9999 },
          ]}
        >
          <SafeAreaView className="flex-1 items-center justify-center p-6">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4 border"
              style={{
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              }}
            >
              <Icon name="clock" size={32} color={colors.pending} />
            </View>

            <Text
              className="text-xl font-bold text-center mb-2"
              style={{
                color: colors.textMain,
                fontFamily: 'BeVietnamPro-Bold',
              }}
            >
              {STRINGS.gate.maintenanceTitle}
            </Text>

            <Text
              className="text-sm text-center leading-relaxed mb-6 px-4"
              style={{
                color: colors.textMuted,
                fontFamily: 'BeVietnamPro-Regular',
              }}
            >
              {config?.message || STRINGS.gate.maintenanceDefaultMsg}
            </Text>

            {onRetry && (
              <Button
                testID="maintenance-retry-btn"
                variant="primary"
                size="md"
                title={STRINGS.common.retry}
                icon={<Icon name="refresh" size={16} color={colors.onPrimary} />}
                onPress={onRetry}
              />
            )}
          </SafeAreaView>
        </View>
      )}

      {/* Case 2: Outdated App Version Overlay */}
      {!isMaintenance && isOutdated && (
        <View
          testID="update-required-screen"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: colors.background, zIndex: 9999 },
          ]}
        >
          <SafeAreaView className="flex-1 items-center justify-center p-6">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-4 border"
              style={{
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              }}
            >
              <Icon name="alertCircle" size={32} color={colors.primary} />
            </View>

            <Text
              className="text-xl font-bold text-center mb-2"
              style={{
                color: colors.textMain,
                fontFamily: 'BeVietnamPro-Bold',
              }}
            >
              {STRINGS.gate.updateTitle}
            </Text>

            <View
              className="px-3 py-1 rounded-full border mb-4"
              style={{
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-xs font-semibold text-center"
                style={{
                  color: colors.primary,
                  fontFamily: 'BeVietnamPro-SemiBold',
                }}
              >
                Phiên bản {currentVersion} • Yêu cầu tối thiểu{' '}
                {config?.minSupportedVersion}
              </Text>
            </View>

            <Text
              className="text-sm text-center leading-relaxed mb-6 px-4"
              style={{
                color: colors.textMuted,
                fontFamily: 'BeVietnamPro-Regular',
              }}
            >
              {config?.message || STRINGS.gate.updateRequiredMsg}
            </Text>

            <Button
              testID="update-app-btn"
              variant="primary"
              size="md"
              title={STRINGS.gate.updateBtn}
              icon={<Icon name="chevronRight" size={16} color={colors.onPrimary} />}
              onPress={handleUpdate}
            />
          </SafeAreaView>
        </View>
      )}
    </View>
  );
};
