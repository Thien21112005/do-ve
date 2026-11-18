import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { PrizeRow } from '@/components/ui';
import { useTheme, radii } from '@/theme';
import { STRINGS } from '@/lib/strings';
import { getSettings, type DrawTableOrder } from '@/store/settings';

export interface PrizeTierConfig {
  key: string;
  name: string;
  shortName: string;
  digits: number;
  count: number;
  highlight?: boolean;
}

/**
 * Standard printed lottery result sheet order (G8 -> Special Prize) (T10.38, T11.37).
 * Both G.8 and ĐB are printed in vermilion ink (`highlight: true`).
 */
export const DRAW_TIERS: PrizeTierConfig[] = [
  {
    key: 'EIGHTH',
    name: STRINGS.results.prizes.eighth,
    shortName: STRINGS.results.prizes.eighthShort,
    digits: 2,
    count: 1,
    highlight: true,
  },
  {
    key: 'SEVENTH',
    name: STRINGS.results.prizes.seventh,
    shortName: STRINGS.results.prizes.seventhShort,
    digits: 3,
    count: 1,
  },
  {
    key: 'SIXTH',
    name: STRINGS.results.prizes.sixth,
    shortName: STRINGS.results.prizes.sixthShort,
    digits: 4,
    count: 3,
  },
  {
    key: 'FIFTH',
    name: STRINGS.results.prizes.fifth,
    shortName: STRINGS.results.prizes.fifthShort,
    digits: 4,
    count: 1,
  },
  {
    key: 'FOURTH',
    name: STRINGS.results.prizes.fourth,
    shortName: STRINGS.results.prizes.fourthShort,
    digits: 5,
    count: 7,
  },
  {
    key: 'THIRD',
    name: STRINGS.results.prizes.third,
    shortName: STRINGS.results.prizes.thirdShort,
    digits: 5,
    count: 2,
  },
  {
    key: 'SECOND',
    name: STRINGS.results.prizes.second,
    shortName: STRINGS.results.prizes.secondShort,
    digits: 5,
    count: 1,
  },
  {
    key: 'FIRST',
    name: STRINGS.results.prizes.first,
    shortName: STRINGS.results.prizes.firstShort,
    digits: 5,
    count: 1,
  },
  {
    key: 'SPECIAL',
    name: STRINGS.results.prizes.special,
    shortName: STRINGS.results.prizes.specialShort,
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
  borderless?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const DrawTable: React.FC<DrawTableProps> = ({
  prizes,
  numbers,
  order: propOrder,
  highlightQuery,
  borderless = false,
  style,
  testID = 'draw-table',
}) => {
  const { colors } = useTheme();
  const data = numbers || prizes;
  const currentOrder = propOrder || getSettings().drawTableOrder || 'g8_to_special';
  const tiers =
    currentOrder === 'special_to_g8' ? [...DRAW_TIERS].reverse() : DRAW_TIERS;

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
      {tiers.map((tier, index) => {
        const tierNumbers = data?.[tier.key] || [];
        const isSpecial = tier.key === 'SPECIAL' || tier.key === 'EIGHTH';
        const isHero = tier.key === 'SPECIAL';

        return (
          <PrizeRow
            key={tier.key}
            testID={`draw-table-row-${index}`}
            contentTestID={`draw-table-content-${tier.key}`}
            matchTestID="draw-number-matched"
            label={tier.shortName}
            a11yLabel={tier.name}
            numbers={tierNumbers}
            isSpecial={isSpecial}
            hero={isHero}
            twoRowChunkSize={tier.key === 'FOURTH' ? 4 : undefined}
            highlightSuffix={highlightQuery}
            emptyPlaceholder="-"
            showDivider={index < tiers.length - 1}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
