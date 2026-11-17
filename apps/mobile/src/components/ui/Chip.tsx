import React from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';
import { usePressed } from './usePressed';

export interface ChipProps extends Omit<PressableProps, 'style'> {
  label: string;
  selected?: boolean;
  count?: number;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  enableHaptics?: boolean;
}

export function Chip({
  label,
  selected = false,
  count,
  icon,
  style,
  labelStyle,
  enableHaptics = true,
  onPress,
  ...props
}: ChipProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  const handlePress = (e: any) => {
    if (enableHaptics) {
      haptics.selection();
    }
    onPress?.(e);
  };

  const bgColor = selected ? colors.primary : colors.surface;
  const textColor = selected ? colors.onPrimary : colors.textMain;
  const borderColor = selected ? colors.primary : colors.border;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={handlePress}
      {...pressHandlers}
      style={[
        styles.base,
        {
          backgroundColor: bgColor,
          borderColor,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        style,
      ]}
      {...props}
    >
      {icon ? <>{icon}</> : null}
      <Text
        variant="caption"
        style={[
          styles.label,
          {
            color: textColor,
            fontFamily: selected ? 'BeVietnamPro-SemiBold' : 'BeVietnamPro-Medium',
          },
          icon ? styles.labelWithIcon : null,
          labelStyle,
        ]}
      >
        {label}
      </Text>
      {typeof count === 'number' && (
        <Text
          variant="caption"
          style={[
            styles.count,
            {
              color: selected ? colors.onPrimary : colors.textMuted,
            },
          ]}
        >
          {count}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    minHeight: 36,
  },
  label: {
    textAlign: 'center',
  },
  labelWithIcon: {
    marginLeft: 6,
  },
  count: {
    marginLeft: 6,
  },
});
