import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  AppState,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { useSettings } from '@/store/settings';
import { STRINGS } from '@/lib/strings';
import { Segmented } from '@/components/ui/Segmented';
import { ListRow } from '@/components/ui/ListRow';
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

  return (
    <SafeAreaView
      testID="settings-screen"
      edges={['bottom']}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-4"
      >
        {/* Appearance Section */}
        <Text
          className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.settings.appearanceSection}
        </Text>

        <View
          className="rounded-2xl border overflow-hidden mb-6 shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {/* Theme mode Segmented row (T10.54) */}
          <View
            testID="settings-theme-row"
            className="p-4 border-b"
            style={{
              borderColor: colors.border,
              borderBottomWidth: 1,
            }}
          >
            <View className="mb-2.5">
              <Text
                className="text-base font-semibold mb-0.5"
                style={{ color: colors.textMain }}
              >
                {STRINGS.settings.themeModeTitle}
              </Text>
              <Text
                className="text-xs leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.settings.themeSystemDesc}
              </Text>
            </View>
            <Segmented
              testID="settings-theme-segmented"
              selectedKey={settings.themeMode || 'system'}
              onChange={(key) =>
                updateSettings({ themeMode: key as 'system' | 'light' | 'dark' })
              }
              options={[
                {
                  key: 'system',
                  label: STRINGS.settings.themeSystem,
                  testID: 'settings-theme-system',
                },
                {
                  key: 'light',
                  label: 'Sáng',
                  testID: 'settings-theme-light',
                },
                {
                  key: 'dark',
                  label: 'Tối',
                  testID: 'settings-theme-dark',
                },
              ]}
            />
          </View>

          {/* Draw Table Order setting (T10.38) */}
          <View
            testID="settings-draw-order-row"
            className="p-4"
            style={{
              borderColor: colors.border,
            }}
          >
            <View className="mb-2.5">
              <Text
                className="text-base font-semibold mb-0.5"
                style={{ color: colors.textMain }}
              >
                {STRINGS.settings.drawTableOrderTitle}
              </Text>
              <Text
                className="text-xs leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.settings.drawTableOrderDesc}
              </Text>
            </View>
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
          </View>
        </View>

        {/* Experience Section */}
        <Text
          className="text-xs font-bold uppercase tracking-wider mb-2 px-1"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.settings.experienceSection}
        </Text>

        <View
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {/* Auto submit when 6 digits are typed (T10.54) */}
          <ListRow
            title={STRINGS.settings.autoSubmitTitle}
            subtitle={STRINGS.settings.autoSubmitDesc}
            trailing={
              <Switch
                testID="settings-autosubmit-switch"
                accessibilityRole="switch"
                accessibilityLabel={STRINGS.settings.autoSubmitTitle}
                value={settings.autoSubmitEnabled}
                onValueChange={(val) => updateSettings({ autoSubmitEnabled: val })}
                {...({ onPress: () => updateSettings({ autoSubmitEnabled: !settings.autoSubmitEnabled }) } as any)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />

          {/* Celebration toggle (T10.54) */}
          <ListRow
            title={STRINGS.settings.celebrationTitle}
            subtitle={STRINGS.settings.celebrationDesc}
            trailing={
              <Switch
                testID="settings-celebration-switch"
                accessibilityRole="switch"
                accessibilityLabel={STRINGS.settings.celebrationTitle}
                value={settings.celebrationEnabled}
                onValueChange={(val) => updateSettings({ celebrationEnabled: val })}
                {...({ onPress: () => updateSettings({ celebrationEnabled: !settings.celebrationEnabled }) } as any)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />

          {/* Haptics toggle (T10.54) */}
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
                {...({ onPress: () => updateSettings({ hapticsEnabled: !settings.hapticsEnabled }) } as any)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />

          {/* Reminder toggle (T10.54) */}
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
                {...({ onPress: () => handleToggleReminder(!settings.reminderEnabled) } as any)}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
