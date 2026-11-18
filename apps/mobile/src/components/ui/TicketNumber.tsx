import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';
import { radii, typeScale } from '@/theme/tokens';

const VN_DIGIT_WORDS: Record<string, string> = {
  '0': 'không',
  '1': 'một',
  '2': 'hai',
  '3': 'ba',
  '4': 'bốn',
  '5': 'năm',
  '6': 'sáu',
  '7': 'bảy',
  '8': 'tám',
  '9': 'chín',
};

/** Spells a digit string in Vietnamese preserving leading zeros ("012345" -> "không một hai ba bốn năm"). */
export function digitsInVietnameseWords(ticket: string): string {
  return Array.from(ticket)
    .map((ch) => VN_DIGIT_WORDS[ch] ?? ch)
    .join(' ');
}

export interface TicketNumberProps {
  ticket: string;
  size?: 'lg' | 'md';
  /** Number of trailing digits matched (e.g. 2 for G8, 6 for Special). */
  matchedSuffixLength?: number;
  /** Explicit per-digit match mask (e.g. encouragement prize with 1 wrong digit). */
  matchedPositions?: boolean[];
  testID?: string;
}

/**
 * 6-digit tabular ticket display (T11.27).
 * Matched digits get BOTH `winTint` background AND a 2px `win` underline so
 * color-blind readers can distinguish matched digits by shape, not color alone.
 */
export function TicketNumber({
  ticket,
  size = 'lg',
  matchedSuffixLength = 0,
  matchedPositions,
  testID = 'ticket-number',
}: TicketNumberProps) {
  const { colors } = useTheme();
  const chars = Array.from(ticket ?? '');
  const variant = size === 'lg' ? 'ticketLg' : 'ticketMd';
  const scale = typeScale[variant];

  const isDigitMatched = (idx: number): boolean => {
    if (matchedPositions && idx < matchedPositions.length) {
      return Boolean(matchedPositions[idx]);
    }
    if (matchedSuffixLength > 0) {
      return idx >= chars.length - matchedSuffixLength;
    }
    return false;
  };

  const matchedCount = chars.filter((_, idx) => isDigitMatched(idx)).length;
  const spokenDigits = digitsInVietnameseWords(ticket ?? '');
  const matchNote =
    matchedPositions && matchedCount > 0
      ? `, khớp ${matchedCount} chữ số`
      : matchedSuffixLength > 0
        ? `, khớp ${matchedSuffixLength} số cuối`
        : '';

  return (
    <View
      testID={testID}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Số vé ${spokenDigits}${matchNote}`}
      style={styles.row}
    >
      {chars.map((ch, idx) => {
        const matched = isDigitMatched(idx);
        return (
          <View
            key={`${idx}-${ch}`}
            testID={`${testID}-digit-${idx}`}
            style={[
              styles.cell,
              {
                backgroundColor: matched ? colors.winTint : 'transparent',
                borderBottomColor: matched ? colors.win : 'transparent',
              },
            ]}
          >
            <Text
              variant={variant}
              color={matched ? colors.win : colors.textMain}
              style={{ letterSpacing: 0, lineHeight: scale.lineHeight }}
            >
              {ch}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cell: {
    paddingHorizontal: 4,
    paddingTop: 2,
    paddingBottom: 1,
    borderTopLeftRadius: radii.sm,
    borderTopRightRadius: radii.sm,
    borderBottomWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
