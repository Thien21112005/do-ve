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

export interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
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
  showChevron = false,
  onPress,
  style,
  destructive = false,
  testID,
  accessibilityLabel,
}: ListRowProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    if (!onPress) return;
    haptics.selection();
    onPress();
  };

  const titleColor = destructive ? colors.error : colors.textMain;

  return (
    <Pressable
      testID={testID}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel || title}
      disabled={!onPress}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          opacity: pressed && onPress ? 0.75 : 1,
        },
        style,
      ]}
    >
      {icon ? <View style={styles.iconContainer}>{icon}</View> : null}

      <View style={styles.content}>
        <Text variant="body" style={{ color: titleColor, fontFamily: 'BeVietnamPro-Medium' }}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" style={[styles.subtitle, { color: colors.textMuted }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}

      {showChevron ? (
        <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48, // Standard touch target
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  chevron: {
    fontSize: 22,
    lineHeight: 22,
    marginLeft: 8,
    fontWeight: '300',
  },
});
