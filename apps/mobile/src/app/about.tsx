import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '@/components';
import { useTheme } from '@/theme';
import { STRINGS } from '@/lib/strings';
import { CURRENT_APP_VERSION, CURRENT_BUILD_NUMBER } from '@/lib/version';

export default function AboutScreen() {
  const { colors } = useTheme();

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
          className="rounded-2xl p-5 mb-5 border items-center shadow-sm"
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
              {STRINGS.about.versionLabel} {CURRENT_APP_VERSION} (Build{' '}
              {CURRENT_BUILD_NUMBER})
            </Text>
          </View>
        </View>

        {/* Disclaimer Section */}
        <Text
          className="text-xs font-bold mb-2 uppercase px-1"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.about.disclaimerHeader}
        </Text>
        <View
          testID="about-disclaimer-card"
          className="rounded-2xl p-4 mb-5 border shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-start mb-2">
            <View className="mt-0.5 mr-2">
              <Icon name="alertCircle" size={18} color="#d97706" />
            </View>
            <Text
              className="text-xs flex-1 leading-relaxed"
              style={{ color: colors.textMain }}
            >
              {STRINGS.about.disclaimerText}
            </Text>
          </View>
        </View>

        {/* Data Source Section */}
        <Text
          className="text-xs font-bold mb-2 uppercase px-1"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.about.dataSourceHeader}
        </Text>
        <View
          testID="about-datasource-card"
          className="rounded-2xl p-4 mb-5 border shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-start mb-2">
            <View className="mt-0.5 mr-2">
              <Icon name="checkCircle" size={18} color={colors.primary} />
            </View>
            <Text
              className="text-xs flex-1 leading-relaxed"
              style={{ color: colors.textMain }}
            >
              {STRINGS.about.dataSourceText}
            </Text>
          </View>
        </View>

        {/* Privacy Section */}
        <Text
          className="text-xs font-bold mb-2 uppercase px-1"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.about.privacyHeader}
        </Text>
        <View
          testID="about-privacy-card"
          className="rounded-2xl p-4 mb-5 border shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-start mb-2">
            <View className="mt-0.5 mr-2">
              <Icon name="bookmark" size={18} color={colors.primary} />
            </View>
            <Text
              className="text-xs flex-1 leading-relaxed"
              style={{ color: colors.textMain }}
            >
              {STRINGS.about.privacyText}
            </Text>
          </View>
        </View>

        {/* Contact & Support Section */}
        <Text
          className="text-xs font-bold mb-2 uppercase px-1"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.about.contactHeader}
        </Text>
        <View
          testID="about-contact-card"
          className="rounded-2xl p-4 mb-6 border shadow-sm"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <View className="flex-row items-center justify-between py-1.5 border-b" style={{ borderColor: colors.border }}>
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              Email hỗ trợ:
            </Text>
            <Text className="text-xs font-bold" style={{ color: colors.primary }}>
              {STRINGS.about.contactEmail}
            </Text>
          </View>
          <View className="flex-row items-center justify-between py-1.5 pt-2">
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              Trang thông tin:
            </Text>
            <Text className="text-xs font-bold" style={{ color: colors.primary }}>
              {STRINGS.about.contactWebsite}
            </Text>
          </View>
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

