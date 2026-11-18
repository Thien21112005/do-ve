import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components';
import { Text, ListRow, SectionHeader } from '@/components/ui';
import { useTheme, layout, radii } from '@/theme';
import { STRINGS } from '@/lib/strings';
import { CURRENT_APP_VERSION } from '@/lib/version';

export default function MoreScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView
      testID="more-screen"
      edges={['bottom']}
      className="flex-1 bg-background"
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
        {/* Section 1: Tiện ích */}
        <SectionHeader title={STRINGS.more.sectionUtilities} />
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
        <SectionHeader title={STRINGS.more.sectionApp} />
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
        <View style={styles.footerArea}>
          <View
            testID="more-privacy-notice"
            style={[
              styles.privacyPill,
              { backgroundColor: colors.surfaceSubtle },
            ]}
          >
            <Icon name="info" size={13} color={colors.textMuted} />
            <Text
              variant="caption"
              color={colors.textMuted}
              style={styles.privacyText}
            >
              {STRINGS.more.privacyNotice}
            </Text>
          </View>
          <Text
            testID="more-version-footer"
            variant="caption"
            align="center"
            color={colors.textMuted}
          >
            DoVe phiên bản {CURRENT_APP_VERSION} · Dò vé số kiến thiết miền Nam
          </Text>
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
  footerArea: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 'auto',
    paddingTop: 28,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    marginBottom: 12,
  },
  privacyText: {
    marginLeft: 6,
  },
});
