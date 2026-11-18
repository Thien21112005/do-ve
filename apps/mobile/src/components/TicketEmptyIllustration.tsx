import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Line } from 'react-native-svg';
import { useTheme } from '@/theme';

export interface TicketEmptyIllustrationProps {
  size?: number;
  testID?: string;
}

const DIGIT_BOX_X = [26, 36, 46, 56, 66, 76];

/**
 * Fine-line paper lottery ticket illustration using semantic theme tokens (T11.44).
 * Zero hard-coded hex colors, zero decorative sparkles/glows.
 */
export function TicketEmptyIllustration({
  size = 104,
  testID = 'tickets-empty-illustration',
}: TicketEmptyIllustrationProps) {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel="Minh họa tờ vé số chưa có vé"
      style={styles.wrap}
    >
      <Svg width={size} height={size} viewBox="0 0 112 112" fill="none">
        {/* Main paper ticket outline */}
        <Rect
          x="18"
          y="22"
          width="76"
          height="68"
          rx="8"
          fill={colors.surface}
          stroke={colors.border}
          strokeWidth="1.25"
        />

        {/* Subtle printed header rule */}
        <Rect
          x="28"
          y="31"
          width="28"
          height="3.5"
          rx="1.75"
          fill={colors.special}
          opacity={0.75}
        />
        <Rect
          x="64"
          y="31"
          width="18"
          height="3.5"
          rx="1.75"
          fill={colors.border}
        />

        {/* Left & Right tear perforation notches */}
        <Path
          d="M 18 46 A 4 4 0 0 1 18 54 Z"
          fill={colors.background}
          stroke={colors.border}
          strokeWidth="1.25"
        />
        <Path
          d="M 94 46 A 4 4 0 0 0 94 54 Z"
          fill={colors.background}
          stroke={colors.border}
          strokeWidth="1.25"
        />

        {/* Dashed tear perforation line */}
        <Line
          x1="24"
          y1="50"
          x2="88"
          y2="50"
          stroke={colors.border}
          strokeWidth="1"
          strokeDasharray="3 3"
        />

        {/* 6 tabular digit slots */}
        {DIGIT_BOX_X.map((x) => (
          <Rect
            key={x}
            x={x}
            y="60"
            width="8"
            height="13"
            rx="2"
            fill={colors.surfaceSubtle}
            stroke={colors.border}
            strokeWidth="1"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
});
