import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSavedTickets } from '@/store/ticketStore';
import { useTheme } from '@/theme';
import { Icon, TicketStatusBadge } from '@/components';
import { formatCurrency, formatDateVN } from '@/lib/format';
import { STRINGS } from '@/lib/strings';
import type { SavedTicket } from '@/types';

export default function TicketsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tickets] = useSavedTickets();

  // Sort tickets: drawDate desc, createdAt desc
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const dateCmp = b.drawDate.localeCompare(a.drawDate);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tickets]);

  const renderItem = ({ item, index }: ListRenderItemInfo<SavedTicket>) => {
    const prevItem = index > 0 ? sortedTickets[index - 1] : null;
    const isNewDateGroup = !prevItem || prevItem.drawDate !== item.drawDate;
    const isWon = item.status === 'WON';
    const isPending = item.status === 'PENDING';

    return (
      <View>
        {isNewDateGroup && (
          <View className="pt-4 pb-2 px-1 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon name="calendar" size={14} color={colors.textMuted} />
              <Text
                className="text-xs font-bold uppercase tracking-wider ml-1.5"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.tickets.drawDateGroup(formatDateVN(item.drawDate))}
              </Text>
            </View>
          </View>
        )}

        <View
          testID={`saved-ticket-item-${item.id}`}
          accessible={true}
          accessibilityRole="text"
          className="mb-3 p-4 rounded-2xl border shadow-sm"
          style={{
            backgroundColor: isPending
              ? colors.pendingBg
              : isWon
                ? colors.winBg
                : colors.surface,
            borderColor: isPending
              ? colors.pendingBorder
              : isWon
                ? colors.winBorder
                : colors.border,
          }}
        >
          {/* Top row: Station & Draw Date */}
          <View
            className="flex-row items-center justify-between pb-2.5 border-b"
            style={{ borderColor: colors.border }}
          >
            <View className="flex-row items-center">
              <Text
                className="text-sm font-semibold"
                style={{ color: colors.textMain }}
              >
                {item.stationName || item.station}
              </Text>
            </View>

            {/* Status Badge */}
            <TicketStatusBadge
              status={item.status}
              totalPrize={item.totalPrize}
              size="sm"
            />
          </View>

          {/* Ticket Number & Prize Info */}
          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <Text
                className="text-[11px] font-medium"
                style={{ color: colors.textMuted }}
              >
                Số vé
              </Text>
              <Text
                className="text-2xl font-mono font-bold tracking-widest mt-0.5"
                style={{ color: colors.textMain }}
              >
                {item.ticket}
              </Text>
            </View>

            {isWon && (
              <View className="items-end">
                <Text
                  className="text-[11px] font-medium"
                  style={{ color: colors.win }}
                >
                  {STRINGS.tickets.totalPrizePrefix}
                </Text>
                <Text
                  className="text-lg font-bold mt-0.5"
                  style={{ color: colors.win }}
                >
                  {formatCurrency(item.totalPrize)}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      testID="tickets-screen"
    >
      {sortedTickets.length === 0 ? (
        <View
          testID="saved-tickets-empty"
          className="flex-1 items-center justify-center p-6 text-center"
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: colors.surfaceSubtle }}
          >
            <Icon name="bookmark" size={28} color={colors.textMuted} />
          </View>
          <Text
            className="text-lg font-bold text-center mb-2"
            style={{ color: colors.textMain }}
            accessibilityRole="header"
          >
            {STRINGS.tickets.emptyTitle}
          </Text>
          <Text
            className="text-sm text-center leading-relaxed max-w-[280px] mb-6"
            style={{ color: colors.textMuted }}
          >
            {STRINGS.tickets.emptyDesc}
          </Text>
          <TouchableOpacity
            testID="tickets-empty-check-btn"
            onPress={() => router.push('/(tabs)/check')}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.tickets.emptyAction}
            className="px-6 py-3 rounded-xl shadow-sm flex-row items-center"
            style={{ backgroundColor: colors.primary }}
          >
            <Icon name="ticket" size={18} color="#ffffff" />
            <Text className="text-white text-sm font-semibold ml-2">
              {STRINGS.tickets.emptyAction}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          testID="saved-tickets-list"
          data={sortedTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          ListHeaderComponent={
            <View
              className="py-2 flex-row justify-between items-center border-b mb-1"
              style={{ borderColor: colors.border }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.tickets.ticketCount(sortedTickets.length)}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
