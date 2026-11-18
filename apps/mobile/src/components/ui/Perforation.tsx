import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { useTheme } from '@/theme';

export interface PerforationProps {
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Subtle 1px dashed tear-line motif inspired by paper lottery ticket stubs (T11.27).
 * Decorative only — hidden from screen readers.
 */
export function Perforation({ style, testID = 'perforation' }: PerforationProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      accessible={false}
      accessibilityElementsHidden={true}
      importantForAccessibility="no-hide-descendants"
      style={[styles.container, style]}
    >
      <Svg height="2" width="100%">
        <Line
          x1="0"
          y1="1"
          x2="100%"
          y2="1"
          stroke={colors.border}
          strokeWidth="1"
          strokeDasharray="6, 5"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 2,
    marginVertical: 12,
    justifyContent: 'center',
  },
});
