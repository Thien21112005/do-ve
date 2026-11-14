import React from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from './Icon';
import { useTheme } from '../theme';
import { isVersionOutdated, CURRENT_APP_VERSION } from '../lib/version';
import type { AppConfigResponse } from '../types';

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

  // Case 1: Maintenance Mode
  if (config?.maintenance) {
    return (
      <SafeAreaView
        testID="maintenance-screen"
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: colors.background }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: `${colors.pending}1A` }}
        >
          <Icon name="clock" size={36} color={colors.pending} />
        </View>

        <Text
          className="text-xl font-bold text-center mb-2"
          style={{ color: colors.textMain }}
        >
          Hệ thống đang bảo trì
        </Text>

        <Text
          className="text-sm text-center leading-relaxed mb-6 px-4"
          style={{ color: colors.textMuted }}
        >
          {config.message ||
            'Hệ thống đang tạm ngừng dịch vụ để nâng cấp máy chủ. Quý khách vui lòng thử lại sau ít phút.'}
        </Text>

        {onRetry && (
          <Pressable
            testID="maintenance-retry-btn"
            accessibilityRole="button"
            accessibilityLabel="Thử lại kết nối"
            onPress={onRetry}
            className="py-3 px-6 rounded-xl flex-row items-center active:opacity-80"
            style={{ backgroundColor: colors.primary }}
          >
            <Icon name="refresh" size={16} color="#FFFFFF" />
            <Text className="text-white font-bold text-sm ml-2">Thử lại</Text>
          </Pressable>
        )}
      </SafeAreaView>
    );
  }

  // Case 2: Outdated App Version
  if (
    config?.minSupportedVersion &&
    isVersionOutdated(currentVersion, config.minSupportedVersion)
  ) {
    const handleUpdate = () => {
      if (onUpdate) {
        onUpdate();
      } else {
        // Default store link fallback
        Linking.openURL('https://dove.lottery.vn/update').catch(() => {});
      }
    };

    return (
      <SafeAreaView
        testID="update-required-screen"
        className="flex-1 items-center justify-center p-6"
        style={{ backgroundColor: colors.background }}
      >
        <View
          className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
          style={{ backgroundColor: `${colors.primary}1A` }}
        >
          <Icon name="alertCircle" size={36} color={colors.primary} />
        </View>

        <Text
          className="text-xl font-bold text-center mb-1"
          style={{ color: colors.textMain }}
        >
          Cần cập nhật ứng dụng
        </Text>

        <Text
          className="text-xs font-semibold text-center mb-3"
          style={{ color: colors.primary }}
        >
          Phiên bản {currentVersion} • Yêu cầu tối thiểu{' '}
          {config.minSupportedVersion}
        </Text>

        <Text
          className="text-sm text-center leading-relaxed mb-6 px-4"
          style={{ color: colors.textMuted }}
        >
          {config.message ||
            'Phiên bản bạn đang sử dụng không còn được hỗ trợ. Vui lòng cập nhật phiên bản mới nhất để tiếp tục sử dụng đầy đủ các tính năng.'}
        </Text>

        <Pressable
          testID="update-app-btn"
          accessibilityRole="button"
          accessibilityLabel="Cập nhật ứng dụng ngay"
          onPress={handleUpdate}
          className="py-3 px-6 rounded-xl flex-row items-center active:opacity-80 shadow-sm"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="text-white font-bold text-sm mr-1">
            Cập nhật ngay
          </Text>
          <Icon name="chevronRight" size={16} color="#FFFFFF" />
        </Pressable>
      </SafeAreaView>
    );
  }

  // Case 3: Normal operating condition
  return <>{children}</>;
};
