import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { DRAW_TIERS, type PrizeTierConfig } from './DrawTable';
import { getSettings, type DrawTableOrder } from '../store/settings';
import type { UiDrawView } from '@/api/mappers';

export interface MultiStationDrawTableProps {
  draws: UiDrawView[];
  order?: DrawTableOrder;
  testID?: string;
}

export const MultiStationDrawTable: React.FC<MultiStationDrawTableProps> = ({
  draws,
  order: propOrder,
  testID = 'multi-station-draw-table',
}) => {
  const { colors } = useTheme();
  const currentOrder = propOrder || getSettings().drawTableOrder || 'g8_to_special';
  const tiers: PrizeTierConfig[] =
    currentOrder === 'special_to_g8' ? [...DRAW_TIERS].reverse() : DRAW_TIERS;

  const specialColor = colors.special || colors.primary;
  const specialTint = colors.specialTint || `${specialColor}15`;

  if (!draws || draws.length === 0) {
    return null;
  }

  return (
    <View
      testID={testID}
      className="rounded-2xl border overflow-hidden"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      <ScrollView
        testID="multi-station-scroll-view"
        horizontal
        showsHorizontalScrollIndicator={true}
        bounces={false}
      >
        <View>
          {/* Header row: Label column + Station name columns */}
          <View
            className="flex-row items-stretch border-b"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surfaceSubtle || `${colors.border}1A`,
            }}
          >
            {/* Corner Cell: "Giải" */}
            <View
              className="w-16 py-3 px-1 justify-center items-center border-r"
              style={{ borderColor: colors.border }}
            >
              <Text
                className="text-xs font-bold text-center"
                style={{ color: colors.textMuted }}
              >
                Giải
              </Text>
            </View>

            {/* Station Column Headers */}
            {draws.map((d, sIdx) => {
              const displayName = d.stationName || d.stationCode;
              const isLastCol = sIdx === draws.length - 1;
              return (
                <View
                  key={`station-header-${d.stationCode}-${sIdx}`}
                  className="w-36 py-3 px-2 justify-center items-center border-r"
                  style={[
                    { borderColor: colors.border },
                    isLastCol && styles.noBorderRight,
                  ]}
                >
                  <Text
                    numberOfLines={2}
                    className="text-xs font-bold text-center leading-4"
                    style={{ color: colors.textMain }}
                  >
                    {displayName}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Tier Rows */}
          {tiers.map((tier, rIdx) => {
            const isSpecial = tier.highlight;
            const isLastRow = rIdx === tiers.length - 1;

            // Generate an informative a11y label across all stations for this row
            const rowA11y = `${tier.name}: ` +
              draws
                .map((d) => {
                  const numbers =
                    d.numbers?.[tier.key] || d.prizes?.[tier.key] || [];
                  return `${d.stationName || d.stationCode} (${numbers.length > 0 ? numbers.join(', ') : 'Chưa có'})`;
                })
                .join('; ');

            return (
              <View
                key={tier.key}
                testID={`multi-station-row-${rIdx}`}
                accessible
                accessibilityRole="text"
                accessibilityLabel={rowA11y}
                className="flex-row items-stretch border-b"
                style={[
                  {
                    borderColor: colors.border,
                    backgroundColor: isSpecial
                      ? `${specialColor}0D`
                      : rIdx % 2 === 1
                        ? `${colors.border}12`
                        : 'transparent',
                  },
                  isLastRow && styles.noBorderBottom,
                ]}
              >
                {/* Left Tier Label Cell */}
                <View
                  className="w-16 py-3 px-1 justify-center items-center border-r"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: isSpecial ? specialTint : 'transparent',
                  }}
                >
                  <Text
                    className={`text-xs text-center ${isSpecial ? 'font-bold' : 'font-semibold'}`}
                    style={{
                      color: isSpecial ? specialColor : colors.textMuted,
                    }}
                  >
                    {tier.shortName}
                  </Text>
                </View>

                {/* Numbers for each Station in this Tier */}
                {draws.map((d, sIdx) => {
                  const numbers =
                    d.numbers?.[tier.key] || d.prizes?.[tier.key] || [];
                  const isLastCol = sIdx === draws.length - 1;

                  return (
                    <View
                      key={`cell-${d.stationCode}-${tier.key}-${sIdx}`}
                      className="w-36 py-2 px-2 justify-center items-center border-r"
                      style={[
                        { borderColor: colors.border },
                        isLastCol && styles.noBorderRight,
                      ]}
                    >
                      {numbers.length > 0 ? (
                        <View className="flex-row flex-wrap justify-center items-center gap-x-2 gap-y-1">
                          {numbers.map((num, nIdx) => (
                            <Text
                              key={`num-${d.stationCode}-${tier.key}-${nIdx}-${num}`}
                              className={`text-center font-bold tracking-wider ${
                                isSpecial
                                  ? 'text-lg'
                                  : tier.digits >= 5
                                    ? 'text-sm'
                                    : 'text-base'
                              }`}
                              style={{
                                color: isSpecial ? specialColor : colors.textMain,
                                fontVariant: ['tabular-nums'],
                              }}
                            >
                              {num}
                            </Text>
                          ))}
                        </View>
                      ) : (
                        <Text
                          className="text-sm font-semibold"
                          style={{ color: colors.textMuted }}
                        >
                          -
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  noBorderBottom: {
    borderBottomWidth: 0,
  },
  noBorderRight: {
    borderRightWidth: 0,
  },
});
