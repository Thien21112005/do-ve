import React from 'react';
import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps {
  message: string;
  variant?: BannerVariant;
  title?: string;
  icon?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function Banner({
  message,
  variant = 'info',
  title,
  icon,
  actionText,
  onAction,
  style,
}: BannerProps) {
  const { colors } = useTheme();

  let bgColor = colors.primaryTint;
  let borderColor = colors.primary;
  let textColor = colors.primary;

  if (variant === 'warning') {
    bgColor = colors.pendingTint;
    borderColor = colors.pending;
    textColor = colors.pending;
  } else if (variant === 'error') {
    bgColor = colors.errorTint;
    borderColor = colors.error;
    textColor = colors.error;
  } else if (variant === 'success') {
    bgColor = colors.winTint;
    borderColor = colors.win;
    textColor = colors.win;
  }

  return (
    <View
      accessible={true}
      accessibilityRole="alert"
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <View style={styles.textContainer}>
          {title ? (
            <Text
              variant="bodyStrong"
              style={[styles.title, { color: textColor }]}
            >
              {title}
            </Text>
          ) : null}
          <Text
            variant="caption"
            style={[styles.message, { color: colors.textMain }]}
          >
            {message}
          </Text>
        </View>
      </View>

      {actionText && onAction ? (
        <Pressable
          accessibilityRole="button"
          onPress={onAction}
          style={styles.actionButton}
        >
          <Text
            variant="caption"
            style={[styles.actionText, { color: textColor }]}
          >
            {actionText}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: radii.md,
    borderLeftWidth: 4,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 1,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
  },
  message: {
    lineHeight: 18,
  },
  actionButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontFamily: 'BeVietnamPro-Bold',
  },
});
