import React from 'react';
import { View, Text, ScrollView, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components';
import { useTheme } from '@/theme';
import { STRINGS } from '@/lib/strings';
import { getAppVersion, getBuildNumber } from '@/lib/version';
import { haptics } from '@/lib/haptics';

export default function AboutScreen() {
  const { colors } = useTheme();
  const appVersion = getAppVersion();
  const buildNumber = getBuildNumber();

  const handleOpenEmail = () => {
    haptics.selection();
    Linking.openURL(`mailto:${STRINGS.about.contactEmail}`).catch(() => {});
  };

  const handleOpenWebsite = () => {
    haptics.selection();
    Linking.openURL(STRINGS.about.contactWebsite).catch(() => {});
  };

  return (
    <SafeAreaView
      testID="about-screen"
      edges={['bottom']}
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
        className="flex-1 px-4 pt-4"
      >
        {/* App Branding Card */}
        <View
          className="rounded-2xl p-5 mb-6 border items-center shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
            style={{ backgroundColor: colors.primary }}
          >
            <Icon name="ticket" size={34} color="#ffffff" />
          </View>
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: colors.textMain }}
          >
            {STRINGS.about.appName}
          </Text>
          <Text
            className="text-xs text-center mb-3 font-medium"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.about.tagline}
          </Text>
          <View
            testID="about-version-badge"
            className="px-3 py-1 rounded-full border"
            style={{
              backgroundColor: `${colors.primary}15`,
              borderColor: `${colors.primary}30`,
            }}
          >
            <Text
              className="text-xs font-bold"
              style={{ color: colors.primary }}
            >
              {STRINGS.about.versionLabel} {appVersion} (Build {buildNumber})
            </Text>
          </View>
        </View>

        {/* Disclaimer Section - Flat without card border (T10.55) */}
        <View testID="about-disclaimer-card" className="mb-6 px-1" style={{ borderWidth: 0 }}>
          <View className="flex-row items-center mb-2">
            <Icon name="alertCircle" size={16} color="#d97706" />
            <Text
              className="text-sm font-semibold ml-2"
              style={{ color: colors.textMain }}
            >
              {STRINGS.about.disclaimerHeader}
            </Text>
          </View>
          <Text
            className="text-xs leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.about.disclaimerText}
          </Text>
        </View>

        {/* Data Source Section - Flat without card border (T10.55) */}
        <View testID="about-datasource-card" className="mb-6 px-1" style={{ borderWidth: 0 }}>
          <View className="flex-row items-center mb-2">
            <Icon name="checkCircle" size={16} color={colors.primary} />
            <Text
              className="text-sm font-semibold ml-2"
              style={{ color: colors.textMain }}
            >
              {STRINGS.about.dataSourceHeader}
            </Text>
          </View>
          <Text
            className="text-xs leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.about.dataSourceText}
          </Text>
        </View>

        {/* Privacy Section - Flat without card border (T10.55) */}
        <View testID="about-privacy-card" className="mb-6 px-1" style={{ borderWidth: 0 }}>
          <View className="flex-row items-center mb-2">
            <Icon name="bookmark" size={16} color={colors.primary} />
            <Text
              className="text-sm font-semibold ml-2"
              style={{ color: colors.textMain }}
            >
              {STRINGS.about.privacyHeader}
            </Text>
          </View>
          <Text
            className="text-xs leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.about.privacyText}
          </Text>
        </View>

        {/* Contact & Support Section (T10.55) */}
        <Text
          className="text-sm font-semibold mb-2 px-1"
          style={{ color: colors.textMain }}
        >
          {STRINGS.about.contactHeader}
        </Text>
        <View
          testID="about-contact-card"
          className="rounded-2xl border overflow-hidden mb-6 shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Pressable
            testID="about-contact-email"
            accessibilityRole="link"
            accessibilityLabel={`Email hỗ trợ: ${STRINGS.about.contactEmail}`}
            onPress={handleOpenEmail}
            className="flex-row items-center justify-between p-4 border-b active:opacity-75"
            style={{ borderColor: colors.border }}
          >
            <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>
              Email hỗ trợ:
            </Text>
            <Text className="text-xs font-bold" style={{ color: colors.primary }}>
              {STRINGS.about.contactEmail}
            </Text>
          </Pressable>

          <Pressable
            testID="about-contact-website"
            accessibilityRole="link"
            accessibilityLabel={`Trang thông tin: ${STRINGS.about.contactWebsite}`}
            onPress={handleOpenWebsite}
            className="flex-row items-center justify-between p-4 active:opacity-75"
          >
            <Text className="text-xs font-medium" style={{ color: colors.textMuted }}>
              Trang thông tin:
            </Text>
            <Text className="text-xs font-bold" style={{ color: colors.primary }}>
              {STRINGS.about.contactWebsite}
            </Text>
          </Pressable>
        </View>

        {/* Footer */}
        <Text
          className="text-xs text-center leading-relaxed px-4"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.about.copyright}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
