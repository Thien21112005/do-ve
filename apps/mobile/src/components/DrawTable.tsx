import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

export interface PrizeTierConfig {
  key: string;
  name: string;
  shortName: string;
  digits: number;
  count: number;
  highlight?: boolean;
}

export const DRAW_TIERS: PrizeTierConfig[] = [
  {
    key: 'SPECIAL',
    name: 'Đặc biệt',
    shortName: 'ĐB',
    digits: 6,
    count: 1,
    highlight: true,
  },
  { key: 'FIRST', name: 'Giải nhất', shortName: 'G1', digits: 5, count: 1 },
  { key: 'SECOND', name: 'Giải nhì', shortName: 'G2', digits: 5, count: 1 },
  { key: 'THIRD', name: 'Giải ba', shortName: 'G3', digits: 5, count: 2 },
  { key: 'FOURTH', name: 'Giải tư', shortName: 'G4', digits: 5, count: 7 },
  { key: 'FIFTH', name: 'Giải năm', shortName: 'G5', digits: 4, count: 1 },
  { key: 'SIXTH', name: 'Giải sáu', shortName: 'G6', digits: 4, count: 3 },
  { key: 'SEVENTH', name: 'Giải bảy', shortName: 'G7', digits: 3, count: 1 },
  { key: 'EIGHTH', name: 'Giải tám', shortName: 'G8', digits: 2, count: 1 },
];

export interface DrawTableProps {
  prizes?: Record<string, string[]> | null;
  testID?: string;
}

export const DrawTable: React.FC<DrawTableProps> = ({
  prizes,
  testID = 'draw-table',
}) => {
  const { colors } = useTheme();

  return (
    <View
      testID={testID}
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {DRAW_TIERS.map((tier, index) => {
        const tierNumbers = prizes?.[tier.key] || [];
        const isSpecial = tier.highlight;
        const isLastRow = index === DRAW_TIERS.length - 1;
        const numbersString =
          tierNumbers.length > 0 ? tierNumbers.join(', ') : 'Chưa có';

        return (
          <View
            key={tier.key}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${tier.name}: ${numbersString}`}
            className="flex-row items-center border-b"
            style={[
              {
                borderColor: colors.border,
                backgroundColor: isSpecial
                  ? `${colors.primary}0D` // Subtle primary tint for Special Prize
                  : index % 2 === 1
                    ? `${colors.border}22` // Alternating subtle striping
                    : 'transparent',
              },
              isLastRow && styles.noBorderBottom,
            ]}
          >
            {/* Left Label Column */}
            <View
              className="w-24 py-3 px-3 justify-center items-center border-r"
              style={{
                borderColor: colors.border,
                backgroundColor: isSpecial
                  ? `${colors.primary}15`
                  : 'transparent',
              }}
            >
              <Text
                className={`text-xs text-center ${isSpecial ? 'font-bold' : 'font-medium'}`}
                style={{
                  color: isSpecial ? colors.primary : colors.textMuted,
                }}
              >
                {tier.name}
              </Text>
            </View>

            {/* Right Numbers Content Area */}
            <View className="flex-1 py-2.5 px-3 flex-row flex-wrap justify-center items-center gap-x-4 gap-y-1.5">
              {tierNumbers.length > 0 ? (
                tierNumbers.map((num, numIdx) => (
                  <Text
                    key={`${tier.key}-${numIdx}-${num}`}
                    className={`text-center font-bold tracking-wider ${
                      isSpecial
                        ? 'text-xl'
                        : tier.digits >= 5
                          ? 'text-base'
                          : 'text-lg'
                    }`}
                    style={{
                      color: isSpecial ? colors.primary : colors.textMain,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {num}
                  </Text>
                ))
              ) : (
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.textMuted }}
                >
                  -
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  noBorderBottom: {
    borderBottomWidth: 0,
  },
});
