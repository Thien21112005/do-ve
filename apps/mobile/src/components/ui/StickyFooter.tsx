import React, { useContext } from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useTheme, layout } from '@/theme';
import { elevations } from '@/theme/tokens';

const ZERO_INSETS = { top: 0, right: 0, bottom: 0, left: 0 };

export interface StickyFooterProps extends ViewProps {
  children: React.ReactNode;
  testID?: string;
}

/**
 * Safe-area aware bottom action bar with `sheet` elevation (T11.27).
 * Centers inner content to `layout.contentMaxWidth` on tablets/foldables.
 */
export function StickyFooter({
  children,
  style,
  testID = 'sticky-footer',
  ...props
}: StickyFooterProps) {
  const { colors } = useTheme();
  const insets = useContext(SafeAreaInsetsContext) ?? ZERO_INSETS;

  return (
    <View
      testID={testID}
      style={[
        styles.outer,
        {
          backgroundColor: colors.surfaceElevated,
          paddingBottom: Math.max(insets.bottom, 10),
        },
        elevations.sheet,
        style,
      ]}
      {...props}
    >
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  inner: {
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
});
