import React, { useState, useMemo } from 'react';
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
  const [filterWonOnly, setFilterWonOnly] = useState(false);

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

  // T10.34: Sort winning tickets to the top and filter by won state
  const displayResults = useMemo(() => {
    const rawList = (batchResult.results || []).map((item, originalIndex) => ({
      ...item,
      originalIndex,
    }));

    const sorted = [...rawList].sort((a, b) => {
      const aWon = a.won === true ? 1 : 0;
      const bWon = b.won === true ? 1 : 0;
      return bWon - aWon;
    });

    if (filterWonOnly) {
      return sorted.filter((item) => item.won === true);
    }
    return sorted;
  }, [batchResult.results, filterWonOnly]);

  return (
    <View testID={testID} className="w-full">
      {/* 1. Compact Summary Bar (T10.34) */}
      <View
        testID="batch-summary-bar"
        className="p-4 rounded-xl border mb-3"
        style={{
          backgroundColor: hasWon ? colors.winBg : colors.surface,
          borderColor: hasWon ? colors.winBorder : colors.border,
        }}
      >
        <Text
          className="text-xs font-semibold tracking-wide"
          style={{ color: colors.textMuted }}
        >
          Đài {stationName} · {formattedDrawDate}
        </Text>
        <Text
          className="text-sm font-medium mt-1 leading-5"
          style={{ color: colors.textMain }}
        >
          Dò {totalTickets} vé ·{' '}
          <Text
            className="font-bold"
            style={{ color: hasWon ? colors.win : colors.textMain }}
          >
            {wonTickets} vé trúng
          </Text>
          {' · '}
          <Text
            className="font-bold"
            style={{
              color: hasWon ? colors.win : colors.textMain,
              fontVariant: ['tabular-nums'],
            }}
          >
            {formatCurrency(totalPrize)}
          </Text>
        </Text>
      </View>

      {/* 2. Filter Bar (T10.34: Chỉ vé trúng) */}
      {hasWon && (
        <View className="flex-row items-center space-x-2 mb-3">
          <Pressable
            testID="batch-filter-all"
            onPress={() => setFilterWonOnly(false)}
            className="px-3 py-1.5 rounded-full border mr-2"
            style={{
              backgroundColor: !filterWonOnly ? colors.primary : colors.surface,
              borderColor: !filterWonOnly ? colors.primary : colors.border,
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: !filterWonOnly }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: !filterWonOnly ? '#FFFFFF' : colors.textMain }}
            >
              Tất cả ({totalTickets})
            </Text>
          </Pressable>

          <Pressable
            testID="batch-filter-won"
            onPress={() => setFilterWonOnly(true)}
            className="px-3 py-1.5 rounded-full border"
            style={{
              backgroundColor: filterWonOnly ? colors.win : colors.surface,
              borderColor: filterWonOnly ? colors.win : colors.border,
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: filterWonOnly }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: filterWonOnly ? '#FFFFFF' : colors.win }}
            >
              Chỉ vé trúng ({wonTickets})
            </Text>
          </Pressable>
        </View>
      )}

      {/* 3. Flat Rows List (T10.34) */}
      <View
        className="rounded-xl border overflow-hidden mb-4"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
        }}
      >
        {displayResults.map((item) => {
          const isItemWon = item.won === true;
          const isNotAvailable = item.status === 'RESULT_NOT_AVAILABLE';
          const itemTotalPrize =
            typeof (item as any).totalPrize === 'number'
              ? (item as any).totalPrize
              : typeof (item as any).totalAmount === 'number'
                ? (item as any).totalAmount
                : 0;

          return (
            <View
              key={`batch-item-${item.ticket}`}
              testID={`batch-item-${item.ticket}`}
              className="p-3 border-b flex-row items-center justify-between"
              style={{ borderColor: colors.surfaceSubtle }}
            >
              {/* Left: Index & Ticket Number */}
              <View className="flex-row items-center flex-1 pr-2">
                <Text
                  className="text-xs font-medium mr-2 w-6 text-right"
                  style={{ color: colors.textMuted }}
                >
                  #{item.originalIndex + 1}
                </Text>
                {isItemWon && item.wins && item.wins.length > 0 ? (
                  <HighlightedTicket
                    ticket={item.ticket ?? ''}
                    matchedDigits={getLongestMatchedSuffix(
                      item.ticket ?? '',
                      item.wins as any,
                    )}
                    wins={item.wins as any}
                    size="sm"
                  />
                ) : (
                  <Text
                    className="text-base font-bold tracking-wider"
                    style={{
                      color: colors.textMain,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {item.ticket}
                  </Text>
                )}
              </View>

              {/* Middle: Match Status Text */}
              <View className="flex-1 px-2 items-start">
                {isItemWon && item.wins && (
                  <View className="space-y-0.5">
                    {item.wins.map((win, winIdx) => (
                      <Text
                        key={`${win.tier}-${winIdx}`}
                        className="text-xs font-semibold"
                        style={{ color: colors.win }}
                      >
                        {(win as any).tierName || win.tier}
                      </Text>
                    ))}
                  </View>
                )}
                {isNotAvailable && (
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.pending }}
                  >
                    Chưa có kết quả
                  </Text>
                )}
                {!isItemWon && !isNotAvailable && (
                  <Text
                    className="text-xs"
                    style={{ color: colors.textMuted }}
                  >
                    Không trúng
                  </Text>
                )}
              </View>

              {/* Right: Tabular Prize Amount */}
              <View className="items-end min-w-[70px]">
                {isItemWon ? (
                  <Text
                    className="text-sm font-bold text-right"
                    style={{
                      color: colors.win,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    {formatCurrency(itemTotalPrize)}
                  </Text>
                ) : (
                  <Text
                    className="text-sm text-right font-medium"
                    style={{
                      color: colors.textMuted,
                      fontVariant: ['tabular-nums'],
                    }}
                  >
                    —
                  </Text>
                )}
              </View>
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
            className="py-3 px-5 rounded-xl border flex-row items-center justify-center active:opacity-70"
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
          className="text-xs text-center leading-relaxed italic"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.check.disclaimer}
        </Text>
      </View>
    </View>
  );
};
