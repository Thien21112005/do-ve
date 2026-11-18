import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from './Text';
import { usePressed } from './usePressed';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';

export type BannerVariant = 'info' | 'warning' | 'error' | 'success';

export interface BannerProps {
  message: string;
  variant?: BannerVariant;
  title?: string;
  icon?: React.ReactNode;
  actionText?: string;
  actionTestID?: string;
  onAction?: () => void;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function Banner({
  message,
  variant = 'info',
  title,
  icon,
  actionText,
  actionTestID,
  onAction,
  testID,
  style,
}: BannerProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  let bgColor = colors.primaryTint;
  let borderColor = colors.primary;
  let textColor = colors.primary;

  if (variant === 'warning') {
    bgColor = colors.pendingTint;
    borderColor = colors.pendingBorder;
    textColor = colors.pending;
  } else if (variant === 'error') {
    bgColor = colors.errorTint;
    borderColor = colors.error;
    textColor = colors.error;
  } else if (variant === 'success') {
    bgColor = colors.winTint;
    borderColor = colors.winBorder;
    textColor = colors.win;
  }

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderColor,
        },
        style,
      ]}
    >
      <View
        accessible={true}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={styles.content}
      >
        {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
        <View style={styles.textContainer}>
          {title ? (
            <Text
              variant="bodyStrong"
              color={textColor}
              style={styles.title}
            >
              {title}
            </Text>
          ) : null}
          <Text
            variant="caption"
            color={colors.textMain}
            style={styles.message}
          >
            {message}
          </Text>
        </View>
      </View>

      {actionText && onAction ? (
        <Pressable
          testID={actionTestID}
          accessibilityRole="button"
          accessibilityLabel={actionText}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={onAction}
          {...pressHandlers}
          style={[
            styles.actionButton,
            {
              borderColor,
              backgroundColor: colors.surface,
              opacity: pressed ? 0.75 : 1,
            },
          ]}
        >
          <Text
            variant="caption"
            color={textColor}
            style={styles.actionText}
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
    borderWidth: 1,
    marginVertical: 6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 10,
    marginTop: 2,
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
    marginTop: 10,
    alignSelf: 'flex-end',
    minHeight: 36,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontFamily: 'BeVietnamPro-SemiBold',
  },
});
