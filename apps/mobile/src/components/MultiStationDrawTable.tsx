import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from '@/components/ui';
import { useTheme, radii } from '@/theme';
import { DRAW_TIERS, type PrizeTierConfig } from './DrawTable';
import { getSettings, type DrawTableOrder } from '@/store/settings';
import type { UiDrawView } from '@/api/mappers';

export interface MultiStationDrawTableProps {
  draws: UiDrawView[];
  order?: DrawTableOrder;
  highlightQuery?: string;
  borderless?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const HEADER_HEIGHT = 44;

function getTierRowHeight(tier: PrizeTierConfig): number {
  if (tier.key === 'SPECIAL') return 48;
  if (tier.count <= 1) return 40;
  return tier.count * 24 + 14;
}

export const MultiStationDrawTable: React.FC<MultiStationDrawTableProps> = ({
  draws,
  order: propOrder,
  highlightQuery,
  borderless = false,
  style,
  testID = 'multi-station-draw-table',
}) => {
  const { colors } = useTheme();
  const currentOrder = propOrder || getSettings().drawTableOrder || 'g8_to_special';
  const tiers: PrizeTierConfig[] =
    currentOrder === 'special_to_g8' ? [...DRAW_TIERS].reverse() : DRAW_TIERS;

  if (!draws || draws.length === 0) {
    return null;
  }

  const needsHorizontalScroll = draws.length >= 4;
  const q = (highlightQuery ?? '').trim();
  const canHighlight = q.length >= 2;

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        !borderless && {
          borderWidth: 1,
          borderRadius: radii.lg,
          borderColor: colors.border,
        },
        { backgroundColor: colors.surface },
        style,
      ]}
    >
      {/* Fixed Left Tier Column — stays pinned when scrolling >=4 stations */}
      <View
        testID="multi-station-fixed-tier-col"
        style={[
          styles.fixedTierCol,
          {
            borderRightColor: colors.border,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <View
          style={[
            styles.cornerHeaderCell,
            {
              height: HEADER_HEIGHT,
              backgroundColor: colors.surfaceSubtle,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <Text
            variant="caption"
            color={colors.textMuted}
            style={styles.headerText}
          >
            Giải
          </Text>
        </View>

        {tiers.map((tier, rIdx) => {
          const isSpecial = tier.key === 'SPECIAL' || tier.key === 'EIGHTH';
          const isHero = tier.key === 'SPECIAL';
          const isLastRow = rIdx === tiers.length - 1;
          const rowHeight = getTierRowHeight(tier);

          return (
            <View
              key={`tier-label-${tier.key}`}
              style={[
                styles.tierLabelCell,
                {
                  height: rowHeight,
                  backgroundColor: isHero ? colors.specialTint : 'transparent',
                  borderBottomWidth: isLastRow ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text
                variant={isSpecial ? 'bodyStrong' : 'caption'}
                color={isSpecial ? colors.special : colors.textMuted}
              >
                {tier.shortName}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Station Columns — 2..3 stations share full width; >=4 scroll horizontally */}
      <ScrollView
        testID="multi-station-scroll-view"
        horizontal
        scrollEnabled={needsHorizontalScroll}
        showsHorizontalScrollIndicator={needsHorizontalScroll}
        bounces={false}
        style={styles.scrollArea}
        contentContainerStyle={
          !needsHorizontalScroll ? styles.fillScrollContent : undefined
        }
      >
        <View style={!needsHorizontalScroll ? styles.fillTableBody : undefined}>
          {/* Station Column Headers */}
          <View
            style={[
              styles.stationHeaderRow,
              {
                height: HEADER_HEIGHT,
                backgroundColor: colors.surfaceSubtle,
                borderBottomColor: colors.border,
              },
            ]}
          >
            {draws.map((d, sIdx) => {
              const displayName = d.stationName || d.stationCode;
              const isLastCol = sIdx === draws.length - 1;

              return (
                <View
                  key={`station-header-${d.stationCode}-${sIdx}`}
                  style={[
                    needsHorizontalScroll
                      ? styles.scrollableStationCol
                      : styles.flexStationCol,
                    styles.stationHeaderCell,
                    !isLastCol && {
                      borderRightWidth: StyleSheet.hairlineWidth,
                      borderRightColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    variant="caption"
                    color={colors.textMain}
                    numberOfLines={2}
                    align="center"
                    style={styles.headerText}
                  >
                    {displayName}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Tier Rows across Stations */}
          {tiers.map((tier, rIdx) => {
            const isSpecial = tier.key === 'SPECIAL' || tier.key === 'EIGHTH';
            const isHero = tier.key === 'SPECIAL';
            const isLastRow = rIdx === tiers.length - 1;
            const rowHeight = getTierRowHeight(tier);

            const rowA11y =
              `${tier.name}: ` +
              draws
                .map((d) => {
                  const numbers =
                    d.numbers?.[tier.key] || d.prizes?.[tier.key] || [];
                  return `${d.stationName || d.stationCode} (${
                    numbers.length > 0 ? numbers.join(', ') : 'Chưa có'
                  })`;
                })
                .join('; ');

            return (
              <View
                key={tier.key}
                testID={`multi-station-row-${rIdx}`}
                accessible={true}
                accessibilityRole="text"
                accessibilityLabel={rowA11y}
                style={[
                  styles.tierDataRow,
                  {
                    height: rowHeight,
                    backgroundColor: isHero ? colors.specialTint : 'transparent',
                    borderBottomWidth: isLastRow ? 0 : StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                {draws.map((d, sIdx) => {
                  const numbers =
                    d.numbers?.[tier.key] || d.prizes?.[tier.key] || [];
                  const isLastCol = sIdx === draws.length - 1;

                  return (
                    <View
                      key={`cell-${d.stationCode}-${tier.key}-${sIdx}`}
                      style={[
                        needsHorizontalScroll
                          ? styles.scrollableStationCol
                          : styles.flexStationCol,
                        styles.stationDataCell,
                        !isLastCol && {
                          borderRightWidth: StyleSheet.hairlineWidth,
                          borderRightColor: colors.border,
                        },
                      ]}
                    >
                      {numbers.length > 0 ? (
                        numbers.map((num, nIdx) => {
                          const isMatched = canHighlight && num.endsWith(q);
                          return (
                            <View
                              key={`num-${d.stationCode}-${tier.key}-${nIdx}-${num}`}
                              testID={
                                isMatched ? 'draw-number-matched' : undefined
                              }
                              style={[
                                styles.numberPill,
                                {
                                  backgroundColor: isMatched
                                    ? colors.winTint
                                    : 'transparent',
                                  borderBottomColor: isMatched
                                    ? colors.win
                                    : 'transparent',
                                },
                              ]}
                            >
                              <Text
                                variant="ticketMd"
                                color={
                                  isMatched
                                    ? colors.win
                                    : isSpecial
                                      ? colors.special
                                      : colors.textMain
                                }
                                style={
                                  isHero
                                    ? styles.heroCellDigits
                                    : styles.cellDigits
                                }
                              >
                                {num}
                              </Text>
                            </View>
                          );
                        })
                      ) : (
                        <Text variant="body" color={colors.textMuted}>
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
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fixedTierCol: {
    width: 48,
    borderRightWidth: StyleSheet.hairlineWidth,
  },
  cornerHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tierLabelCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  scrollArea: {
    flex: 1,
  },
  fillScrollContent: {
    flexGrow: 1,
  },
  fillTableBody: {
    flex: 1,
  },
  stationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  stationHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  headerText: {
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  tierDataRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  flexStationCol: {
    flex: 1,
  },
  scrollableStationCol: {
    width: 112,
  },
  stationDataCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 4,
  },
  numberPill: {
    paddingHorizontal: 3,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    borderBottomWidth: 2,
  },
  cellDigits: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  heroCellDigits: {
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0.5,
  },
});
