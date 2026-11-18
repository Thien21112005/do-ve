import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { haptics } from '@/lib/haptics';
import { usePressed } from './usePressed';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Optional control rendered below the main row line (e.g. Segmented control). */
  footer?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  destructive?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export function ListRow({
  title,
  subtitle,
  icon,
  trailing,
  footer,
  showChevron = false,
  onPress,
  style,
  destructive = false,
  testID,
  accessibilityLabel,
}: ListRowProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  const handlePress = () => {
    if (!onPress) return;
    haptics.selection?.();
    onPress();
  };

  const titleColor = destructive ? colors.error : colors.textMain;

  const innerContent = (
    <>
      <View style={styles.mainRow}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

        <View style={styles.content}>
          <Text
            variant="body"
            style={{ color: titleColor, fontFamily: 'BeVietnamPro-Medium' }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              variant="caption"
              style={[styles.subtitle, { color: colors.textMuted }]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {trailing ? <View style={styles.trailing}>{trailing}</View> : null}

        {showChevron ? (
          <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
        ) : null}
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  // When non-interactive (e.g. row holding a Switch or Segmented control),
  // render a plain View without accessible=true so child controls stay
  // directly focusable by TalkBack/VoiceOver (T11.45).
  if (!onPress) {
    return (
      <View
        testID={testID}
        accessible={false}
        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
          style,
        ]}
      >
        {innerContent}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      onPress={handlePress}
      {...pressHandlers}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      {innerContent}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 52,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginTop: 2,
  },
  trailing: {
    marginLeft: 12,
  },
  footer: {
    marginTop: 10,
  },
  chevron: {
    fontSize: 22,
    lineHeight: 22,
    marginLeft: 8,
    fontWeight: '300',
  },
});
