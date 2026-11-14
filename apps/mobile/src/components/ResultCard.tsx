import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
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
import type { CheckTicketResponse } from '@/types';

export interface ResultCardProps {
  result: CheckTicketResponse;
  onSaveTicket?: (result: CheckTicketResponse) => void;
  isSaved?: boolean;
  onCheckAgain?: () => void;
  testID?: string;
}

export function ResultCard({
  result,
  onSaveTicket,
  isSaved = false,
  testID = 'result-card',
}: ResultCardProps) {
  const { colors } = useTheme();
  const isWon = Boolean(result.won);
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
  const formattedDate = formatDateVN(result.drawDate);
  const longestMatched = getLongestMatchedSuffix(result.ticket, result.wins);

  return (
    <Animated.View
      testID={testID}
      style={[
        animatedStyle,
        {
          backgroundColor: isWon ? colors.winBg : colors.surface,
          borderColor: isWon ? colors.winBorder : colors.border,
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
              backgroundColor: isWon ? `${colors.win}1A` : colors.surfaceSubtle,
            }}
          >
            <Icon
              name={isWon ? 'trophy' : 'info'}
              size={20}
              color={isWon ? colors.win : colors.textMuted}
            />
          </View>
          <View className="ml-3">
            <Text
              className="text-base font-bold tracking-tight"
              style={{ color: isWon ? colors.win : colors.textMain }}
            >
              {isWon
                ? 'Chúc mừng bạn đã trúng thưởng!'
                : 'Rất tiếc, vé không trúng giải'}
            </Text>
            <Text className="text-xs" style={{ color: colors.textMuted }}>
              {isWon ? `Trúng ${winCount} giải` : 'Chúc bạn may mắn lần sau'}
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
              TRÚNG
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
            Số vé dò
          </Text>
          <HighlightedTicket
            ticket={result.ticket}
            matchedDigits={longestMatched}
            size="md"
          />
        </View>
        <View className="items-end">
          <Text
            className="text-xs font-medium"
            style={{ color: colors.textMain }}
          >
            {result.stationName}
          </Text>
          <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
            Ngày {formattedDate}
          </Text>
        </View>
      </View>

      {/* Wins list or empty message */}
      {isWon && result.wins && result.wins.length > 0 ? (
        <View className="space-y-2 mb-3">
          <Text
            className="text-xs font-semibold uppercase tracking-wider mb-1"
            style={{ color: colors.textMuted }}
          >
            Chi tiết giải trúng
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
                  {win.tierName}
                </Text>
                {win.matchedDigits ? (
                  <Text
                    className="text-xs font-mono ml-2 px-1.5 py-0.5 rounded"
                    style={{
                      color: colors.primary,
                      backgroundColor: colors.primarySubtle,
                    }}
                  >
                    ({win.matchedDigits})
                  </Text>
                ) : null}
              </View>
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.textMain }}
              >
                {formatCurrency(win.prizeAmount)}
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
              Tổng thưởng:{' '}
              <Text className="text-lg font-bold" style={{ color: colors.win }}>
                {formatCurrency(result.totalPrize)}
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
            Vé số {result.ticket} không trùng với các bộ số mở thưởng kỳ quay
            này.
          </Text>
        </View>
      )}

      {/* Save ticket button if callback provided */}
      {onSaveTicket && (
        <Pressable
          testID="result-card-save-btn"
          onPress={() => onSaveTicket(result)}
          className="mt-2 py-2.5 px-4 rounded-xl flex-row items-center justify-center space-x-2 border"
          style={{
            borderColor: isSaved ? colors.win : colors.border,
            backgroundColor: isSaved ? `${colors.win}10` : colors.surface,
          }}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Đã lưu vé' : 'Lưu vé vào danh sách'}
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
            {isSaved ? 'Đã lưu vé' : 'Lưu vé này'}
          </Text>
        </Pressable>
      )}

      {/* Disclaimer per FR-SYS-03 */}
      <Text
        className="text-[11px] text-center mt-3 leading-4 italic"
        style={{ color: colors.textMuted }}
      >
        Kết quả chỉ mang tính tham khảo, vui lòng đối chiếu với tờ vé giấy tại
        đại lý xổ số.
      </Text>
    </Animated.View>
  );
}
