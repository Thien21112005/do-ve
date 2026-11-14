import React, { useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSavedTickets } from '@/store/ticketStore';
import { exportTicketsToJson } from '@/store';
import { useTheme } from '@/theme';
import { Icon, TicketStatusBadge } from '@/components';
import { usePendingTicketsRecheck } from '@/hooks';
import { formatCurrency, formatDateVN } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { STRINGS } from '@/lib/strings';
import type { SavedTicket } from '@/types';

export default function TicketsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tickets, { remove, clearAll }] = useSavedTickets();

  // Auto recheck PENDING tickets on mount & foreground
  usePendingTicketsRecheck();

  // Sort tickets: drawDate desc, createdAt desc
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const dateCmp = b.drawDate.localeCompare(a.drawDate);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tickets]);

  const handleDeleteTicket = (id: string, ticketNumber: string) => {
    Alert.alert(
      STRINGS.tickets.deleteConfirmTitle,
      `${STRINGS.tickets.deleteConfirmMsg}\nSố vé: ${ticketNumber}`,
      [
        { text: STRINGS.common.cancel, style: 'cancel' },
        {
          text: STRINGS.common.confirm,
          style: 'destructive',
          onPress: async () => {
            await remove(id);
            haptics.light();
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      STRINGS.tickets.clearAllConfirmTitle,
      STRINGS.tickets.clearAllConfirmMsg,
      [
        { text: STRINGS.common.cancel, style: 'cancel' },
        {
          text: STRINGS.common.confirm,
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            haptics.medium();
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    const res = await exportTicketsToJson();
    if (res.success) {
      haptics.success();
    } else if (res.error) {
      Alert.alert('Sao lưu', res.error);
    }
  };

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

            {/* Status Badge & Delete action */}
            <View className="flex-row items-center">
              <TicketStatusBadge
                status={item.status}
                totalPrize={item.totalPrize}
                size="sm"
              />
              <TouchableOpacity
                testID={`delete-ticket-btn-${item.id}`}
                onPress={() => handleDeleteTicket(item.id, item.ticket)}
                accessibilityRole="button"
                accessibilityLabel={`Xóa vé ${item.ticket}`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                className="ml-2.5 p-1 rounded-full"
              >
                <Icon name="trash" size={15} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
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
              className="py-2.5 flex-row justify-between items-center border-b mb-1"
              style={{ borderColor: colors.border }}
            >
              <Text
                className="text-xs font-medium"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.tickets.ticketCount(sortedTickets.length)}
              </Text>

              <View className="flex-row items-center">
                <TouchableOpacity
                  testID="export-tickets-btn"
                  onPress={handleExport}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.tickets.exportBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  className="flex-row items-center px-2 py-1 rounded-lg mr-1.5"
                >
                  <Icon name="upload" size={13} color={colors.primary} />
                  <Text
                    className="text-xs font-semibold ml-1"
                    style={{ color: colors.primary }}
                  >
                    {STRINGS.tickets.exportBtn}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="clear-all-tickets-btn"
                  onPress={handleClearAll}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.tickets.clearAll}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  className="flex-row items-center px-2 py-1 rounded-lg"
                >
                  <Icon name="trash" size={13} color={colors.error} />
                  <Text
                    className="text-xs font-semibold ml-1"
                    style={{ color: colors.error }}
                  >
                    {STRINGS.tickets.clearAll}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
