import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  type ListRenderItemInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSavedTickets } from '@/store/ticketStore';
import { exportTicketsToJson, importTicketsFromJson } from '@/store';
import { useTheme } from '@/theme';
import {
  Icon,
  TicketStatusBadge,
  SavedTicketsSummary,
  type TicketFilterStatus,
} from '@/components';
import { usePendingTicketsRecheck } from '@/hooks';
import { formatCurrency, formatDateVN } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { STRINGS } from '@/lib/strings';
import type { SavedTicket } from '@/types';

// Session memory for ticket status filter across tabs in the same session (T10.45)
let sessionSavedTicketFilter: TicketFilterStatus = 'ALL';

export function resetSessionSavedTicketFilter() {
  sessionSavedTicketFilter = 'ALL';
}

export default function TicketsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [tickets, { remove, clearAll }] = useSavedTickets();

  // Manual pull-to-refresh & recheck status (T09.45)
  const { isRechecking, refetchPending } = usePendingTicketsRecheck();

  // Filter state for summary cards with session memory (T10.44 & T10.45)
  const [activeFilter, setActiveFilterState] =
    useState<TicketFilterStatus>(sessionSavedTicketFilter);

  const setActiveFilter = useCallback((filter: TicketFilterStatus) => {
    sessionSavedTicketFilter = filter;
    setActiveFilterState(filter);
  }, []);

  // Summary statistics for header card (T10.44)
  const summaryStats = useMemo(() => {
    let pending = 0;
    let won = 0;
    let totalWonPrize = 0;
    for (const t of tickets) {
      if (t.status === 'PENDING') {
        pending++;
      } else if (t.status === 'WON') {
        won++;
        totalWonPrize += t.totalPrize || 0;
      }
    }
    return {
      total: tickets.length,
      pending,
      won,
      totalWonPrize,
    };
  }, [tickets]);

  // Counts per status for filter chips (T10.45)
  const filterCounts = useMemo(() => {
    let won = 0;
    let pending = 0;
    let lost = 0;
    for (const t of tickets) {
      if (t.status === 'WON') won++;
      else if (t.status === 'PENDING') pending++;
      else if (t.status === 'LOST') lost++;
    }
    return {
      ALL: tickets.length,
      WON: won,
      PENDING: pending,
      LOST: lost,
    };
  }, [tickets]);

  // Sort tickets: drawDate desc, createdAt desc
  const sortedTickets = useMemo(() => {
    return [...tickets].sort((a, b) => {
      const dateCmp = b.drawDate.localeCompare(a.drawDate);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [tickets]);

  // Filtered tickets based on activeFilter
  const filteredTickets = useMemo(() => {
    if (activeFilter === 'ALL') return sortedTickets;
    return sortedTickets.filter((t) => t.status === activeFilter);
  }, [sortedTickets, activeFilter]);

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
            const success = await remove(id);
            if (success) {
              haptics.light();
            } else {
              Alert.alert(STRINGS.common.error, STRINGS.tickets.deleteError);
            }
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
            const success = await clearAll();
            if (success) {
              haptics.medium();
            } else {
              Alert.alert(STRINGS.common.error, STRINGS.tickets.clearAllError);
            }
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

  const handleImport = async () => {
    const res = await importTicketsFromJson();
    if (res.success) {
      haptics.success();
      Alert.alert(
        'Khôi phục',
        res.message || STRINGS.tickets.importSuccess(res.importedCount),
      );
    } else if (res.error) {
      Alert.alert('Khôi phục', res.error);
    }
  };

  const renderItem = ({ item, index }: ListRenderItemInfo<SavedTicket>) => {
    const prevItem = index > 0 ? filteredTickets[index - 1] : null;
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
                className="text-xs font-medium"
                style={{ color: colors.textMuted }}
              >
                Số vé
              </Text>
              <Text
                className="text-2xl font-bold tracking-widest mt-0.5"
                style={{ color: colors.textMain, fontVariant: ['tabular-nums'] }}
              >
                {item.ticket}
              </Text>
            </View>

            {isWon && (
              <View className="items-end">
                <Text
                  className="text-xs font-medium"
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
      {/* Screen Header */}
      <View className="px-4 pt-4 pb-2">
        <Text
          className="text-2xl font-bold mb-1"
          style={{ color: colors.textMain }}
        >
          {STRINGS.tickets.screenTitle}
        </Text>
        <Text className="text-xs mb-1" style={{ color: colors.textMuted }}>
          {STRINGS.tickets.subtitle}
        </Text>
      </View>

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

          <TouchableOpacity
            testID="empty-import-btn"
            onPress={handleImport}
            accessibilityRole="button"
            accessibilityLabel={STRINGS.tickets.importBtn}
            className="mt-3 px-5 py-2.5 rounded-xl border flex-row items-center"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.surface,
            }}
          >
            <Icon name="download" size={16} color={colors.textMain} />
            <Text
              className="text-xs font-semibold ml-1.5"
              style={{ color: colors.textMain }}
            >
              Nhập vé từ file sao lưu
            </Text>
          </TouchableOpacity>

          {/* On-device Privacy Notice */}
          <View
            testID="tickets-privacy-notice"
            className="flex-row items-center justify-center mt-6 px-4 py-2 rounded-xl"
            style={{ backgroundColor: `${colors.border}30` }}
          >
            <Icon name="info" size={13} color={colors.textMuted} />
            <Text
              className="text-xs font-medium ml-1.5"
              style={{ color: colors.textMuted }}
            >
              {STRINGS.tickets.privacyNotice}
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          testID="saved-tickets-list"
          data={filteredTickets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              testID="tickets-refresh-control"
              refreshing={isRechecking}
              onRefresh={() => refetchPending(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 40,
          }}
          ListHeaderComponent={
            <View className="mb-1">
              {/* Summary Stats Header (T10.44) */}
              <SavedTicketsSummary
                totalTickets={summaryStats.total}
                pendingCount={summaryStats.pending}
                wonCount={summaryStats.won}
                totalWonPrize={summaryStats.totalWonPrize}
                activeFilter={activeFilter}
                onSelectFilter={setActiveFilter}
              />

              {/* Status Filter Chips (T10.45) */}
              <View
                testID="tickets-filter-chips"
                className="flex-row items-center pt-1 pb-2"
              >
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {(
                    [
                      { key: 'ALL', label: STRINGS.tickets.filterAll },
                      { key: 'WON', label: STRINGS.tickets.filterWon },
                      { key: 'PENDING', label: STRINGS.tickets.filterPending },
                      { key: 'LOST', label: STRINGS.tickets.filterLost },
                    ] as const
                  ).map((opt) => {
                    const isSelected = activeFilter === opt.key;
                    const count = filterCounts[opt.key];
                    return (
                      <TouchableOpacity
                        key={opt.key}
                        testID={`ticket-filter-chip-${opt.key}`}
                        onPress={() => {
                          haptics.selection();
                          setActiveFilter(opt.key);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${opt.label} (${count})`}
                        accessibilityState={{ selected: isSelected }}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        className="px-3 py-1.5 rounded-full border flex-row items-center"
                        style={{
                          backgroundColor: isSelected
                            ? colors.primary
                            : colors.surface,
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        }}
                      >
                        <Text
                          className="text-xs font-semibold"
                          style={{
                            color: isSelected ? '#ffffff' : colors.textMain,
                          }}
                        >
                          {opt.label}
                        </Text>
                        <View
                          className="ml-1.5 px-1.5 py-0.5 rounded-full"
                          style={{
                            backgroundColor: isSelected
                              ? 'rgba(255, 255, 255, 0.25)'
                              : colors.surfaceSubtle,
                          }}
                        >
                          <Text
                            className="text-[10px] font-bold"
                            style={{
                              color: isSelected ? '#ffffff' : colors.textMuted,
                              fontVariant: ['tabular-nums'],
                            }}
                          >
                            {count}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View
                className="py-2.5 flex-row justify-between items-center border-b mb-1"
                style={{ borderColor: colors.border }}
              >
                <Text
                  className="text-xs font-medium"
                  style={{ color: colors.textMuted }}
                >
                  {STRINGS.tickets.ticketCount(filteredTickets.length)}
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
                  testID="import-tickets-btn"
                  onPress={handleImport}
                  accessibilityRole="button"
                  accessibilityLabel={STRINGS.tickets.importBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                  className="flex-row items-center px-2 py-1 rounded-lg mr-1.5"
                >
                  <Icon name="download" size={13} color={colors.primary} />
                  <Text
                    className="text-xs font-semibold ml-1"
                    style={{ color: colors.primary }}
                  >
                    {STRINGS.tickets.importBtn}
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
            </View>
          }
          ListEmptyComponent={
            sortedTickets.length > 0 ? (
              <View
                testID="tickets-filter-empty"
                className="p-6 items-center justify-center rounded-2xl border my-4"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <Icon name="search" size={24} color={colors.textMuted} />
                <Text
                  className="text-sm font-bold mt-2 text-center"
                  style={{ color: colors.textMain }}
                >
                  {STRINGS.tickets.filterEmptyTitle}
                </Text>
                <Text
                  className="text-xs text-center mt-1"
                  style={{ color: colors.textMuted }}
                >
                  {STRINGS.tickets.filterEmptyDesc}
                </Text>
                <TouchableOpacity
                  testID="tickets-filter-empty-reset-btn"
                  onPress={() => {
                    haptics.selection();
                    setActiveFilter('ALL');
                  }}
                  className="mt-3 px-4 py-2 rounded-xl"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="text-white text-xs font-semibold">
                    {STRINGS.tickets.filterEmptyReset}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : undefined
          }
          ListFooterComponent={
            <View
              testID="tickets-privacy-notice"
              className="flex-row items-center justify-center mt-6 py-2 px-4 rounded-xl"
              style={{ backgroundColor: `${colors.border}30` }}
            >
              <Icon name="info" size={13} color={colors.textMuted} />
              <Text
                className="text-xs font-medium ml-1.5"
                style={{ color: colors.textMuted }}
              >
                {STRINGS.tickets.privacyNotice}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
