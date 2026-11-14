import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Icon } from './Icon';
import {
  HighlightedTicket,
  getLongestMatchedSuffix,
} from './HighlightedTicket';
import { CelebrationEffect } from './CelebrationEffect';
import { useTheme } from '../theme';
import { formatCurrency, formatDateVN } from '../lib/format';
import type { BatchCheckResponse } from '../types';

export interface BatchResultListProps {
  batchResult: BatchCheckResponse;
  onCheckAgain?: () => void;
  testID?: string;
}

export const BatchResultList: React.FC<BatchResultListProps> = ({
  batchResult,
  onCheckAgain,
  testID = 'batch-result-list',
}) => {
  const { colors } = useTheme();

  const totalTickets = batchResult.results.length;
  const wonTickets = batchResult.totalWonTickets;
  const hasWon = wonTickets > 0;
  const formattedDrawDate = formatDateVN(batchResult.drawDate);

  return (
    <View testID={testID} className="w-full">
      {/* Celebration Effect if any ticket won */}
      <CelebrationEffect active={hasWon} />

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
              Kết quả dò hàng loạt
            </Text>
            <Text
              className="text-xs mt-0.5"
              style={{ color: colors.textMuted }}
            >
              Đài {batchResult.station} • Ngày {formattedDrawDate}
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
              {hasWon ? `${wonTickets} vé trúng` : 'Không trúng'}
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
              Tổng tiền thưởng
            </Text>
            <Text
              className={`text-2xl font-black mt-0.5 ${hasWon ? '' : ''}`}
              style={{
                color: hasWon ? colors.win : colors.textMain,
                fontVariant: ['tabular-nums'],
              }}
            >
              {formatCurrency(batchResult.totalPrize)}
            </Text>
          </View>

          <View className="items-end">
            <Text
              className="text-xs font-medium"
              style={{ color: colors.textMuted }}
            >
              Số lượng kiểm tra
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
          Chi tiết từng vé ({totalTickets})
        </Text>

        {batchResult.results.map((item, index) => {
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
                      ticket={item.ticket}
                      matchedDigits={getLongestMatchedSuffix(
                        item.ticket,
                        item.wins,
                      )}
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
                    className="text-[11px] font-bold"
                    style={{
                      color: isItemWon
                        ? colors.win
                        : isNotAvailable
                          ? colors.pending
                          : colors.textMuted,
                    }}
                  >
                    {isItemWon
                      ? `TRÚNG ${item.wins.length} GIẢI`
                      : isNotAvailable
                        ? 'CHƯA CÓ KẾT QUẢ'
                        : 'KHÔNG TRÚNG'}
                  </Text>
                </View>
              </View>

              {/* Item Content */}
              {isItemWon && (
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
                        {win.tierName}
                      </Text>
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color: colors.win,
                          fontVariant: ['tabular-nums'],
                        }}
                      >
                        {formatCurrency(win.prizeAmount)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {!isItemWon && !isNotAvailable && (
                <View className="pt-2">
                  <Text className="text-xs" style={{ color: colors.textMuted }}>
                    Không trúng giải nào trong kỳ mở thưởng này.
                  </Text>
                </View>
              )}

              {isNotAvailable && (
                <View className="pt-2">
                  <Text
                    className="text-xs font-medium"
                    style={{ color: colors.pending }}
                  >
                    Chưa có kết quả mở thưởng (thường có sau 16h30).
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
            accessibilityLabel="Dò lại danh sách khác"
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
              Dò danh sách khác
            </Text>
          </Pressable>
        </View>
      )}

      {/* Disclaimer */}
      <View className="mt-4 px-2">
        <Text
          className="text-[11px] text-center leading-relaxed"
          style={{ color: colors.textMuted }}
        >
          Kết quả chỉ mang tính chất tham khảo, vui lòng đối chiếu vé giấy tại
          các đại lý vé số chính thức (FR-SYS-03).
        </Text>
      </View>
    </View>
  );
};
