import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export interface DividerProps {
  style?: StyleProp<ViewStyle>;
  vertical?: boolean;
  testID?: string;
}

export function Divider({ style, vertical = false, testID = 'divider' }: DividerProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      style={[
        vertical ? styles.vertical : styles.horizontal,
        { backgroundColor: colors.border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  vertical: {
    width: StyleSheet.hairlineWidth,
    height: '100%',
  },
});
