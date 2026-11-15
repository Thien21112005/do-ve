import React from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';

export interface IconButtonProps extends Omit<PressableProps, 'style'> {
  icon: React.ReactNode;
  accessibilityLabel: string;
  size?: number; // Visual size (default: 40)
  variant?: 'ghost' | 'surface' | 'primary';
  style?: StyleProp<ViewStyle>;
  enableHaptics?: boolean;
}

export function IconButton({
  icon,
  accessibilityLabel,
  size = 40,
  variant = 'ghost',
  disabled = false,
  style,
  enableHaptics = true,
  onPress,
  ...props
}: IconButtonProps) {
  const { colors } = useTheme();

  const handlePress = (e: any) => {
    if (disabled) return;
    if (enableHaptics) {
      haptics.selection();
    }
    onPress?.(e);
  };

  let bgColor = 'transparent';
  let borderColor = 'transparent';

  if (variant === 'surface') {
    bgColor = colors.surface;
    borderColor = colors.border;
  } else if (variant === 'primary') {
    bgColor = colors.primary;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => [
        styles.base,
        {
          width: Math.max(size, 44),
          height: Math.max(size, 44),
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'surface' ? 1 : 0,
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
          transform: [{ scale: pressed && !disabled ? 0.95 : 1 }],
        },
        style,
      ]}
      {...props}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.full,
    minWidth: 44, // WCAG touch target
    minHeight: 44,
  },
});
