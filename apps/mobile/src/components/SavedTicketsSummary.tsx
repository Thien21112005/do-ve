import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { formatCurrency } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { STRINGS } from '@/lib/strings';

export type TicketFilterStatus = 'ALL' | 'WON' | 'PENDING' | 'LOST';

export interface SavedTicketsSummaryProps {
  totalTickets: number;
  pendingCount: number;
  wonCount: number;
  totalWonPrize: number;
  activeFilter?: TicketFilterStatus;
  onSelectFilter?: (filter: TicketFilterStatus) => void;
  testID?: string;
}

export function SavedTicketsSummary({
  totalTickets,
  pendingCount,
  wonCount,
  totalWonPrize,
  activeFilter = 'ALL',
  onSelectFilter,
  testID = 'saved-tickets-summary',
}: SavedTicketsSummaryProps) {
  const { colors } = useTheme();

  const handlePress = (filter: TicketFilterStatus) => {
    haptics.selection();
    onSelectFilter?.(filter);
  };

  return (
    <View
      testID={testID}
      className="rounded-2xl border flex-row items-stretch mb-3 overflow-hidden"
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
      }}
    >
      {/* 1. Tổng vé */}
      <TouchableOpacity
        testID="summary-stat-total"
        accessibilityRole="button"
        accessibilityLabel={`${STRINGS.tickets.summaryTotal}: ${totalTickets} vé`}
        accessibilityState={{ selected: activeFilter === 'ALL' }}
        onPress={() => handlePress('ALL')}
        className="flex-1 py-3 px-2 items-center justify-center"
        style={{
          backgroundColor:
            activeFilter === 'ALL' ? colors.surfaceSubtle : colors.surface,
        }}
      >
        <Text
          className="text-xs font-medium"
          style={{
            color: activeFilter === 'ALL' ? colors.primary : colors.textMuted,
          }}
        >
          {STRINGS.tickets.summaryTotal}
        </Text>
        <Text
          className="text-xl font-bold mt-0.5"
          style={{
            color: colors.textMain,
            fontVariant: ['tabular-nums'],
          }}
        >
          {totalTickets}
        </Text>
        <Text
          className="text-[11px] mt-0.5"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.tickets.summaryAllSubtitle}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View
        className="w-[1px] my-2"
        style={{ backgroundColor: colors.border }}
      />

      {/* 2. Đang chờ */}
      <TouchableOpacity
        testID="summary-stat-pending"
        accessibilityRole="button"
        accessibilityLabel={`${STRINGS.tickets.summaryPending}: ${pendingCount} vé`}
        accessibilityState={{ selected: activeFilter === 'PENDING' }}
        onPress={() => handlePress('PENDING')}
        className="flex-1 py-3 px-2 items-center justify-center"
        style={{
          backgroundColor:
            activeFilter === 'PENDING' ? colors.surfaceSubtle : colors.surface,
        }}
      >
        <Text
          className="text-xs font-medium"
          style={{
            color: activeFilter === 'PENDING' ? colors.pending : colors.textMuted,
          }}
        >
          {STRINGS.tickets.summaryPending}
        </Text>
        <Text
          className="text-xl font-bold mt-0.5"
          style={{
            color: pendingCount > 0 ? colors.pending : colors.textMain,
            fontVariant: ['tabular-nums'],
          }}
        >
          {pendingCount}
        </Text>
        <Text
          className="text-[11px] mt-0.5"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.tickets.summaryPendingSubtitle}
        </Text>
      </TouchableOpacity>

      {/* Divider */}
      <View
        className="w-[1px] my-2"
        style={{ backgroundColor: colors.border }}
      />

      {/* 3. Tiền trúng */}
      <TouchableOpacity
        testID="summary-stat-won"
        accessibilityRole="button"
        accessibilityLabel={`${STRINGS.tickets.summaryWon}: ${formatCurrency(totalWonPrize)}`}
        accessibilityState={{ selected: activeFilter === 'WON' }}
        onPress={() => handlePress('WON')}
        className="flex-1 py-3 px-2 items-center justify-center"
        style={{
          backgroundColor:
            activeFilter === 'WON' ? colors.surfaceSubtle : colors.surface,
        }}
      >
        <Text
          className="text-xs font-medium"
          style={{
            color: activeFilter === 'WON' ? colors.win : colors.textMuted,
          }}
        >
          {STRINGS.tickets.summaryWon}
        </Text>
        <Text
          className="text-base font-bold mt-0.5 text-center"
          numberOfLines={1}
          style={{
            color: totalWonPrize > 0 ? colors.win : colors.textMain,
            fontVariant: ['tabular-nums'],
          }}
        >
          {formatCurrency(totalWonPrize)}
        </Text>
        <Text
          className="text-[11px] mt-0.5"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.tickets.summaryWonSubtitle(wonCount)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
