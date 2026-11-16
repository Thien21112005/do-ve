import React from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, Circle, Line, G } from 'react-native-svg';
import { useTheme } from '@/theme';

export interface TicketEmptyIllustrationProps {
  size?: number;
  testID?: string;
}

export function TicketEmptyIllustration({
  size = 112,
  testID = 'tickets-empty-illustration',
}: TicketEmptyIllustrationProps) {
  const { colors, isDark } = useTheme();

  const paperFill = isDark ? '#1E293B' : '#FAF8F4';
  const paperStroke = isDark ? '#334155' : '#E2DCD2';
  const headerFill = isDark ? '#0F172A' : '#F1ECE1';
  const primaryAccent = colors.primary;
  const mutedAccent = isDark ? '#64748B' : '#A8A29E';

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel="Minh họa tờ vé số chưa có vé"
      className="items-center justify-center mb-4"
    >
      <Svg width={size} height={size} viewBox="0 0 112 112" fill="none">
        {/* Soft background glow / circle */}
        <Circle
          cx="56"
          cy="56"
          r="48"
          fill={isDark ? '#1E293B' : '#F5F2EB'}
          opacity={0.6}
        />

        {/* Floating subtle star / sparkle accents */}
        <Circle cx="20" cy="34" r="2" fill={primaryAccent} opacity={0.4} />
        <Circle cx="94" cy="40" r="3" fill={primaryAccent} opacity={0.3} />
        <Circle cx="88" cy="84" r="2.5" fill={mutedAccent} opacity={0.35} />
        <Circle cx="26" cy="80" r="2" fill={mutedAccent} opacity={0.3} />

        {/* Paper Ticket Body */}
        <G transform="rotate(-3 56 56)">
          {/* Main ticket base */}
          <Rect
            x="24"
            y="20"
            width="64"
            height="72"
            rx="8"
            fill={paperFill}
            stroke={paperStroke}
            strokeWidth="1.5"
          />

          {/* Top header band */}
          <Path
            d="M 24 28 C 24 23.578 27.578 20 32 20 L 80 20 C 84.422 20 88 23.578 88 28 L 88 38 L 24 38 Z"
            fill={headerFill}
          />

          {/* Header mini title line */}
          <Rect
            x="34"
            y="27"
            width="32"
            height="4"
            rx="2"
            fill={primaryAccent}
            opacity={0.7}
          />

          {/* Left & Right ticket perforation notches */}
          <Path
            d="M 24 48 A 4 4 0 0 1 24 56 Z"
            fill={isDark ? '#0F172A' : '#F5F2EB'}
            stroke={paperStroke}
            strokeWidth="1.5"
          />
          <Path
            d="M 88 48 A 4 4 0 0 0 88 56 Z"
            fill={isDark ? '#0F172A' : '#F5F2EB'}
            stroke={paperStroke}
            strokeWidth="1.5"
          />

          {/* Dashed perforation line */}
          <Line
            x1="28"
            y1="52"
            x2="84"
            y2="52"
            stroke={paperStroke}
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          {/* 6 Digit placeholder boxes */}
          <Rect
            x="30"
            y="62"
            width="7"
            height="10"
            rx="2"
            fill={isDark ? '#334155' : '#EAE5D9'}
          />
          <Rect
            x="39"
            y="62"
            width="7"
            height="10"
            rx="2"
            fill={isDark ? '#334155' : '#EAE5D9'}
          />
          <Rect
            x="48"
            y="62"
            width="7"
            height="10"
            rx="2"
            fill={isDark ? '#334155' : '#EAE5D9'}
          />
          <Rect
            x="57"
            y="62"
            width="7"
            height="10"
            rx="2"
            fill={isDark ? '#334155' : '#EAE5D9'}
          />
          <Rect
            x="66"
            y="62"
            width="7"
            height="10"
            rx="2"
            fill={isDark ? '#334155' : '#EAE5D9'}
          />
          <Rect
            x="75"
            y="62"
            width="7"
            height="10"
            rx="2"
            fill={isDark ? '#334155' : '#EAE5D9'}
          />

          {/* Lucky star stamp */}
          <Path
            d="M 56 76 L 57.2 79.5 L 61 79.5 L 58 81.5 L 59.2 85 L 56 83 L 52.8 85 L 54 81.5 L 51 79.5 L 54.8 79.5 Z"
            fill={primaryAccent}
            opacity={0.85}
          />
        </G>
      </Svg>
    </View>
  );
}
