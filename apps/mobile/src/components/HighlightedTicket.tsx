import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

export interface MatchedSegment {
  text: string;
  isMatched: boolean;
  isMismatched?: boolean;
}

export interface PositionAwareOptions {
  matchedDigits?: string | null;
  wins?: {
    tier?: string;
    matchedNumber?: string | null;
    matchedDigits?: string | null;
  }[] | null;
  tier?: string | null;
  specialNumber?: string | null;
}

export interface PositionAwareResult {
  segments: MatchedSegment[];
  matchDescription?: string;
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
 * Position-aware segmentation supporting:
 * 1. Standard suffix match (Giải Đặc biệt, Giải Nhất..Tám).
 * 2. Special Consolation (Giải phụ Đặc biệt: khớp 5 số cuối, sai số đầu).
 * 3. Encouragement (Giải Khuyến khích: khớp số đầu, sai đúng 1 chữ số trong 5 số sau).
 */
export function computePositionAwareSegments(
  ticket: string,
  options?: PositionAwareOptions,
): PositionAwareResult {
  if (!ticket) {
    return { segments: [], matchDescription: undefined };
  }

  const wins = options?.wins;
  let tier = options?.tier;
  let specialNumber = options?.specialNumber;

  if (wins && wins.length > 0) {
    const specialConsolationWin = wins.find(
      (w) => w.tier === 'SPECIAL_CONSOLATION',
    );
    const encouragementWin = wins.find((w) => w.tier === 'ENCOURAGEMENT');
    const specialWin = wins.find((w) => w.tier === 'SPECIAL');

    if (specialWin && !tier) {
      tier = 'SPECIAL';
      specialNumber = specialWin.matchedNumber || specialWin.matchedDigits || specialNumber;
    } else if (specialConsolationWin && !tier) {
      tier = 'SPECIAL_CONSOLATION';
      specialNumber =
        specialConsolationWin.matchedNumber ||
        specialConsolationWin.matchedDigits ||
        specialNumber;
    } else if (encouragementWin && !tier) {
      tier = 'ENCOURAGEMENT';
      specialNumber =
        encouragementWin.matchedNumber ||
        encouragementWin.matchedDigits ||
        specialNumber;
    }
  }

  // 1. Giải Đặc biệt (SPECIAL)
  if (tier === 'SPECIAL' && specialNumber && ticket === specialNumber) {
    return {
      segments: [{ text: ticket, isMatched: true }],
      matchDescription: 'khớp toàn bộ 6 số với giải Đặc biệt',
    };
  }

  // 2. Giải phụ Đặc biệt (SPECIAL_CONSOLATION): 6 digits, differs at index 0, matches indices 1..5
  const isSpecialConsolationMatch =
    (tier === 'SPECIAL_CONSOLATION' && specialNumber && specialNumber.length === 6 && ticket.length === 6) ||
    (specialNumber &&
      specialNumber.length === 6 &&
      ticket.length === 6 &&
      ticket.slice(1) === specialNumber.slice(1) &&
      ticket[0] !== specialNumber[0]);

  if (isSpecialConsolationMatch) {
    return {
      segments: [
        { text: ticket.charAt(0), isMatched: false, isMismatched: true },
        { text: ticket.slice(1), isMatched: true },
      ],
      matchDescription: 'khớp 5 số cuối với giải Đặc biệt',
    };
  }

  // 3. Giải Khuyến khích (ENCOURAGEMENT): 6 digits, matches index 0, differs at exactly 1 index in 1..5
  if (specialNumber && specialNumber.length === 6 && ticket.length === 6 && ticket[0] === specialNumber[0]) {
    let diffCount = 0;
    let diffIndex = -1;
    for (let i = 1; i < 6; i++) {
      if (ticket[i] !== specialNumber[i]) {
        diffCount++;
        diffIndex = i;
      }
    }

    if (diffCount === 1 && (tier === 'ENCOURAGEMENT' || !tier)) {
      const segments: MatchedSegment[] = [];
      const prefix = ticket.slice(0, diffIndex);
      if (prefix.length > 0) {
        segments.push({ text: prefix, isMatched: true });
      }
      segments.push({
        text: ticket.charAt(diffIndex),
        isMatched: false,
        isMismatched: true,
      });
      const suffix = ticket.slice(diffIndex + 1);
      if (suffix.length > 0) {
        segments.push({ text: suffix, isMatched: true });
      }

      return {
        segments,
        matchDescription: `khớp số đầu và 4 số còn lại với giải Đặc biệt (sai chữ số thứ ${diffIndex + 1})`,
      };
    }
  }

  // 4. Giải thông thường / Suffix match
  const matchedDigits =
    options?.matchedDigits ||
    (wins ? getLongestMatchedSuffix(ticket, wins) : null);

  if (matchedDigits && ticket.endsWith(matchedDigits)) {
    const segments = computeMatchedSegments(ticket, matchedDigits);
    return {
      segments,
      matchDescription:
        matchedDigits.length === ticket.length
          ? 'khớp toàn bộ số vé'
          : `khớp ${matchedDigits.length} số cuối ${matchedDigits}`,
    };
  }

  // 5. Không trúng
  return {
    segments: [{ text: ticket, isMatched: false }],
    matchDescription: undefined,
  };
}

/**
 * Returns the longest matched suffix among an array of wins.
 */
export function getLongestMatchedSuffix(
  ticket: string,
  wins?: { matchedDigits?: string | null; matchedNumber?: string | null }[],
): string {
  if (!wins || wins.length === 0 || !ticket) return '';
  let longest = '';
  for (const win of wins) {
    const digits = win.matchedDigits || win.matchedNumber;
    if (digits && ticket.endsWith(digits) && digits.length > longest.length) {
      longest = digits;
    }
  }
  return longest;
}

export interface HighlightedTicketProps {
  ticket: string;
  matchedDigits?: string | null;
  wins?: {
    tier?: string;
    matchedNumber?: string | null;
    matchedDigits?: string | null;
  }[] | null;
  tier?: string | null;
  specialNumber?: string | null;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  testID?: string;
}

function MatchedSegmentView({
  segmentText,
  index,
  isLg,
  textSizeClass,
  winColor,
  winTint,
  winBorder,
  animated,
}: {
  segmentText: string;
  index: number;
  isLg: boolean;
  textSizeClass: string;
  winColor: string;
  winTint: string;
  winBorder: string;
  animated?: boolean;
}) {
  const scale = useSharedValue(animated && process.env.NODE_ENV !== 'test' ? 0.8 : 1);
  const opacity = useSharedValue(animated && process.env.NODE_ENV !== 'test' ? 0 : 1);

  useEffect(() => {
    if (animated && process.env.NODE_ENV !== 'test') {
      const delay = index * 60;
      scale.value = withDelay(delay, withSpring(1, { damping: 14, stiffness: 120 }));
      opacity.value = withDelay(delay, withSpring(1));
    } else {
      scale.value = 1;
      opacity.value = 1;
    }
  }, [animated, index, opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      testID="ticket-segment-matched"
      style={[
        {
          backgroundColor: winTint,
          borderColor: winBorder,
        },
        animated && process.env.NODE_ENV !== 'test' ? animatedStyle : undefined,
      ]}
      className={`${isLg ? 'px-1.5 py-1 rounded-lg' : 'px-1 py-0.5 rounded'} border`}
    >
      <Text
        className={`${textSizeClass} font-bold tracking-widest`}
        style={{
          color: winColor,
          fontVariant: ['tabular-nums'],
        }}
      >
        {segmentText}
      </Text>
    </Animated.View>
  );
}

export function HighlightedTicket({
  ticket,
  matchedDigits,
  wins,
  tier,
  specialNumber,
  size = 'md',
  animated = false,
  testID = 'highlighted-ticket',
}: HighlightedTicketProps) {
  const { colors } = useTheme();
  const { segments, matchDescription } = computePositionAwareSegments(ticket, {
    matchedDigits,
    wins,
    tier,
    specialNumber,
  });

  const isLg = size === 'lg';
  const textSizeClass =
    size === 'lg' ? 'text-[32px] leading-10' : size === 'sm' ? 'text-base' : 'text-xl';

  const accessibilityLabel = `Số vé ${ticket}${
    matchDescription ? `, ${matchDescription}` : ''
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
            <MatchedSegmentView
              key={`seg-${index}`}
              segmentText={segment.text}
              index={index}
              isLg={isLg}
              textSizeClass={textSizeClass}
              winColor={colors.win}
              winTint={colors.winTint || `${colors.win}15`}
              winBorder={colors.winBorder}
              animated={animated}
            />
          );
        }

        if (segment.isMismatched) {
          return (
            <View
              key={`seg-${index}`}
              testID="ticket-segment-mismatched"
              className={`${isLg ? 'px-1.5 py-1' : 'px-1 py-0.5'} border-b-2`}
              style={{
                borderBottomColor: colors.textMuted,
              }}
            >
              <Text
                className={`${textSizeClass} font-bold tracking-widest`}
                style={{
                  color: colors.textMuted,
                  fontVariant: ['tabular-nums'],
                }}
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
              style={{
                color: colors.textMain,
                fontVariant: ['tabular-nums'],
              }}
            >
              {segment.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
