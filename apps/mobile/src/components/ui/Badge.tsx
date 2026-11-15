import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';

export type BadgeVariant = 'win' | 'pending' | 'loss' | 'neutral' | 'special';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, variant = 'neutral', style }: BadgeProps) {
  const { colors } = useTheme();

  let bgColor = colors.surfaceSubtle;
  let textColor = colors.textMuted;
  let borderColor = colors.border;

  if (variant === 'win') {
    bgColor = colors.winTint;
    textColor = colors.win;
    borderColor = colors.winBorder;
  } else if (variant === 'pending') {
    bgColor = colors.pendingTint;
    textColor = colors.pending;
    borderColor = colors.pendingBorder;
  } else if (variant === 'special') {
    bgColor = colors.specialTint;
    textColor = colors.special;
    borderColor = colors.special;
  } else if (variant === 'loss') {
    bgColor = colors.lossBg;
    textColor = colors.loss;
    borderColor = colors.lossBorder;
  }

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderColor,
        },
        style,
      ]}
    >
      <Text
        variant="caption"
        style={[
          styles.text,
          {
            color: textColor,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 12,
    lineHeight: 16,
  },
});
