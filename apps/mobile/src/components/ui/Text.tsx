import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, StyleSheet } from 'react-native';
import { typeScale, type TextVariant } from '@/theme/tokens';
import { useTheme } from '@/theme';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

/**
 * Universal Typography Component for DoVe
 * Enforces Be Vietnam Pro font family and WCAG compliant type scale (T10.07).
 */
export function Text({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...props
}: TextProps) {
  const { colors } = useTheme();
  const token = typeScale[variant] || typeScale.body;

  const defaultColor =
    variant === 'caption'
      ? colors.textMuted
      : colors.textMain;

  return (
    <RNText
      style={[
        styles.base,
        {
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          fontFamily: token.fontFamily,
          color: color || defaultColor,
          textAlign: align,
          ...('letterSpacing' in token && token.letterSpacing ? { letterSpacing: token.letterSpacing } : {}),
          ...('fontVariant' in token && token.fontVariant ? { fontVariant: token.fontVariant } : {}),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: 'BeVietnamPro-Regular',
  },
});
