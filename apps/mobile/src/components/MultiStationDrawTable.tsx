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
const TIER_COL_WIDTH = 46;

function getTierRowHeight(tier: PrizeTierConfig): number {
  if (tier.key === 'SPECIAL') return 46;
  if (tier.count <= 1) return 38;
  return tier.count * 24 + 12;
}

function buildRowA11yLabel(tier: PrizeTierConfig, draws: UiDrawView[]): string {
  return (
    `${tier.name}: ` +
    draws
      .map((d) => {
        const numbers = d.numbers?.[tier.key] || d.prizes?.[tier.key] || [];
        return `${d.stationName || d.stationCode} (${
          numbers.length > 0 ? numbers.join(', ') : 'Chưa có'
        })`;
      })
      .join('; ')
  );
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
  const currentOrder =
    propOrder || getSettings().drawTableOrder || 'g8_to_special';
  const tiers: PrizeTierConfig[] =
    currentOrder === 'special_to_g8' ? [...DRAW_TIERS].reverse() : DRAW_TIERS;

  if (!draws || draws.length === 0) {
    return null;
  }

  const needsHorizontalScroll = draws.length >= 4;
  const q = (highlightQuery ?? '').trim();
  const canHighlight = q.length >= 2;

  const renderNumberCellContent = (
    d: UiDrawView,
    tier: PrizeTierConfig,
    isSpecial: boolean,
    isHero: boolean,
  ) => {
    const numbers = d.numbers?.[tier.key] || d.prizes?.[tier.key] || [];
    if (numbers.length === 0) {
      return (
        <Text variant="body" color={colors.textMuted}>
          -
        </Text>
      );
    }

    return numbers.map((num, nIdx) => {
      const isMatched = canHighlight && num.endsWith(q);
      return (
        <View
          key={`num-${d.stationCode}-${tier.key}-${nIdx}-${num}`}
          testID={isMatched ? 'draw-number-matched' : undefined}
          style={[
            styles.numberPill,
            {
              backgroundColor: isMatched ? colors.winTint : 'transparent',
              borderBottomColor: isMatched ? colors.win : 'transparent',
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
            style={isHero ? styles.heroCellDigits : styles.cellDigits}
          >
            {num}
          </Text>
        </View>
      );
    });
  };

  if (!needsHorizontalScroll) {
    return (
      <View
        testID={testID}
        style={[
          styles.unifiedContainer,
          !borderless && {
            borderWidth: 1,
            borderRadius: radii.lg,
            borderColor: colors.border,
          },
          { backgroundColor: colors.surface },
          style,
        ]}
      >
        <View
          testID="multi-station-header-row"
          style={[
            styles.unifiedHeaderRow,
            {
              minHeight: HEADER_HEIGHT,
              backgroundColor: colors.surfaceSubtle,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View
            testID="multi-station-fixed-tier-col"
            style={[
              styles.unifiedTierHeaderCell,
              {
                width: TIER_COL_WIDTH,
                borderRightWidth: 1,
                borderRightColor: colors.border,
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

          {draws.map((d, sIdx) => {
            const displayName = d.stationName || d.stationCode;
            const isLastCol = sIdx === draws.length - 1;

            return (
              <View
                key={`station-header-${d.stationCode}-${sIdx}`}
                testID={`multi-station-header-cell-${sIdx}`}
                style={[
                  styles.flexStationCol,
                  styles.stationHeaderCell,
                  !isLastCol && {
                    borderRightWidth: 1,
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

        {tiers.map((tier, rIdx) => {
          const isSpecial = tier.key === 'SPECIAL' || tier.key === 'EIGHTH';
          const isHero = tier.key === 'SPECIAL';
          const isLastRow = rIdx === tiers.length - 1;
          const rowHeight = getTierRowHeight(tier);
          const rowA11y = buildRowA11yLabel(tier, draws);

          return (
            <View
              key={tier.key}
              testID={`multi-station-row-${rIdx}`}
              accessible={true}
              accessibilityRole="text"
              accessibilityLabel={rowA11y}
              style={[
                styles.unifiedDataRow,
                {
                  minHeight: rowHeight,
                  backgroundColor: isHero ? colors.specialTint : 'transparent',
                  borderBottomWidth: isLastRow ? 0 : 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.unifiedTierLabelCell,
                  {
                    width: TIER_COL_WIDTH,
                    borderRightWidth: 1,
                    borderRightColor: colors.border,
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

              {draws.map((d, sIdx) => {
                const isLastCol = sIdx === draws.length - 1;
                return (
                  <View
                    key={`cell-${d.stationCode}-${tier.key}-${sIdx}`}
                    testID={`multi-station-cell-${rIdx}-${sIdx}`}
                    style={[
                      styles.flexStationCol,
                      styles.stationDataCell,
                      !isLastCol && {
                        borderRightWidth: 1,
                        borderRightColor: colors.border,
                      },
                    ]}
                  >
                    {renderNumberCellContent(d, tier, isSpecial, isHero)}
                  </View>
                );
              })}
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View
      testID={testID}
      style={[
        styles.scrollContainer,
        !borderless && {
          borderWidth: 1,
          borderRadius: radii.lg,
          borderColor: colors.border,
        },
        { backgroundColor: colors.surface },
        style,
      ]}
    >
      {/* Pinned Left Tier Column when horizontal scrolling is active */}
      <View
        testID="multi-station-fixed-tier-col"
        style={[
          styles.fixedTierCol,
          {
            width: TIER_COL_WIDTH,
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
                  borderBottomWidth: isLastRow ? 0 : 1,
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

      <ScrollView
        testID="multi-station-scroll-view"
        horizontal
        scrollEnabled={true}
        showsHorizontalScrollIndicator={true}
        bounces={false}
        style={styles.scrollArea}
      >
        <View>
          <View
            testID="multi-station-header-row"
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
                  testID={`multi-station-header-cell-${sIdx}`}
                  style={[
                    styles.scrollableStationCol,
                    styles.stationHeaderCell,
                    !isLastCol && {
                      borderRightWidth: 1,
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

          {tiers.map((tier, rIdx) => {
            const isSpecial = tier.key === 'SPECIAL' || tier.key === 'EIGHTH';
            const isHero = tier.key === 'SPECIAL';
            const isLastRow = rIdx === tiers.length - 1;
            const rowHeight = getTierRowHeight(tier);
            const rowA11y = buildRowA11yLabel(tier, draws);

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
                    borderBottomWidth: isLastRow ? 0 : 1,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                {draws.map((d, sIdx) => {
                  const isLastCol = sIdx === draws.length - 1;

                  return (
                    <View
                      key={`cell-${d.stationCode}-${tier.key}-${sIdx}`}
                      testID={`multi-station-cell-${rIdx}-${sIdx}`}
                      style={[
                        styles.scrollableStationCol,
                        styles.stationDataCell,
                        !isLastCol && {
                          borderRightWidth: 1,
                          borderRightColor: colors.border,
                        },
                      ]}
                    >
                      {renderNumberCellContent(d, tier, isSpecial, isHero)}
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
  unifiedContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  unifiedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  unifiedTierHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unifiedDataRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
  },
  unifiedTierLabelCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  scrollContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  fixedTierCol: {
    borderRightWidth: 1,
  },
  cornerHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  tierLabelCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  scrollArea: {
    flex: 1,
  },
  stationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
  },
  stationHeaderCell: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  headerText: {
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  tierDataRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  flexStationCol: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
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
