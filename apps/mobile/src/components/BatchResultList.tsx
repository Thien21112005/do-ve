import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from './Icon';
import {
  HighlightedTicket,
  getLongestMatchedSuffix,
} from './HighlightedTicket';
import { useTheme } from '../theme';
import { formatCurrency, formatDateVN } from '../lib/format';
import { STRINGS } from '../lib/strings';
import type { BatchCheckResponse } from '../types';
import { getStationName, type UiBatchResult } from '../api/mappers';

export interface BatchResultListProps {
  batchResult: UiBatchResult | BatchCheckResponse;
  onCheckAgain?: () => void;
  testID?: string;
}

export const BatchResultList: React.FC<BatchResultListProps> = ({
  batchResult,
  onCheckAgain,
  testID = 'batch-result-list',
}) => {
  const { colors } = useTheme();

  const totalTickets = batchResult.results?.length || 0;
  const wonTickets =
    typeof (batchResult as any).totalWonTickets === 'number'
      ? (batchResult as any).totalWonTickets
      : (batchResult.results || []).filter((r) => r.won).length;
  const hasWon = wonTickets > 0;
  const formattedDrawDate = formatDateVN(batchResult.drawDate ?? '');
  const rawStation =
    (batchResult as any).stationName ||
    (batchResult as any).station ||
    (batchResult as any).stationCode ||
    '';
  const stationName = getStationName(rawStation);
  const totalPrize =
    typeof (batchResult as any).totalPrize === 'number'
      ? (batchResult as any).totalPrize
      : typeof (batchResult as any).totalAmount === 'number'
        ? (batchResult as any).totalAmount
        : 0;

  return (
    <View testID={testID} className="w-full">
      {/* Summary Header Card */}
      <View
        className="p-5 rounded-2xl border mb-4 shadow-sm"
        style={{
          backgroundColor: hasWon ? colors.winBg : colors.surface,
          borderColor: hasWon ? colors.winBorder : colors.border,
        }}
      >
        <View
          className="flex-row items-center justify-between pb-3 border-b"
          style={{ borderColor: colors.border }}
        >
          <View>
            <Text
              className="text-base font-bold"
              style={{ color: colors.textMain }}
            >
              {STRINGS.check.batchResultTitle}
            </Text>
            <Text
              className="text-xs mt-0.5"
              style={{ color: colors.textMuted }}
            >
              Đài {stationName} • Ngày {formattedDrawDate}
            </Text>
          </View>
          <View
            className="px-2.5 py-1 rounded-full flex-row items-center"
            style={{
              backgroundColor: hasWon
                ? `${colors.win}1A`
                : `${colors.border}66`,
            }}
          >
            {hasWon ? (
              <Icon name="trophy" size={13} color={colors.win} />
            ) : (
              <Icon name="ticket" size={13} color={colors.textMuted} />
            )}
            <Text
              className="text-xs font-bold ml-1"
              style={{ color: hasWon ? colors.win : colors.textMuted }}
            >
              {hasWon
                ? STRINGS.check.batchWonCount(wonTickets)
                : STRINGS.check.batchNotWon}
            </Text>
          </View>
        </View>

        {/* Total Prize & Stats */}
        <View className="pt-3.5 flex-row items-center justify-between">
          <View>
            <Text
              className="text-xs font-medium"
              style={{ color: colors.textMuted }}
            >
              {STRINGS.check.batchTotalPrize}
            </Text>
            <Text
              className="text-2xl font-bold mt-0.5"
              style={{
                color: hasWon ? colors.win : colors.textMain,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatCurrency(totalPrize)}
            </Text>
          </View>

          <View className="items-end">
            <Text
              className="text-xs font-medium"
              style={{ color: colors.textMuted }}
            >
              {STRINGS.check.batchCheckedCountLabel}
            </Text>
            <Text
              className="text-base font-bold mt-0.5"
              style={{ color: colors.textMain }}
            >
              {totalTickets} vé
            </Text>
          </View>
        </View>
      </View>

      {/* List of checked tickets */}
      <View className="mb-4">
        <Text
          className="text-sm font-bold mb-2.5 px-1"
          style={{ color: colors.textMain }}
        >
          {STRINGS.check.batchTicketDetails(totalTickets)}
        </Text>

        {(batchResult.results || []).map((item, index) => {
          const isItemWon = item.won === true;
          const isNotAvailable = item.status === 'RESULT_NOT_AVAILABLE';

          return (
            <View
              key={`${item.ticket}-${index}`}
              testID={`batch-item-${item.ticket}`}
              className="p-4 rounded-2xl border mb-2.5 shadow-sm"
              style={{
                backgroundColor: isItemWon
                  ? colors.winBg
                  : isNotAvailable
                    ? colors.pendingBg
                    : colors.surface,
                borderColor: isItemWon
                  ? colors.winBorder
                  : isNotAvailable
                    ? colors.pendingBorder
                    : colors.border,
              }}
            >
              {/* Item Header */}
              <View
                className="flex-row items-center justify-between pb-2 border-b"
                style={{ borderColor: colors.border }}
              >
                <View className="flex-row items-center">
                  <Text
                    className="text-xs font-semibold mr-2"
                    style={{ color: colors.textMuted }}
                  >
                    #{index + 1}
                  </Text>
                  {isItemWon && item.wins && item.wins.length > 0 ? (
                    <HighlightedTicket
                      ticket={item.ticket ?? ''}
                      matchedDigits={getLongestMatchedSuffix(
                        item.ticket ?? '',
                        item.wins as any,
                      )}
                      wins={item.wins as any}
                    />
                  ) : (
                    <Text
                      className="text-lg font-bold tracking-widest"
                      style={{
                        color: colors.textMain,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {item.ticket}
                    </Text>
                  )}
                </View>

                {/* Status Badge */}
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isItemWon
                      ? `${colors.win}20`
                      : isNotAvailable
                        ? `${colors.pending}20`
                        : `${colors.border}66`,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{
                      color: isItemWon
                        ? colors.win
                        : isNotAvailable
                          ? colors.pending
                          : colors.textMuted,
                    }}
                  >
                    {isItemWon
                      ? STRINGS.check.batchItemWonBadge(item.wins ? item.wins.length : 0)
                      : isNotAvailable
                        ? STRINGS.check.batchItemPendingBadge
                        : STRINGS.check.batchItemNotWonBadge}
                  </Text>
                </View>
              </View>

              {/* Item Content */}
              {isItemWon && item.wins && (
                <View className="pt-2">
                  {item.wins.map((win, winIdx) => (
                    <View
                      key={`${win.tier}-${winIdx}`}
                      className="flex-row items-center justify-between py-1"
                    >
                      <Text
                        className="text-xs font-semibold"
                        style={{ color: colors.win }}
                      >
                        {(win as any).tierName || win.tier}
                      </Text>
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: colors.win,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {formatCurrency((win as any).prizeAmount ?? 0)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {!isItemWon && !isNotAvailable && (
                <View className="pt-2">
                  <Text className="text-xs" style={{ color: colors.textMuted }}>
                    {STRINGS.check.batchItemNotWonNotice}
                  </Text>
                </View>
              )}

              {isNotAvailable && (
                <View className="pt-2">
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.pending }}
                  >
                    {STRINGS.check.batchItemPendingNotice}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Action: Dò lại button */}
      {onCheckAgain && (
        <View className="my-2">
          <Pressable
            testID="batch-check-again-btn"
            accessibilityRole="button"
            accessibilityLabel={STRINGS.check.batchCheckAgain}
            onPress={onCheckAgain}
            className="py-3.5 px-5 rounded-xl border flex-row items-center justify-center active:opacity-70"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Icon name="refresh" size={16} color={colors.textMain} />
            <Text
              className="ml-2 text-sm font-bold"
              style={{ color: colors.textMain }}
            >
              {STRINGS.check.batchCheckAgain}
            </Text>
          </Pressable>
        </View>
      )}

      {/* Disclaimer */}
      <View className="mt-4 px-2">
        <Text
          className="text-xs text-center leading-relaxed"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.check.disclaimer}
        </Text>
      </View>
    </View>
  );
};
