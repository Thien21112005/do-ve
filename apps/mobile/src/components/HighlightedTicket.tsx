import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme';

export interface MatchedSegment {
  text: string;
  isMatched: boolean;
}

/**
 * Splits ticket into unmatched prefix and matched suffix.
 */
export function computeMatchedSegments(
  ticket: string,
  matchedDigits?: string | null,
): MatchedSegment[] {
  if (!ticket) return [];
  if (!matchedDigits || matchedDigits.length === 0) {
    return [{ text: ticket, isMatched: false }];
  }

  if (ticket.endsWith(matchedDigits)) {
    const unmatchedLength = ticket.length - matchedDigits.length;
    const segments: MatchedSegment[] = [];
    if (unmatchedLength > 0) {
      segments.push({
        text: ticket.slice(0, unmatchedLength),
        isMatched: false,
      });
    }
    segments.push({
      text: matchedDigits,
      isMatched: true,
    });
    return segments;
  }

  return [{ text: ticket, isMatched: false }];
}

/**
 * Returns the longest matched suffix among an array of wins.
 */
export function getLongestMatchedSuffix(
  ticket: string,
  wins?: { matchedDigits?: string | null }[],
): string {
  if (!wins || wins.length === 0 || !ticket) return '';
  let longest = '';
  for (const win of wins) {
    const digits = win.matchedDigits;
    if (digits && ticket.endsWith(digits) && digits.length > longest.length) {
      longest = digits;
    }
  }
  return longest;
}

export interface HighlightedTicketProps {
  ticket: string;
  matchedDigits?: string | null;
  size?: 'sm' | 'md' | 'lg';
  testID?: string;
}

export function HighlightedTicket({
  ticket,
  matchedDigits,
  size = 'md',
  testID = 'highlighted-ticket',
}: HighlightedTicketProps) {
  const { colors } = useTheme();
  const segments = computeMatchedSegments(ticket, matchedDigits);

  const textSizeClass =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-base' : 'text-xl';

  const accessibilityLabel = `Số vé ${ticket}${
    matchedDigits
      ? `, khớp ${matchedDigits.length} số cuối ${matchedDigits}`
      : ''
  }`;

  return (
    <View
      testID={testID}
      className="flex-row items-center"
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
    >
      {segments.map((segment, index) => {
        if (segment.isMatched) {
          return (
            <View
              key={`seg-${index}`}
              testID="ticket-segment-matched"
              className="px-1 py-0.5 rounded border"
              style={{
                backgroundColor: colors.winBg,
                borderColor: colors.winBorder,
              }}
            >
              <Text
                className={`${textSizeClass} font-bold tracking-widest`}
                style={{ color: colors.win }}
              >
                {segment.text}
              </Text>
            </View>
          );
        }

        return (
          <View
            key={`seg-${index}`}
            testID="ticket-segment-unmatched"
            className="px-0.5 py-0.5"
          >
            <Text
              className={`${textSizeClass} font-bold tracking-widest`}
              style={{ color: colors.textMuted }}
            >
              {segment.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
