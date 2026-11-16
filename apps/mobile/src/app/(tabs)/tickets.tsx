import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
// eslint-disable-next-line import/no-unresolved
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSavedTickets, updateTicket } from '@/store/ticketStore';
import { exportTicketsToJson, importTicketsFromJson } from '@/store';
import { useTheme } from '@/theme';
import {
  Icon,
  TicketStatusBadge,
  SavedTicketsSummary,
  TicketEmptyIllustration,
  type TicketFilterStatus,
} from '@/components';
import { usePendingTicketsRecheck } from '@/hooks';
import { formatDateVN } from '@/lib/format';
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
  const [tickets, { save, remove, clearAll }] = useSavedTickets();

  // Manual pull-to-refresh & recheck status (T09.45)
  const { isRechecking, refetchPending } = usePendingTicketsRecheck();

  // Filter state for summary cards with session memory (T10.44 & T10.45)
  const [activeFilter, setActiveFilterState] =
    useState<TicketFilterStatus>(sessionSavedTicketFilter);

  // Undo delete ticket snackbar state (T10.47)
  const [lastDeletedTicket, setLastDeletedTicket] =
    useState<SavedTicket | null>(null);
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ticket detail sheet state (T10.48)
  const [selectedDetailTicket, setSelectedDetailTicket] =
    useState<SavedTicket | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Header overflow menu state (T10.49)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
    };
  }, []);

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
      const aDate = a.drawDate || '';
      const bDate = b.drawDate || '';
      const dateCmp = bDate.localeCompare(aDate);
      if (dateCmp !== 0) return dateCmp;
      const aCreated = a.createdAt || '';
      const bCreated = b.createdAt || '';
      return bCreated.localeCompare(aCreated);
    });
  }, [tickets]);

  // Filtered tickets based on activeFilter
  const filteredTickets = useMemo(() => {
    if (activeFilter === 'ALL') return sortedTickets;
    return sortedTickets.filter((t) => t.status === activeFilter);
  }, [sortedTickets, activeFilter]);

  // Group filtered tickets into date sections for SectionList (T10.46)
  const ticketSections = useMemo(() => {
    const sectionsMap = new Map<string, SavedTicket[]>();
    for (const ticket of filteredTickets) {
      const list = sectionsMap.get(ticket.drawDate) || [];
      list.push(ticket);
      sectionsMap.set(ticket.drawDate, list);
    }
    return Array.from(sectionsMap.entries()).map(([drawDate, data]) => ({
      title: formatDateVN(drawDate),
      drawDate,
      data,
    }));
  }, [filteredTickets]);

  const handleDeleteTicket = async (ticket: SavedTicket) => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    const success = await remove(ticket.id);
    if (success) {
      haptics.light();
      setLastDeletedTicket(ticket);
      setIsUndoVisible(true);
      undoTimeoutRef.current = setTimeout(() => {
        setIsUndoVisible(false);
        setLastDeletedTicket(null);
      }, 5000);
    } else {
      Alert.alert(STRINGS.common.error, STRINGS.tickets.deleteError);
    }
  };

  const handleUndoDelete = async () => {
    if (!lastDeletedTicket) return;
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }
    await save(lastDeletedTicket);
    haptics.success();
    setIsUndoVisible(false);
    setLastDeletedTicket(null);
  };

  const handleSaveNote = async () => {
    if (!selectedDetailTicket) return;
    setIsSavingNote(true);
    const updated = await updateTicket(selectedDetailTicket.id, {
      note: noteDraft.trim(),
    });
    setIsSavingNote(false);
    if (updated) {
      haptics.success();
      setSelectedDetailTicket(updated);
    }
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

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; drawDate: string; data: SavedTicket[] };
  }) => (
    <View
      testID={`section-header-${section.drawDate}`}
      className="pt-3 pb-1.5 px-1 flex-row items-center justify-between"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-row items-center">
        <Icon name="calendar" size={13} color={colors.textMuted} />
        <Text
          className="text-xs font-bold uppercase tracking-wider ml-1.5"
          style={{ color: colors.textMuted }}
        >
          {STRINGS.tickets.drawDateGroup(section.title)}
        </Text>
      </View>
      <Text
        className="text-[11px] font-medium"
        style={{ color: colors.textMuted }}
      >
        {STRINGS.tickets.ticketCount(section.data.length)}
      </Text>
    </View>
  );

  const renderItem = ({ item }: { item: SavedTicket }) => {
    const renderRightActions = () => (
      <TouchableOpacity
        testID={`swipe-delete-btn-${item.id}`}
        onPress={() => handleDeleteTicket(item)}
        accessibilityRole="button"
        accessibilityLabel={`Xóa vé ${item.ticket}`}
        className="justify-center items-center px-5 mb-2 ml-2 rounded-xl"
        style={{ backgroundColor: colors.error }}
      >
        <Icon name="trash" size={18} color="#ffffff" />
        <Text className="text-white text-xs font-semibold mt-1">Xóa</Text>
      </TouchableOpacity>
    );

    return (
      <Swipeable
        key={item.id}
        renderRightActions={renderRightActions}
        testID={`swipeable-${item.id}`}
      >
        <TouchableOpacity
          testID={`saved-ticket-item-${item.id}`}
          onPress={() => {
            haptics.light();
            setSelectedDetailTicket(item);
            setNoteDraft(item.note || '');
          }}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Chi tiết vé ${item.ticket}, đài ${item.stationName || item.station}`}
          className="mb-2 p-3 rounded-xl border flex-row items-center justify-between"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          {/* Left: Tabular ticket number & station name */}
          <View className="flex-1 mr-2">
            <Text
              className="text-lg font-bold tracking-wider"
              style={{
                color: colors.textMain,
                fontVariant: ['tabular-nums'],
              }}
            >
              {item.ticket}
            </Text>
            <Text
              className="text-xs mt-0.5"
              style={{ color: colors.textMuted }}
              numberOfLines={1}
            >
              {item.stationName || item.station}
            </Text>
          </View>

          {/* Right: TicketStatusBadge & Delete button */}
          <View className="flex-row items-center">
            <TicketStatusBadge
              status={item.status}
              totalPrize={item.totalPrize}
              size="sm"
            />
            <TouchableOpacity
              testID={`delete-ticket-btn-${item.id}`}
              onPress={() => handleDeleteTicket(item)}
              accessibilityRole="button"
              accessibilityLabel={`Xóa vé ${item.ticket}`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="ml-2 p-1.5 rounded-full"
            >
              <Icon name="trash" size={15} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      className="flex-1 bg-slate-50 dark:bg-slate-900"
      testID="tickets-screen"
    >
      {/* Screen Header */}
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <View className="flex-1 mr-2">
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
        <TouchableOpacity
          testID="tickets-menu-btn"
          onPress={() => {
            haptics.light();
            setIsMenuOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Tùy chọn vé"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="w-10 h-10 rounded-full items-center justify-center border"
          style={{
            backgroundColor: colors.surface,
            borderColor: colors.border,
          }}
        >
          <Icon name="more" size={20} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      {sortedTickets.length === 0 ? (
        <View
          testID="saved-tickets-empty"
          className="flex-1 items-center justify-center p-6 text-center"
        >
          <TicketEmptyIllustration testID="tickets-empty-illustration" />
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
            accessibilityLabel={STRINGS.tickets.emptyRestoreAction}
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
              {STRINGS.tickets.emptyRestoreAction}
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
        <SectionList
          testID="saved-tickets-list"
          sections={ticketSections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={true}
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

      {/* Undo Delete Ticket Snackbar (T10.47) */}
      {isUndoVisible && lastDeletedTicket && (
        <View
          testID="undo-delete-snackbar"
          accessible={true}
          accessibilityLiveRegion="polite"
          className="absolute bottom-6 left-4 right-4 p-3.5 rounded-xl flex-row items-center justify-between shadow-lg"
          style={{
            backgroundColor: colors.textMain,
          }}
        >
          <View className="flex-row items-center flex-1 mr-2">
            <Icon name="trash" size={16} color="#ffffff" />
            <Text
              testID="undo-delete-message"
              className="text-white text-sm font-medium ml-2"
              numberOfLines={1}
            >
              Đã xóa vé {lastDeletedTicket.ticket}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              testID="undo-delete-btn"
              onPress={handleUndoDelete}
              accessibilityRole="button"
              accessibilityLabel="Hoàn tác xóa vé"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="px-3 py-1.5 rounded-lg mr-1.5"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-white text-xs font-bold">Hoàn tác</Text>
            </TouchableOpacity>
            <TouchableOpacity
              testID="close-undo-snackbar-btn"
              onPress={() => {
                if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
                setIsUndoVisible(false);
                setLastDeletedTicket(null);
              }}
              accessibilityRole="button"
              accessibilityLabel="Đóng thông báo"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              className="p-1 rounded-full"
            >
              <Icon name="x" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Saved Ticket Detail Bottom Sheet (T10.48) */}
      <Modal
        visible={!!selectedDetailTicket}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedDetailTicket(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-end"
        >
          <TouchableOpacity
            testID="detail-sheet-backdrop"
            activeOpacity={1}
            onPress={() => setSelectedDetailTicket(null)}
            className="flex-1 bg-black/50"
          />
          {selectedDetailTicket && (
            <View
              testID="saved-ticket-detail-sheet"
              className="p-5 rounded-t-3xl border-t shadow-2xl"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
              }}
            >
              {/* Drag indicator */}
              <View
                className="w-10 h-1 rounded-full self-center mb-4"
                style={{ backgroundColor: colors.border }}
              />

              {/* Header */}
              <View
                className="flex-row items-center justify-between pb-3 border-b mb-4"
                style={{ borderColor: colors.border }}
              >
                <View>
                  <Text
                    className="text-base font-bold"
                    style={{ color: colors.textMain }}
                  >
                    Chi tiết vé đã lưu
                  </Text>
                  <Text
                    className="text-xs mt-0.5"
                    style={{ color: colors.textMuted }}
                  >
                    Lưu trên máy này · Đã đối soát
                  </Text>
                </View>
                <TouchableOpacity
                  testID="detail-sheet-close-btn"
                  onPress={() => setSelectedDetailTicket(null)}
                  accessibilityRole="button"
                  accessibilityLabel="Đóng chi tiết vé"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1 rounded-full"
                >
                  <Icon name="x" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {/* Ticket Card Info */}
              <View
                className="p-4 rounded-2xl border mb-4"
                style={{
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.textMain }}
                  >
                    {selectedDetailTicket.stationName ||
                      selectedDetailTicket.station}
                  </Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>
                    {formatDateVN(selectedDetailTicket.drawDate)}
                  </Text>
                </View>

                <View
                  className="flex-row items-center justify-between pt-2 border-t"
                  style={{ borderColor: colors.border }}
                >
                  <View>
                    <Text
                      className="text-xs"
                      style={{ color: colors.textMuted }}
                    >
                      Số vé
                    </Text>
                    <Text
                      testID="detail-sheet-ticket-number"
                      className="text-3xl font-bold tracking-widest mt-0.5"
                      style={{
                        color: colors.textMain,
                        fontVariant: ['tabular-nums'],
                      }}
                    >
                      {selectedDetailTicket.ticket}
                    </Text>
                  </View>
                  <TicketStatusBadge
                    status={selectedDetailTicket.status}
                    totalPrize={selectedDetailTicket.totalPrize}
                    size="md"
                  />
                </View>
              </View>

              {/* Note Section */}
              <View className="mb-4">
                <Text
                  className="text-xs font-semibold mb-1.5"
                  style={{ color: colors.textMuted }}
                >
                  Ghi chú cá nhân
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    testID="detail-sheet-note-input"
                    value={noteDraft}
                    onChangeText={setNoteDraft}
                    placeholder="Thêm ghi chú (ví dụ: vé mua chung, nơi mua...)"
                    placeholderTextColor={colors.textMuted}
                    maxLength={100}
                    className="flex-1 px-3 py-2.5 rounded-xl border text-sm"
                    style={{
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      color: colors.textMain,
                    }}
                  />
                  <TouchableOpacity
                    testID="detail-sheet-save-note-btn"
                    onPress={handleSaveNote}
                    disabled={isSavingNote}
                    accessibilityRole="button"
                    accessibilityLabel="Lưu ghi chú"
                    className="ml-2 px-3 py-2.5 rounded-xl"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white text-xs font-bold">
                      {isSavingNote ? 'Đang lưu' : 'Lưu'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Actions */}
              <View className="gap-2 pt-2">
                <TouchableOpacity
                  testID="detail-sheet-view-draw-btn"
                  onPress={() => {
                    const t = selectedDetailTicket;
                    setSelectedDetailTicket(null);
                    router.push(
                      `/(tabs)/results?station=${t.station}&date=${t.drawDate}`,
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Xem bảng kết quả kỳ này"
                  className="w-full py-3 rounded-xl border flex-row items-center justify-center"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <Icon name="calendar" size={16} color={colors.textMain} />
                  <Text
                    className="text-sm font-semibold ml-2"
                    style={{ color: colors.textMain }}
                  >
                    Xem bảng kết quả kỳ này
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="detail-sheet-recheck-btn"
                  onPress={() => {
                    const t = selectedDetailTicket;
                    setSelectedDetailTicket(null);
                    router.push(
                      `/(tabs)/check?ticket=${t.ticket}&station=${t.station}&date=${t.drawDate}`,
                    );
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Dò lại vé này"
                  className="w-full py-3 rounded-xl border flex-row items-center justify-center"
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  }}
                >
                  <Icon name="search" size={16} color={colors.textMain} />
                  <Text
                    className="text-sm font-semibold ml-2"
                    style={{ color: colors.textMain }}
                  >
                    Dò lại vé này
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  testID="detail-sheet-delete-btn"
                  onPress={() => {
                    const t = selectedDetailTicket;
                    setSelectedDetailTicket(null);
                    handleDeleteTicket(t);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Xóa vé này"
                  className="w-full py-2.5 rounded-xl flex-row items-center justify-center mt-1"
                >
                  <Icon name="trash" size={15} color={colors.error} />
                  <Text
                    className="text-xs font-semibold ml-1.5"
                    style={{ color: colors.error }}
                  >
                    Xóa vé khỏi máy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </Modal>

      {/* Overflow Menu Modal (T10.49) */}
      <Modal
        visible={isMenuOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
          className="flex-1 justify-end sm:justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            testID="tickets-overflow-menu"
            className="rounded-2xl border p-4 shadow-xl mb-4 sm:mb-0"
            style={{
              backgroundColor: colors.surface,
              borderColor: colors.border,
            }}
          >
            <View
              className="flex-row items-center justify-between pb-3 border-b mb-2"
              style={{ borderColor: colors.border }}
            >
              <Text
                className="text-base font-bold"
                style={{ color: colors.textMain }}
              >
                Tùy chọn vé
              </Text>
              <TouchableOpacity
                testID="tickets-menu-close-btn"
                onPress={() => {
                  haptics.light();
                  setIsMenuOpen(false);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Đóng menu"
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <Icon name="x" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Export */}
            <TouchableOpacity
              testID="export-tickets-btn"
              onPress={() => {
                setIsMenuOpen(false);
                handleExport();
              }}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.tickets.exportBtn}
              className="flex-row items-center py-3 px-2 rounded-xl"
            >
              <Icon name="upload" size={18} color={colors.primary} />
              <View className="ml-3">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.textMain }}
                >
                  {STRINGS.tickets.exportBtn}
                </Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>
                  Lưu danh sách vé thành file JSON
                </Text>
              </View>
            </TouchableOpacity>

            {/* Import */}
            <TouchableOpacity
              testID="import-tickets-btn"
              onPress={() => {
                setIsMenuOpen(false);
                handleImport();
              }}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.tickets.importBtn}
              className="flex-row items-center py-3 px-2 rounded-xl"
            >
              <Icon name="download" size={18} color={colors.primary} />
              <View className="ml-3">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.textMain }}
                >
                  {STRINGS.tickets.importBtn}
                </Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>
                  Nạp vé đã lưu từ file dự phòng
                </Text>
              </View>
            </TouchableOpacity>

            <View
              className="h-[1px] my-1"
              style={{ backgroundColor: colors.border }}
            />

            {/* Clear all */}
            <TouchableOpacity
              testID="clear-all-tickets-btn"
              onPress={() => {
                setIsMenuOpen(false);
                handleClearAll();
              }}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.tickets.clearAll}
              className="flex-row items-center py-3 px-2 rounded-xl"
            >
              <Icon name="trash" size={18} color={colors.error} />
              <View className="ml-3">
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.error }}
                >
                  {STRINGS.tickets.clearAll}
                </Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>
                  Xóa toàn bộ vé đang lưu trên máy
                </Text>
              </View>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
