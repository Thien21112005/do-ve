import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { STRINGS } from '../lib/strings';
import { getSettings, type DrawTableOrder } from '../store/settings';

export interface PrizeTierConfig {
  key: string;
  name: string;
  shortName: string;
  digits: number;
  count: number;
  highlight?: boolean;
}

/**
 * Standard printed lottery result sheet order (G8 -> Special Prize) (T10.38).
 */
export const DRAW_TIERS: PrizeTierConfig[] = [
  {
    key: 'EIGHTH',
    name: STRINGS.results.prizes.eighth,
    shortName: STRINGS.results.prizes.eighthShort, // 'G.8'
    digits: 2,
    count: 1,
  },
  {
    key: 'SEVENTH',
    name: STRINGS.results.prizes.seventh,
    shortName: STRINGS.results.prizes.seventhShort, // 'G.7'
    digits: 3,
    count: 1,
  },
  {
    key: 'SIXTH',
    name: STRINGS.results.prizes.sixth,
    shortName: STRINGS.results.prizes.sixthShort, // 'G.6'
    digits: 4,
    count: 3,
  },
  {
    key: 'FIFTH',
    name: STRINGS.results.prizes.fifth,
    shortName: STRINGS.results.prizes.fifthShort, // 'G.5'
    digits: 4,
    count: 1,
  },
  {
    key: 'FOURTH',
    name: STRINGS.results.prizes.fourth,
    shortName: STRINGS.results.prizes.fourthShort, // 'G.4'
    digits: 5,
    count: 7,
  },
  {
    key: 'THIRD',
    name: STRINGS.results.prizes.third,
    shortName: STRINGS.results.prizes.thirdShort, // 'G.3'
    digits: 5,
    count: 2,
  },
  {
    key: 'SECOND',
    name: STRINGS.results.prizes.second,
    shortName: STRINGS.results.prizes.secondShort, // 'G.2'
    digits: 5,
    count: 1,
  },
  {
    key: 'FIRST',
    name: STRINGS.results.prizes.first,
    shortName: STRINGS.results.prizes.firstShort, // 'G.1'
    digits: 5,
    count: 1,
  },
  {
    key: 'SPECIAL',
    name: STRINGS.results.prizes.special,
    shortName: STRINGS.results.prizes.specialShort, // 'ĐB'
    digits: 6,
    count: 1,
    highlight: true,
  },
];

export interface DrawTableProps {
  prizes?: Record<string, string[]> | null;
  numbers?: Record<string, string[]> | null;
  order?: DrawTableOrder;
  highlightQuery?: string;
  testID?: string;
}

export const DrawTable: React.FC<DrawTableProps> = ({
  prizes,
  numbers,
  order: propOrder,
  highlightQuery,
  testID = 'draw-table',
}) => {
  const { colors } = useTheme();
  const data = numbers || prizes;
  const currentOrder = propOrder || getSettings().drawTableOrder || 'g8_to_special';
  const tiers = currentOrder === 'special_to_g8' ? [...DRAW_TIERS].reverse() : DRAW_TIERS;

  return (
    <View
      testID={testID}
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {tiers.map((tier, index) => {
        const tierNumbers = data?.[tier.key] || [];
        const isSpecial = tier.highlight;
        const isLastRow = index === tiers.length - 1;
        const numbersString =
          tierNumbers.length > 0
            ? tierNumbers.join(', ')
            : STRINGS.results.noDataYet;

        const specialColor = colors.special || colors.primary;
        const specialTint = colors.specialTint || `${specialColor}15`;

        return (
          <View
            key={tier.key}
            testID={`draw-table-row-${index}`}
            accessible
            accessibilityRole="text"
            accessibilityLabel={`${tier.name}: ${numbersString}`}
            className="flex-row items-center border-b"
            style={[
              {
                borderColor: colors.border,
                backgroundColor: isSpecial
                  ? `${specialColor}0D` // Subtle tint for Special Prize
                  : index % 2 === 1
                    ? `${colors.border}15` // Alternating subtle striping
                    : 'transparent',
              },
              isLastRow && styles.noBorderBottom,
            ]}
          >
            {/* Left Label Column */}
            <View
              className="w-20 py-3 px-2 justify-center items-center border-r"
              style={{
                borderColor: colors.border,
                backgroundColor: isSpecial ? specialTint : 'transparent',
              }}
            >
              <Text
                className={`text-xs text-center ${isSpecial ? 'font-bold' : 'font-medium'}`}
                style={{
                  color: isSpecial ? specialColor : colors.textMuted,
                }}
              >
                {tier.shortName}
              </Text>
            </View>

            {/* Right Numbers Content Area */}
            <View className="flex-1 py-2.5 px-3 flex-row flex-wrap justify-center items-center gap-x-4 gap-y-1.5">
              {tierNumbers.length > 0 ? (
                tierNumbers.map((num, numIdx) => {
                  const isMatched = Boolean(
                    highlightQuery &&
                      highlightQuery.trim().length >= 2 &&
                      num.endsWith(highlightQuery.trim()),
                  );

                  return (
                    <View
                      key={`${tier.key}-${numIdx}-${num}`}
                      testID={isMatched ? 'draw-number-matched' : undefined}
                      className={
                        isMatched
                          ? 'px-1.5 py-0.5 rounded border'
                          : 'px-0.5 py-0.5'
                      }
                      style={{
                        backgroundColor: isMatched
                          ? colors.winTint || `${colors.win}15`
                          : 'transparent',
                        borderColor: isMatched
                          ? colors.winBorder
                          : 'transparent',
                      }}
                    >
                      <Text
                        className={`text-center font-bold tracking-wider ${
                          isSpecial
                            ? 'text-xl'
                            : tier.digits >= 5
                              ? 'text-base'
                              : 'text-lg'
                        }`}
                        style={{
                          color: isMatched
                            ? colors.win
                            : isSpecial
                              ? specialColor
                              : colors.textMain,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {num}
                      </Text>
                    </View>
                  );
                })
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
