import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Pressable, AccessibilityInfo } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { motion } from '@/theme/tokens';
import { Icon } from './Icon';
import {
  HighlightedTicket,
  getLongestMatchedSuffix,
} from './HighlightedTicket';
import {
  formatCurrency,
  formatDateVN,
  getEstimatedDrawTimeMessage,
  animateCountUp,
} from '@/lib/format';
import { STRINGS } from '@/lib/strings';
import { haptics } from '@/lib/haptics';
import type { CheckTicketResponse } from '@/types';
import type { UiCheckResult } from '@/api/mappers';

export interface ResultCardProps {
  result: UiCheckResult | CheckTicketResponse;
  onSaveTicket?: (result: any) => void;
  isSaved?: boolean;
  onCheckAgain?: () => void;
  testID?: string;
}

export function ResultCard({
  result,
  onSaveTicket,
  isSaved = false,
  onCheckAgain,
  testID = 'result-card',
}: ResultCardProps) {
  const { colors } = useTheme();
  const [reduceMotion, setReduceMotion] = useState(false);
  const isPending = result.status === 'RESULT_NOT_AVAILABLE';
  const isWon = !isPending && Boolean(result.won);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    let isMounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) setReduceMotion(enabled);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.value = 1;
      translateY.value = 0;
      return;
    }
    const [x1, y1, x2, y2] = motion.easing.outQuart;
    const easingOutQuart = Easing.bezier(x1, y1, x2, y2);

    opacity.value = withTiming(1, {
      duration: motion.duration.slow,
      easing: easingOutQuart,
    });
    translateY.value = withTiming(0, {
      duration: motion.duration.slow,
      easing: easingOutQuart,
    });
  }, [opacity, translateY, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const winCount = result.wins ? result.wins.length : 0;
  const formattedDate = formatDateVN(result.drawDate ?? '');
  const longestMatched = getLongestMatchedSuffix(result.ticket ?? '', result.wins as any);
  const totalPrize =
    typeof (result as any).totalPrize === 'number'
      ? (result as any).totalPrize
      : typeof (result as any).totalAmount === 'number'
        ? (result as any).totalAmount
        : 0;
  const stationName =
    (result as any).stationName ||
    (result as any).station ||
    (result as any).stationCode ||
    '';

  // In-card reveal and haptic celebration (T10.37)
  const hasTriggeredHapticsRef = useRef(false);
  const [displayPrize, setDisplayPrize] = useState(() => totalPrize);

  useEffect(() => {
    if (isWon && !hasTriggeredHapticsRef.current) {
      hasTriggeredHapticsRef.current = true;
      haptics.success();
    }
  }, [isWon]);

  useEffect(() => {
    if (!isWon || totalPrize <= 0 || process.env.NODE_ENV === 'test') {
      setDisplayPrize(totalPrize);
      return;
    }

    let isMounted = true;
    let cancelTimer: (() => void) | undefined;

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!isMounted) return;
      if (reduced) {
        setDisplayPrize(totalPrize);
        return;
      }

      setDisplayPrize(0);
      cancelTimer = animateCountUp(totalPrize, 600, (current) => {
        if (isMounted) setDisplayPrize(current);
      });
    });

    return () => {
      isMounted = false;
      cancelTimer?.();
    };
  }, [isWon, totalPrize]);

  const cardBg = isPending
    ? colors.pendingBg
    : isWon
      ? colors.winBg
      : colors.surface;

  const cardBorder = isPending
    ? colors.pendingBorder
    : isWon
      ? colors.winBorder
      : colors.border;

  const formattedPrizeA11y = formatCurrency(totalPrize).replace(/\s*đ$/, ' đồng');
  const a11ySummary = isPending
    ? `${STRINGS.check.resultPendingTitle}. ${STRINGS.check.resultPendingSubtitle}`
    : isWon
      ? `Chúc mừng, vé trúng ${winCount} giải, tổng ${formattedPrizeA11y}`
      : `${STRINGS.check.resultLostTitle}. ${STRINGS.check.resultLostSubtitle}`;

  return (
    <Animated.View
      testID={testID}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={a11ySummary}
      accessibilityLiveRegion="assertive"
      style={[
        animatedStyle,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
        },
      ]}
      className="mt-4 mx-4 p-5 rounded-2xl border shadow-xs"
    >
      {/* 1. Context Line: Đài · Ngày (T10.30) */}
      <View className="flex-row items-center justify-between pb-1">
        <Text
          testID="result-card-context-line"
          className="text-xs font-semibold tracking-wide"
          style={{ color: colors.textMuted }}
        >
          {stationName ? `${stationName} · ` : ''}{formattedDate}
        </Text>
      </View>

      {/* 2. Hero Ticket Number: Nhân vật chính (T10.30 & T10.32 & T10.37) */}
      <View className="py-2 items-start" testID="result-card-hero-ticket">
        <HighlightedTicket
          ticket={result.ticket ?? ''}
          matchedDigits={longestMatched}
          wins={result.wins as any}
          animated={isWon}
          size="lg"
        />
      </View>

      {/* 3. Status Title 22px bold (T10.30) */}
      <View className="mt-1 mb-3">
        <Text
          testID="result-card-status-title"
          className="text-[22px] leading-7 font-bold tracking-tight"
          style={{
            color: isPending
              ? colors.pending
              : isWon
                ? colors.win
                : colors.textMain,
          }}
        >
          {isPending
            ? STRINGS.check.resultPendingTitle
            : isWon
              ? STRINGS.check.resultWonCount(winCount)
              : STRINGS.check.resultLostBadge}
        </Text>
        <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>
          {isPending
            ? STRINGS.check.resultPendingSubtitle
            : isWon
              ? STRINGS.check.resultWonTitle
              : STRINGS.check.resultLostTitle}
        </Text>
        {!isPending && !isWon && (
          <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
            {STRINGS.check.resultLostSubtitle}
          </Text>
        )}
      </View>

      {/* 4. Body: Pending notice, Wins list, or non-winning notice */}
      {isPending ? (
        <View className="py-2 mb-2" testID="result-card-pending-section">
          {/* Estimated time notice (T10.33) */}
          <View
            testID="result-card-pending-estimate"
            className="p-3 rounded-xl border flex-row items-center mb-3"
            style={{
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
            }}
          >
            <Icon name="clock" size={16} color={colors.pending} />
            <Text
              className="text-xs font-medium ml-2 flex-1 leading-4"
              style={{ color: colors.textMain }}
            >
              {getEstimatedDrawTimeMessage(result.drawDate)}
            </Text>
          </View>
          <Text
            className="text-xs mb-3 leading-4"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.check.pendingNotice}
          </Text>

          {/* Primary Action: Lưu để tự dò lại (T10.33 & T10.58) */}
          {onSaveTicket && (
            <Pressable
              testID="result-card-save-btn"
              onPress={() => {
                haptics.light();
                onSaveTicket(result);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="py-3 px-4 rounded-xl flex-row items-center justify-center space-x-2 shadow-xs min-h-[44px]"
              style={{
                backgroundColor: isSaved ? `${colors.win}15` : colors.primary,
                borderWidth: isSaved ? 1 : 0,
                borderColor: isSaved ? colors.win : 'transparent',
              }}
              accessibilityRole="button"
              accessibilityLabel={
                isSaved ? STRINGS.check.savedPendingTicket : STRINGS.check.savePendingTicket
              }
            >
              <Icon
                name={isSaved ? 'check' : 'bookmark'}
                size={16}
                color={isSaved ? colors.win : '#FFFFFF'}
              />
              <Text
                className="text-sm font-semibold ml-2"
                style={{ color: isSaved ? colors.win : '#FFFFFF' }}
              >
                {isSaved ? STRINGS.check.savedPendingTicket : STRINGS.check.savePendingTicket}
              </Text>
            </Pressable>
          )}

          {/* Secondary Action: Dò lại (T10.33 & T10.58) */}
          {onCheckAgain && (
            <Pressable
              testID="result-card-retry-btn"
              onPress={() => {
                haptics.light();
                onCheckAgain();
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="mt-2 py-2.5 px-4 rounded-xl flex-row items-center justify-center border min-h-[44px]"
              style={({ pressed }) => ({
                borderColor: colors.border,
                backgroundColor: pressed ? colors.surfaceSubtle : colors.surface,
                opacity: pressed ? 0.8 : 1,
              })}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.check.checkAgain}
            >
              <Icon name="refresh" size={16} color={colors.textMuted} />
              <Text
                className="text-sm font-medium ml-2"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.check.checkAgain}
              </Text>
            </Pressable>
          )}
        </View>
      ) : isWon && result.wins && result.wins.length > 0 ? (
        <View className="space-y-1 mb-3">
          <Text
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.check.prizeDetails}
          </Text>
          {result.wins.map((win, idx) => {
            const digits = (win as any).matchedDigits || (win as any).matchedNumber || '';
            const matchLabel = digits
              ? digits.length === 6
                ? `Trùng khớp 6 số · ${digits}`
                : `Khớp ${digits.length} số cuối · ${digits}`
              : '';

            return (
              <View
                key={`${win.tier}-${idx}`}
                className="flex-row justify-between items-center py-2 border-b"
                style={{ borderColor: colors.surfaceSubtle }}
                testID={`prize-row-${idx}`}
              >
                <View className="flex-1 pr-3">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.textMain }}
                  >
                    {(win as any).tierName || win.tier}
                  </Text>
                  {matchLabel ? (
                    <Text
                      className="text-xs mt-0.5"
                      style={{ color: colors.textMuted }}
                    >
                      {matchLabel}
                    </Text>
                  ) : null}
                </View>
                <Text
                  className="text-sm font-bold text-right"
                  style={{
                    color: colors.textMain,
                    fontVariant: ['tabular-nums'],
                  }}
                >
                  {formatCurrency(win.prizeAmount ?? 0)}
                </Text>
              </View>
            );
          })}

          {/* Total prize line (T10.31) */}
          <View
            className="mt-2 pt-3 border-t flex-row justify-between items-baseline"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="text-sm font-semibold"
              style={{ color: colors.textMuted }}
            >
              {STRINGS.check.totalPrizeLabel}{' '}
              <Text
                testID="result-card-total-prize"
                className="text-xl font-bold"
                style={{
                  color: colors.win,
                  fontVariant: ['tabular-nums'],
                }}
              >
                {formatCurrency(displayPrize)}
              </Text>
            </Text>
          </View>

          {/* Tax note (T10.31) */}
          <Text
            testID="result-card-tax-note"
            className="text-[11px] mt-1 text-right italic"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.check.taxNote}
          </Text>
        </View>
      ) : null}

      {/* Save ticket button for WON / LOST state */}
      {!isPending && onSaveTicket && (
        <Pressable
          testID="result-card-save-btn"
          onPress={() => {
            haptics.light();
            onSaveTicket(result);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="mt-2 py-2.5 px-4 rounded-xl flex-row items-center justify-center space-x-2 border min-h-[44px]"
          style={{
            borderColor: isSaved ? colors.win : colors.border,
            backgroundColor: isSaved ? `${colors.win}10` : colors.surface,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            isSaved ? STRINGS.check.savedTicket : STRINGS.check.saveTicket
          }
        >
          <Icon
            name={isSaved ? 'check' : 'bookmark'}
            size={16}
            color={isSaved ? colors.win : colors.textMain}
          />
          <Text
            className="text-sm font-medium ml-1.5"
            style={{ color: isSaved ? colors.win : colors.textMain }}
          >
            {isSaved ? STRINGS.check.savedTicket : STRINGS.check.saveTicket}
          </Text>
        </Pressable>
      )}

      {/* Disclaimer per FR-SYS-03 */}
      <Text
        className="text-xs text-center mt-3 leading-4 italic"
        style={{ color: colors.textMuted }}
      >
        {STRINGS.check.disclaimer}
      </Text>
    </Animated.View>
  );
}
