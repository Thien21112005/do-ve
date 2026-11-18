import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { radii } from '@/theme/tokens';

export interface PrizeRowProps {
  /** Short tier label shown in the fixed 64pt left column (e.g. "G8", "ĐB"). */
  label: string;
  /** Full spoken name for screen readers (e.g. "Giải tám", "Giải Đặc biệt"). */
  a11yLabel?: string;
  numbers: string[];
  /** True for Giải Đặc biệt and Giải 8 (printed in vermilion ink on real sheets). */
  isSpecial?: boolean;
  /** Hero size for the 6-digit Special Prize row. */
  hero?: boolean;
  /** 2-6 digit suffix from quick search to highlight matching numbers. */
  highlightSuffix?: string;
  showDivider?: boolean;
  emptyPlaceholder?: string;
  testID?: string;
}

/**
 * Single prize tier row styled after Southern Vietnamese printed draw sheets (T11.27):
 * fixed 64pt tier column on the left, right-aligned tabular numbers, vermilion
 * (`colors.special`) on G8 and ĐB, and color-blind safe suffix highlighting.
 */
export function PrizeRow({
  label,
  a11yLabel,
  numbers,
  isSpecial = false,
  hero = false,
  highlightSuffix,
  showDivider = true,
  emptyPlaceholder = '—',
  testID = 'prize-row',
}: PrizeRowProps) {
  const { colors } = useTheme();
  const q = (highlightSuffix ?? '').trim();
  const canHighlight = q.length >= 2;

  const spokenNumbers = numbers.length > 0 ? numbers.join(', ') : 'Chưa có';
  const numberColor = isSpecial ? colors.special : colors.textMain;

  return (
    <View
      testID={testID}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${a11yLabel || label}: ${spokenNumbers}`}
      style={[
        styles.row,
        showDivider && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
        hero && { backgroundColor: colors.specialTint },
      ]}
    >
      <View testID={`${testID}-label-col`} style={styles.labelColumn}>
        <Text
          variant={isSpecial ? 'bodyStrong' : 'caption'}
          color={isSpecial ? colors.special : colors.textMuted}
        >
          {label}
        </Text>
      </View>

      <View style={styles.numbersArea}>
        {numbers.length > 0 ? (
          numbers.map((num, idx) => {
            const matched = canHighlight && num.endsWith(q);
            return (
              <View
                key={`${num}-${idx}`}
                testID={matched ? `${testID}-match-${num}` : undefined}
                style={[
                  styles.numberPill,
                  {
                    backgroundColor: matched ? colors.winTint : 'transparent',
                    borderBottomColor: matched ? colors.win : 'transparent',
                  },
                ]}
              >
                <Text
                  variant={hero ? 'ticketLg' : 'ticketMd'}
                  color={matched ? colors.win : numberColor}
                  style={hero ? styles.heroDigits : styles.standardDigits}
                >
                  {num}
                </Text>
              </View>
            );
          })
        ) : (
          <Text variant="body" color={colors.textMuted}>
            {emptyPlaceholder}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 46,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  labelColumn: {
    width: 64,
    justifyContent: 'center',
  },
  numbersArea: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    columnGap: 14,
    rowGap: 6,
  },
  numberPill: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    borderBottomWidth: 2,
  },
  standardDigits: {
    fontSize: 20,
    lineHeight: 26,
    letterSpacing: 1,
  },
  heroDigits: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 2,
  },
});
