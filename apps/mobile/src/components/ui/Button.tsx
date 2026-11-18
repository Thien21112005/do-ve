import React from 'react';
import {
  Pressable,
  ActivityIndicator,
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

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  enableHaptics?: boolean;
}

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  titleStyle,
  enableHaptics = true,
  onPress,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();
  const isDisabled = disabled || loading;

  const handlePress = (e: any) => {
    if (isDisabled) return;
    if (enableHaptics) {
      haptics.selection?.();
    }
    onPress?.(e);
  };

  // Determine variant styling
  let bgColor = colors.primary;
  let textColor = colors.onPrimary;
  let borderColor = 'transparent';

  if (variant === 'secondary') {
    bgColor = colors.surface;
    textColor = colors.textMain;
    borderColor = colors.border;
  } else if (variant === 'ghost') {
    bgColor = 'transparent';
    textColor = colors.primary;
    borderColor = 'transparent';
  } else if (variant === 'destructive') {
    bgColor = colors.error;
    textColor = colors.textInverse;
    borderColor = 'transparent';
  }

  const height = size === 'lg' ? 52 : 44;
  const paddingHorizontal = size === 'lg' ? 24 : 16;
  const textVariant = size === 'lg' ? 'bodyStrong' : 'bodyStrong';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={handlePress}
      {...pressHandlers}
      style={[
        styles.base,
        {
          height,
          paddingHorizontal,
          backgroundColor: bgColor,
          borderColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.98 : 1 }],
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon ? <>{icon}</> : null}
          <Text
            variant={textVariant}
            style={[
              styles.text,
              { color: textColor },
              icon ? styles.textWithIcon : null,
              titleStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    minHeight: 44, // WCAG minimum touch target
  },
  text: {
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
