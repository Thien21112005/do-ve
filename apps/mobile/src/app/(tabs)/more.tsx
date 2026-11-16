import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon, ListRow } from '@/components';
import { useTheme } from '@/theme';
import { STRINGS } from '@/lib/strings';
import { CURRENT_APP_VERSION } from '@/lib/version';

export default function MoreScreen() {
  const { colors } = useTheme();
  const router = useRouter();

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
        <Text className="text-xs mb-4" style={{ color: colors.textMuted }}>
          {STRINGS.more.subtitle}
        </Text>

        {/* Section 1: Tiện ích */}
        <Text
          className="text-xs font-semibold tracking-wider mb-2 px-1 uppercase"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.more.sectionUtilities}
        </Text>
        <View
          className="rounded-2xl border overflow-hidden mb-6"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <ListRow
            testID="more-menu-schedule"
            title={STRINGS.more.scheduleTitle}
            subtitle={STRINGS.more.scheduleDesc}
            icon={<Icon name="calendar" size={20} color={colors.textMain} />}
            showChevron={true}
            onPress={() => router.push('/schedule')}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Section 2: Ứng dụng */}
        <Text
          className="text-xs font-semibold tracking-wider mb-2 px-1 uppercase"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.more.sectionApp}
        </Text>
        <View
          className="rounded-2xl border overflow-hidden mb-8"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <ListRow
            testID="more-menu-settings"
            title={STRINGS.more.settingsTitle}
            subtitle={STRINGS.more.settingsDesc}
            icon={<Icon name="settings" size={20} color={colors.textMain} />}
            showChevron={true}
            onPress={() => router.push('/settings')}
          />
          <ListRow
            testID="more-menu-about"
            title={STRINGS.more.aboutTitle}
            subtitle={STRINGS.more.aboutDesc}
            icon={<Icon name="info" size={20} color={colors.textMain} />}
            showChevron={true}
            onPress={() => router.push('/about')}
            style={{ borderBottomWidth: 0 }}
          />
        </View>

        {/* Privacy Notice & Single-line Version Footer */}
        <View className="items-center px-4 mt-auto">
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
            testID="more-version-footer"
            className="text-xs text-center font-medium"
            style={{ color: colors.textMuted }}
          >
            DoVe phiên bản {CURRENT_APP_VERSION} · Dò vé số kiến thiết miền Nam
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
