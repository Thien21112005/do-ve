import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { radii, elevations } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';

export interface CardProps extends ViewProps {
  variant?: 'surface' | 'sunken' | 'elevated';
  radius?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Disciplined Card component for DoVe.
 * Direction A: Flat surface on warm paper background with clean border (T10.08, T10.09).
 */
export function Card({
  variant = 'surface',
  radius = 'md',
  bordered = true,
  onPress,
  style,
  children,
  ...props
}: CardProps) {
  const { colors } = useTheme();

  let bgColor = colors.surface;
  if (variant === 'sunken') {
    bgColor = colors.surfaceSunken;
  } else if (variant === 'elevated') {
    bgColor = colors.surfaceElevated;
  }

  const borderRadius = radii[radius] || radii.md;
  const elevationStyle = variant === 'elevated' ? elevations.sheet : elevations.none;

  const cardStyle = [
    styles.base,
    {
      backgroundColor: bgColor,
      borderRadius,
      borderColor: bordered ? colors.border : 'transparent',
      borderWidth: bordered ? 1 : 0,
      ...elevationStyle,
    },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          haptics.selection();
          onPress();
        }}
        style={({ pressed }) => [
          cardStyle,
          {
            opacity: pressed ? 0.92 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    overflow: 'hidden',
  },
});
