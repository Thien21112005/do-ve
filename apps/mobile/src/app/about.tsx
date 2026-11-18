import React from 'react';
import { View, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Perforation, usePressed } from '@/components/ui';
import { useTheme, layout, radii } from '@/theme';
import { STRINGS } from '@/lib/strings';
import { getAppVersion, getBuildNumber } from '@/lib/version';
import { haptics } from '@/lib/haptics';

function ContactLinkRow({
  testID,
  label,
  value,
  a11yLabel,
  isLast = false,
  onPress,
}: {
  testID: string;
  label: string;
  value: string;
  a11yLabel: string;
  isLast?: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="link"
      accessibilityLabel={a11yLabel}
      onPress={onPress}
      {...pressHandlers}
      style={[
        styles.contactRow,
        {
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
          opacity: pressed ? 0.72 : 1,
        },
      ]}
    >
      <Text variant="caption" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="bodyStrong" color={colors.primary}>
        {value}
      </Text>
    </Pressable>
  );
}

export default function AboutScreen() {
  const { colors } = useTheme();
  const appVersion = getAppVersion();
  const buildNumber = getBuildNumber();

  const handleOpenEmail = () => {
    haptics.selection?.();
    Linking.openURL(`mailto:${STRINGS.about.contactEmail}`).catch(() => {});
  };

  const handleOpenWebsite = () => {
    haptics.selection?.();
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
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 40,
          width: '100%',
          maxWidth: layout.contentMaxWidth,
          alignSelf: 'center',
        }}
        className="flex-1 px-4 pt-4"
      >
        {/* Clean Editorial Masthead */}
        <View style={styles.masthead}>
          <View style={styles.mastheadTop}>
            <Text variant="headline" color={colors.textMain}>
              {STRINGS.about.appName}
            </Text>
            <View
              testID="about-version-badge"
              style={[
                styles.versionPill,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text variant="caption" color={colors.textMain}>
                {STRINGS.about.versionLabel} {appVersion} (Build {buildNumber})
              </Text>
            </View>
          </View>
          <Text
            variant="body"
            color={colors.textMuted}
            style={styles.tagline}
          >
            {STRINGS.about.tagline}
          </Text>
          <Perforation style={styles.perforation} />
        </View>

        {/* Disclaimer Section - Flat without card border (T10.55, T11.47) */}
        <View
          testID="about-disclaimer-card"
          style={[styles.proseSection, { borderWidth: 0 }]}
        >
          <Text
            variant="title"
            color={colors.textMain}
            style={styles.sectionHeading}
          >
            {STRINGS.about.disclaimerHeader}
          </Text>
          <Text
            variant="body"
            color={colors.textMuted}
            style={styles.proseText}
          >
            {STRINGS.about.disclaimerText}
          </Text>
        </View>

        {/* Data Source Section - Flat without card border */}
        <View
          testID="about-datasource-card"
          style={[styles.proseSection, { borderWidth: 0 }]}
        >
          <Text
            variant="title"
            color={colors.textMain}
            style={styles.sectionHeading}
          >
            {STRINGS.about.dataSourceHeader}
          </Text>
          <Text
            variant="body"
            color={colors.textMuted}
            style={styles.proseText}
          >
            {STRINGS.about.dataSourceText}
          </Text>
        </View>

        {/* Privacy Section - Flat without card border */}
        <View
          testID="about-privacy-card"
          style={[styles.proseSection, { borderWidth: 0 }]}
        >
          <Text
            variant="title"
            color={colors.textMain}
            style={styles.sectionHeading}
          >
            {STRINGS.about.privacyHeader}
          </Text>
          <Text
            variant="body"
            color={colors.textMuted}
            style={styles.proseText}
          >
            {STRINGS.about.privacyText}
          </Text>
        </View>

        {/* Contact & Support Section */}
        <Text
          variant="title"
          color={colors.textMain}
          style={styles.contactHeader}
        >
          {STRINGS.about.contactHeader}
        </Text>
        <View
          testID="about-contact-card"
          style={[
            styles.contactCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <ContactLinkRow
            testID="about-contact-email"
            label="Email hỗ trợ"
            value={STRINGS.about.contactEmail}
            a11yLabel={`Email hỗ trợ: ${STRINGS.about.contactEmail}`}
            onPress={handleOpenEmail}
          />
          <ContactLinkRow
            testID="about-contact-website"
            label="Trang thông tin"
            value={STRINGS.about.contactWebsite}
            a11yLabel={`Trang thông tin: ${STRINGS.about.contactWebsite}`}
            isLast={true}
            onPress={handleOpenWebsite}
          />
        </View>

        {/* Footer */}
        <Text
          variant="caption"
          align="center"
          color={colors.textMuted}
          style={styles.copyright}
        >
          {STRINGS.about.copyright}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  masthead: {
    marginBottom: 8,
  },
  mastheadTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  versionPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  tagline: {
    marginTop: 4,
  },
  perforation: {
    marginTop: 14,
  },
  proseSection: {
    marginBottom: 20,
  },
  sectionHeading: {
    marginBottom: 6,
  },
  proseText: {
    lineHeight: 23,
  },
  contactHeader: {
    marginBottom: 8,
  },
  contactCard: {
    borderWidth: 1,
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  copyright: {
    paddingHorizontal: 12,
    lineHeight: 18,
  },
});
