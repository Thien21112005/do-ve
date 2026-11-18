import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  Switch,
  Alert,
  AppState,
  Linking,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme, layout, radii } from '@/theme';
import { useSettings } from '@/store/settings';
import { STRINGS } from '@/lib/strings';
import { Segmented, ListRow, SectionHeader } from '@/components/ui';
import {
  requestNotificationPermission,
  hasNotificationPermission,
} from '@/services/reminderNotification';

export default function SettingsScreen() {
  const { colors } = useTheme();
  const [settings, updateSettings] = useSettings();

  // Synchronize reminder setting with actual OS permission on mount and foreground return (T09.44)
  useEffect(() => {
    let isMounted = true;

    const verifyPermission = async () => {
      if (!settings.reminderEnabled) return;
      const granted = await hasNotificationPermission();
      if (!isMounted) return;
      if (!granted) {
        updateSettings({ reminderEnabled: false });
        Alert.alert(
          STRINGS.settings.reminderPermissionRevokedTitle,
          STRINGS.settings.reminderPermissionRevokedMsg,
          [
            { text: STRINGS.settings.close, style: 'cancel' },
            {
              text: STRINGS.settings.openSettings,
              onPress: () => Linking.openSettings().catch(() => {}),
            },
          ],
        );
      }
    };

    verifyPermission();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        verifyPermission();
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [settings.reminderEnabled, updateSettings]);

  const handleToggleReminder = async (targetValue: boolean) => {
    if (targetValue) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          STRINGS.settings.reminderPermissionDeniedTitle,
          STRINGS.settings.reminderPermissionDeniedMsg,
          [
            { text: STRINGS.settings.close, style: 'cancel' },
            {
              text: STRINGS.settings.openSettings,
              onPress: () => Linking.openSettings().catch(() => {}),
            },
          ],
        );
        return;
      }
      updateSettings({ reminderEnabled: true });
    } else {
      updateSettings({ reminderEnabled: false });
    }
  };

  const webSwitchProps =
    Platform.OS === 'web' ? { activeThumbColor: colors.onPrimary } : {};

  return (
    <SafeAreaView
      testID="settings-screen"
      edges={['bottom']}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }}
        className="flex-1"
      >
        {/* 1. Hiển thị (Giao diện, Thứ tự bảng, Cỡ chữ lớn) */}
        <SectionHeader title={STRINGS.settings.appearanceSection} />
        <View
          style={[
            styles.groupBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ListRow
            testID="settings-theme-row"
            title={STRINGS.settings.themeModeTitle}
            subtitle={STRINGS.settings.themeSystemDesc}
            footer={
              <Segmented
                testID="settings-theme-segmented"
                selectedKey={settings.themeMode || 'system'}
                onChange={(key) =>
                  updateSettings({
                    themeMode: key as 'system' | 'light' | 'dark',
                  })
                }
                options={[
                  {
                    key: 'system',
                    label: STRINGS.settings.themeSystem,
                    testID: 'settings-theme-system',
                  },
                  {
                    key: 'light',
                    label: STRINGS.settings.themeLightShort,
                    testID: 'settings-theme-light',
                  },
                  {
                    key: 'dark',
                    label: STRINGS.settings.themeDarkShort,
                    testID: 'settings-theme-dark',
                  },
                ]}
              />
            }
          />

          <ListRow
            testID="settings-draw-order-row"
            title={STRINGS.settings.drawTableOrderTitle}
            subtitle={STRINGS.settings.drawTableOrderDesc}
            footer={
              <Segmented
                testID="settings-draw-order-segmented"
                selectedKey={settings.drawTableOrder || 'g8_to_special'}
                onChange={(key) =>
                  updateSettings({ drawTableOrder: key as any })
                }
                options={[
                  {
                    key: 'g8_to_special',
                    label: STRINGS.settings.drawTableOrderG8First,
                    testID: 'settings-draw-order-g8-first',
                  },
                  {
                    key: 'special_to_g8',
                    label: STRINGS.settings.drawTableOrderSpecialFirst,
                    testID: 'settings-draw-order-special-first',
                  },
                ]}
              />
            }
          />

          <ListRow
            testID="settings-font-scale-row"
            title="Cỡ chữ lớn"
            subtitle="Tự động theo cài đặt Cỡ chữ của điện thoại (hỗ trợ tới 200%)"
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* 2. Dò vé (Tự dò khi đủ 6 số, Rung, Hiệu ứng trúng) */}
        <SectionHeader title="Dò vé" />
        <View
          style={[
            styles.groupBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ListRow
            title={STRINGS.settings.autoSubmitTitle}
            subtitle={STRINGS.settings.autoSubmitDesc}
            trailing={
              <Switch
                testID="settings-autosubmit-switch"
                accessibilityRole="switch"
                accessibilityLabel={STRINGS.settings.autoSubmitTitle}
                value={settings.autoSubmitEnabled}
                onValueChange={(val) =>
                  updateSettings({ autoSubmitEnabled: val })
                }
                {...({
                  onPress: () =>
                    updateSettings({
                      autoSubmitEnabled: !settings.autoSubmitEnabled,
                    }),
                  ...webSwitchProps,
                } as any)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  settings.autoSubmitEnabled
                    ? colors.onPrimary
                    : colors.surfaceElevated
                }
              />
            }
          />

          <ListRow
            title={STRINGS.settings.hapticsTitle}
            subtitle={STRINGS.settings.hapticsDesc}
            trailing={
              <Switch
                testID="settings-haptics-switch"
                accessibilityRole="switch"
                accessibilityLabel={STRINGS.settings.hapticsTitle}
                value={settings.hapticsEnabled}
                onValueChange={(val) => updateSettings({ hapticsEnabled: val })}
                {...({
                  onPress: () =>
                    updateSettings({
                      hapticsEnabled: !settings.hapticsEnabled,
                    }),
                  ...webSwitchProps,
                } as any)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  settings.hapticsEnabled
                    ? colors.onPrimary
                    : colors.surfaceElevated
                }
              />
            }
          />

          <ListRow
            title={STRINGS.settings.celebrationTitle}
            subtitle={STRINGS.settings.celebrationDesc}
            style={{ borderBottomWidth: 0 }}
            trailing={
              <Switch
                testID="settings-celebration-switch"
                accessibilityRole="switch"
                accessibilityLabel={STRINGS.settings.celebrationTitle}
                value={settings.celebrationEnabled}
                onValueChange={(val) =>
                  updateSettings({ celebrationEnabled: val })
                }
                {...({
                  onPress: () =>
                    updateSettings({
                      celebrationEnabled: !settings.celebrationEnabled,
                    }),
                  ...webSwitchProps,
                } as any)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  settings.celebrationEnabled
                    ? colors.onPrimary
                    : colors.surfaceElevated
                }
              />
            }
          />
        </View>

        {/* 3. Nhắc nhở */}
        <SectionHeader title="Nhắc nhở" />
        <View
          style={[
            styles.groupBox,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ListRow
            title={STRINGS.settings.reminderTitle}
            subtitle={STRINGS.settings.reminderDesc}
            style={{ borderBottomWidth: 0 }}
            trailing={
              <Switch
                testID="settings-reminder-switch"
                accessibilityRole="switch"
                accessibilityLabel={STRINGS.settings.reminderTitle}
                value={settings.reminderEnabled}
                onValueChange={handleToggleReminder}
                {...({
                  onPress: () =>
                    handleToggleReminder(!settings.reminderEnabled),
                  ...webSwitchProps,
                } as any)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={
                  settings.reminderEnabled
                    ? colors.onPrimary
                    : colors.surfaceElevated
                }
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  groupBox: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
});
