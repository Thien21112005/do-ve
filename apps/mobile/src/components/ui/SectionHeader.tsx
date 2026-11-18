import React from 'react';
import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { usePressed } from './usePressed';

export interface SectionHeaderProps {
  title: string;
  actionText?: string;
  onAction?: () => void;
  actionTestID?: string;
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({
  title,
  actionText,
  onAction,
  actionTestID,
  style,
}: SectionHeaderProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  return (
    <View style={[styles.container, style]}>
      <Text
        variant="caption"
        style={[
          styles.title,
          { color: colors.textMuted },
        ]}
      >
        {title.toUpperCase()}
      </Text>

      {actionText && onAction ? (
        <Pressable
          testID={actionTestID}
          accessibilityRole="button"
          accessibilityLabel={actionText}
          onPress={onAction}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          {...pressHandlers}
          style={{ opacity: pressed ? 0.7 : 1 }}
        >
          <Text
            variant="caption"
            style={[
              styles.action,
              { color: colors.primary },
            ]}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontFamily: 'BeVietnamPro-SemiBold',
    letterSpacing: 0.8,
  },
  action: {
    fontFamily: 'BeVietnamPro-Medium',
  },
});
