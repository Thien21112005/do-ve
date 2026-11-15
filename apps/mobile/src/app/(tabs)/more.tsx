import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components';
import { useTheme } from '@/theme';
import { STRINGS } from '@/lib/strings';
import { CURRENT_APP_VERSION } from '@/lib/version';

export default function MoreScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const menuItems = [
    {
      testID: 'more-menu-schedule',
      title: STRINGS.more.scheduleTitle,
      subtitle: STRINGS.more.scheduleDesc,
      icon: 'calendar' as const,
      onPress: () => router.push('/schedule'),
    },
    {
      testID: 'more-menu-settings',
      title: STRINGS.more.settingsTitle,
      subtitle: STRINGS.more.settingsDesc,
      icon: 'settings' as const,
      onPress: () => router.push('/settings'),
    },
    {
      testID: 'more-menu-about',
      title: STRINGS.more.aboutTitle,
      subtitle: STRINGS.more.aboutDesc,
      icon: 'info' as const,
      onPress: () => router.push('/about'),
    },
  ];

  return (
    <SafeAreaView
      testID="more-screen"
      edges={['bottom']}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-4"
      >
        <Text
          className="text-2xl font-bold mb-1"
          style={{ color: colors.textMain }}
        >
          {STRINGS.more.screenTitle}
        </Text>
        <Text className="text-xs mb-5" style={{ color: colors.textMuted }}>
          {STRINGS.more.subtitle}
        </Text>

        <View
          className="rounded-2xl border overflow-hidden shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {menuItems.map((item, index) => {
            const isLast = index === menuItems.length - 1;
            return (
              <Pressable
                key={item.testID}
                testID={item.testID}
                accessibilityRole="button"
                accessibilityLabel={item.title}
                onPress={item.onPress}
                className="p-4 flex-row items-center border-b active:opacity-70"
                style={{
                  borderColor: colors.border,
                  borderBottomWidth: isLast ? 0 : 1,
                }}
              >
                <View
                  className="w-10 h-10 rounded-xl items-center justify-center mr-3.5"
                  style={{ backgroundColor: `${colors.primary}1A` }}
                >
                  <Icon name={item.icon} size={20} color={colors.primary} />
                </View>
                <View className="flex-1 mr-2">
                  <Text
                    className="text-base font-bold mb-0.5"
                    style={{ color: colors.textMain }}
                  >
                    {item.title}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>
                    {item.subtitle}
                  </Text>
                </View>
                <Icon name="chevronRight" size={18} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </View>

        {/* Privacy & Disclaimer Note */}
        <View className="mt-8 px-2 items-center">
          <View
            testID="more-privacy-notice"
            className="flex-row items-center justify-center py-2 px-3 rounded-xl mb-3"
            style={{ backgroundColor: `${colors.border}30` }}
          >
            <Icon name="info" size={13} color={colors.textMuted} />
            <Text
              className="text-xs font-medium ml-1.5"
              style={{ color: colors.textMuted }}
            >
              {STRINGS.more.privacyNotice}
            </Text>
          </View>
          <Text
            className="text-xs text-center leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.more.copyright}
          </Text>
          <Text
            className="text-xs mt-2 font-medium"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.more.versionPrefix} {CURRENT_APP_VERSION}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

