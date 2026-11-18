import React from 'react';
import { View, Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { usePressed } from './usePressed';
import { useTheme, layout } from '@/theme';
import { elevations, radii } from '@/theme/tokens';
import { haptics } from '@/lib/haptics';

export interface SnackbarProps {
  visible: boolean;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Floating undo/feedback bar using inverse ink surface and toast elevation (T11.27).
 */
export function Snackbar({
  visible,
  message,
  actionLabel,
  onAction,
  style,
  testID = 'snackbar',
}: SnackbarProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  if (!visible) return null;

  return (
    <View
      testID={testID}
      accessibilityLiveRegion="polite"
      style={[
        styles.container,
        { backgroundColor: colors.textMain },
        elevations.toast,
        style,
      ]}
    >
      <Text
        variant="body"
        color={colors.textInverse}
        numberOfLines={2}
        style={styles.message}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => {
            haptics.selection();
            onAction();
          }}
          {...pressHandlers}
          style={[styles.actionBtn, { opacity: pressed ? 0.75 : 1 }]}
        >
          <Text
            variant="bodyStrong"
            color={colors.textInverse}
            style={[styles.actionText, { borderBottomColor: colors.textInverse }]}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 20,
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: radii.md,
  },
  message: {
    flex: 1,
    marginRight: 12,
  },
  actionBtn: {
    minHeight: 36,
    paddingHorizontal: 6,
    justifyContent: 'center',
  },
  actionText: {
    borderBottomWidth: 1.5,
  },
});
