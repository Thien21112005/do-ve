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
      className="mt-6 mx-5 p-5 rounded-2xl border shadow-sm"
    >
      {/* Header status */}
      <View
        className="flex-row items-center justify-between pb-3 border-b"
        style={{ borderColor: colors.border }}
      >
        <View className="flex-row items-center space-x-2.5">
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: isPending
                ? `${colors.pending}1A`
                : isWon
                  ? `${colors.win}1A`
                  : colors.surfaceSubtle,
            }}
          >
            <Icon
              name={isPending ? 'clock' : isWon ? 'trophy' : 'info'}
              size={20}
              color={
                isPending
                  ? colors.pending
                  : isWon
                    ? colors.win
                    : colors.textMuted
              }
            />
          </View>
          <View className="ml-3">
            <Text
              className="text-base font-bold tracking-tight"
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
                  ? STRINGS.check.resultWonTitle
                  : STRINGS.check.resultLostTitle}
            </Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {isPending
                ? STRINGS.check.resultPendingSubtitle
                : isWon
                  ? STRINGS.check.resultWonCount(winCount)
                  : STRINGS.check.resultLostSubtitle}
            </Text>
          </View>
        </View>

        {isWon && (
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${colors.win}20` }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.win }}
            >
              {STRINGS.check.resultWonBadge}
            </Text>
          </View>
        )}

        {isPending && (
          <View
            className="px-2.5 py-1 rounded-full"
            style={{ backgroundColor: `${colors.pending}20` }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: colors.pending }}
            >
              {STRINGS.check.resultPendingBadge}
            </Text>
          </View>
        )}
      </View>

      {/* Ticket Details */}
      <View
        className="my-3.5 p-3 rounded-xl flex-row justify-between items-center"
        style={{ backgroundColor: colors.surfaceSubtle }}
      >
        <View>
          <Text className="text-xs mb-0.5" style={{ color: colors.textMuted }}>
            {STRINGS.check.ticketNumberLabel}
          </Text>
          <HighlightedTicket
            ticket={result.ticket ?? ''}
            matchedDigits={longestMatched}
            size="md"
          />
        </View>
        <View className="items-end">
          <Text
            className="text-xs font-medium"
            style={{ color: colors.textMain }}
          >
            {stationName}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
            Ngày {formattedDate}
          </Text>
        </View>
      </View>

      {/* Body: Pending notice, Wins list, or non-winning notice */}
      {isPending ? (
        <View className="py-2.5 mb-2">
          <Text
            className="text-sm leading-relaxed"
            style={{ color: colors.textMain }}
          >
            {STRINGS.check.pendingNotice}
          </Text>

          {/* Dò lại button */}
          {onCheckAgain && (
            <TouchableOpacity
              testID="result-card-retry-btn"
              onPress={onCheckAgain}
              className="mt-3.5 py-2.5 px-4 rounded-xl flex-row items-center justify-center border"
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
        <View className="space-y-2 mb-3">
          <Text
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.check.prizeDetails}
          </Text>
          {result.wins.map((win, idx) => (
            <View
              key={`${win.tier}-${idx}`}
              className="flex-row justify-between items-center py-1.5"
            >
              <View className="flex-row items-center">
                <Text
                  className="text-sm font-medium"
                  style={{ color: colors.textMain }}
                >
                  {(win as any).tierName || win.tier}
                </Text>
                {((win as any).matchedDigits || (win as any).matchedNumber) ? (
                  <Text
                    className="text-xs font-mono ml-2 px-1.5 py-0.5 rounded"
                    style={{
                      color: colors.primary,
                      backgroundColor: colors.primarySubtle,
                    }}
                  >
                    ({(win as any).matchedDigits || (win as any).matchedNumber})
                  </Text>
                ) : null}
              </View>
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.textMain }}
              >
                {formatCurrency(win.prizeAmount ?? 0)}
              </Text>
            </View>
          ))}

          {/* Total prize line */}
          <View
            className="mt-2 pt-3 border-t flex-row justify-between items-center"
            style={{ borderColor: colors.border }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: colors.textMain }}
            >
              {STRINGS.check.totalPrizeLabel}{' '}
              <Text className="text-lg font-bold" style={{ color: colors.win }}>
                {formatCurrency(totalPrize)}
              </Text>
            </Text>
          </View>
        </View>
      ) : (
        <View className="py-2 mb-2">
          <Text
            className="text-sm text-center leading-relaxed"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.check.lostNotice(result.ticket ?? '')}
          </Text>
        </View>
      )}

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
        className="text-[11px] text-center mt-3 leading-4 italic"
        style={{ color: colors.textMuted }}
      >
        {STRINGS.check.disclaimer}
      </Text>
    </Animated.View>
  );
}
