import React, { useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { Icon } from './Icon';
import {
  HighlightedTicket,
  getLongestMatchedSuffix,
} from './HighlightedTicket';
import { formatCurrency, formatDateVN } from '@/lib/format';
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
  const isPending = result.status === 'RESULT_NOT_AVAILABLE';
  const isWon = !isPending && Boolean(result.won);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.ease),
    });
  }, [opacity, translateY]);

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

  const a11ySummary = isPending
    ? `${STRINGS.check.resultPendingTitle}. ${STRINGS.check.resultPendingSubtitle}`
    : isWon
      ? `${STRINGS.check.resultWonTitle}. ${STRINGS.check.resultWonCount(winCount)}. ${STRINGS.check.totalPrizeLabel} ${formatCurrency(totalPrize)}`
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

      {/* 2. Hero Ticket Number: Nhân vật chính (T10.30) */}
      <View className="py-2 items-start" testID="result-card-hero-ticket">
        <HighlightedTicket
          ticket={result.ticket ?? ''}
          matchedDigits={longestMatched}
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
            ? 'Chưa có kết quả'
            : isWon
              ? (winCount > 1 ? `Trúng ${winCount} giải` : 'Trúng 1 giải')
              : 'Không trúng'}
        </Text>
        <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>
          {isPending
            ? 'Chưa có kết quả, thường có sau 16h35'
            : isWon
              ? `Vé số ${result.ticket} trùng khớp giải mở thưởng`
              : 'Vé không trùng với các bộ số mở thưởng kỳ này'}
        </Text>
      </View>

      {/* 4. Body: Pending notice, Wins list, or non-winning notice */}
      {isPending ? (
        <View className="py-2 mb-2">
          {/* Dò lại button */}
          {onCheckAgain && (
            <TouchableOpacity
              testID="result-card-retry-btn"
              onPress={onCheckAgain}
              className="mt-2 py-2.5 px-4 rounded-xl flex-row items-center justify-center border"
              style={{
                borderColor: colors.pending,
                backgroundColor: `${colors.pending}15`,
              }}
              accessibilityRole="button"
              accessibilityLabel="Dò lại kết quả"
            >
              <Icon name="refresh" size={16} color={colors.pending} />
              <Text
                className="text-sm font-semibold ml-2"
                style={{ color: colors.pending }}
              >
                {STRINGS.check.checkAgain}
              </Text>
            </TouchableOpacity>
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
              Tổng tiền thưởng
            </Text>
            <Text
              testID="result-card-total-prize"
              className="text-xl font-bold text-right"
              style={{
                color: colors.win,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatCurrency(totalPrize)}
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

      {/* Save ticket button if callback provided */}
      {onSaveTicket && (
        <Pressable
          testID="result-card-save-btn"
          onPress={() => {
            haptics.light();
            onSaveTicket(result);
          }}
          className="mt-2 py-2.5 px-4 rounded-xl flex-row items-center justify-center space-x-2 border"
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
            {isSaved
              ? STRINGS.check.savedTicket
              : isPending
                ? STRINGS.check.savePendingTicket
                : STRINGS.check.saveTicket}
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
