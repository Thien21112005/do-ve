import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
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

  const themeOptions: {
    mode: 'system' | 'light' | 'dark';
    testID: string;
    title: string;
    desc: string;
  }[] = [
    {
      mode: 'system',
      testID: 'settings-theme-system',
      title: STRINGS.settings.themeSystem,
      desc: STRINGS.settings.themeSystemDesc,
    },
    {
      mode: 'light',
      testID: 'settings-theme-light',
      title: STRINGS.settings.themeLight,
      desc: STRINGS.settings.themeLightDesc,
    },
    {
      mode: 'dark',
      testID: 'settings-theme-dark',
      title: STRINGS.settings.themeDark,
      desc: STRINGS.settings.themeDarkDesc,
    },
  ];

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
          {themeOptions.map((opt, index) => {
            const isSelected = settings.themeMode === opt.mode;
            const isLast = index === themeOptions.length - 1;
            return (
              <Pressable
                key={opt.mode}
                testID={opt.testID}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={opt.title}
                onPress={() => updateSettings({ themeMode: opt.mode })}
                className="p-4 flex-row items-center border-b active:opacity-75"
                style={{
                  borderColor: colors.border,
                  borderBottomWidth: isLast ? 0 : 1,
                  backgroundColor: isSelected
                    ? `${colors.primary}0D`
                    : colors.surface,
                }}
              >
                <View className="flex-1 mr-3">
                  <Text
                    className="text-base font-semibold mb-0.5"
                    style={{
                      color: isSelected ? colors.primary : colors.textMain,
                    }}
                  >
                    {opt.title}
                  </Text>
                  <Text
                    className="text-xs leading-relaxed"
                    style={{ color: colors.textMuted }}
                  >
                    {opt.desc}
                  </Text>
                </View>
                <View
                  className="w-6 h-6 rounded-full border items-center justify-center"
                  style={{
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                  }}
                >
                  {isSelected && (
                    <View className="w-2.5 h-2.5 rounded-full bg-white" />
                  )}
                </View>
              </Pressable>
            );
          })}
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
          {/* Celebration toggle */}
          <Pressable
            testID="settings-celebration-switch"
            accessibilityRole="switch"
            accessibilityState={{ checked: settings.celebrationEnabled }}
            accessibilityLabel={STRINGS.settings.celebrationTitle}
            onPress={() =>
              updateSettings({ celebrationEnabled: !settings.celebrationEnabled })
            }
            className="p-4 flex-row items-center border-b justify-between active:opacity-80"
            style={{
              borderColor: colors.border,
              borderBottomWidth: 1,
            }}
          >
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-semibold mb-0.5"
                style={{ color: colors.textMain }}
              >
                {STRINGS.settings.celebrationTitle}
              </Text>
              <Text
                className="text-xs leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.settings.celebrationDesc}
              </Text>
            </View>
            <Switch
              testID="celebration-switch-visual"
              accessible={false}
              pointerEvents="none"
              value={settings.celebrationEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </Pressable>

          {/* Haptics toggle */}
          <Pressable
            testID="settings-haptics-switch"
            accessibilityRole="switch"
            accessibilityState={{ checked: settings.hapticsEnabled }}
            accessibilityLabel={STRINGS.settings.hapticsTitle}
            onPress={() =>
              updateSettings({ hapticsEnabled: !settings.hapticsEnabled })
            }
            className="p-4 flex-row items-center border-b justify-between active:opacity-80"
            style={{
              borderColor: colors.border,
              borderBottomWidth: 1,
            }}
          >
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-semibold mb-0.5"
                style={{ color: colors.textMain }}
              >
                {STRINGS.settings.hapticsTitle}
              </Text>
              <Text
                className="text-xs leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.settings.hapticsDesc}
              </Text>
            </View>
            <Switch
              testID="haptics-switch-visual"
              accessible={false}
              pointerEvents="none"
              value={settings.hapticsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </Pressable>

          {/* Reminder toggle */}
          <Pressable
            testID="settings-reminder-switch"
            accessibilityRole="switch"
            accessibilityState={{ checked: settings.reminderEnabled }}
            accessibilityLabel={STRINGS.settings.reminderTitle}
            onPress={() =>
              handleToggleReminder(!settings.reminderEnabled)
            }
            className="p-4 flex-row items-center justify-between active:opacity-80"
          >
            <View className="flex-1 mr-3">
              <Text
                className="text-base font-semibold mb-0.5"
                style={{ color: colors.textMain }}
              >
                {STRINGS.settings.reminderTitle}
              </Text>
              <Text
                className="text-xs leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.settings.reminderDesc}
              </Text>
            </View>
            <Switch
              testID="reminder-switch-visual"
              accessible={false}
              pointerEvents="none"
              value={settings.reminderEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

