import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useSavedTickets,
  updateTicket,
  useTicketStoreHealth,
} from '@/store/ticketStore';
import {
  exportTicketsToJson,
  importTicketsFromJson,
  exportCorruptTicketBackup,
} from '@/store';
import { useTheme, layout, radii } from '@/theme';
import {
  Icon,
  OfflineBanner,
  TicketEmptyIllustration,
  type TicketFilterStatus,
} from '@/components';
import {
  TicketList,
  TicketDetailSheet,
  TicketsMenu,
} from '@/components/tickets';
import {
  Text,
  Button,
  IconButton,
  Banner,
  Snackbar,
} from '@/components/ui';
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
  const storeHealth = useTicketStoreHealth();

  // Recheck notice banner state (T10.51)
  const [recheckBannerMessage, setRecheckBannerMessage] = useState<string | null>(null);
  const bannerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRecheckComplete = useCallback((updatedCount: number) => {
    haptics.success();
    setRecheckBannerMessage(`${updatedCount} vé vừa có kết quả`);
    if (bannerTimeoutRef.current) {
      clearTimeout(bannerTimeoutRef.current);
    }
    bannerTimeoutRef.current = setTimeout(() => {
      setRecheckBannerMessage(null);
    }, 4000);
  }, []);

  // Manual pull-to-refresh & recheck status (T09.45 & T10.51)
  const { isRechecking, refetchPending } = usePendingTicketsRecheck({
    onRecheckComplete: handleRecheckComplete,
  });

  // Filter state with session memory (T10.44 & T10.45)
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

  // Overflow menu state (T10.49)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    };
  }, []);

  const setActiveFilter = useCallback((filter: TicketFilterStatus) => {
    sessionSavedTicketFilter = filter;
    setActiveFilterState(filter);
  }, []);

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

  const filteredTickets = useMemo(() => {
    if (activeFilter === 'ALL') return sortedTickets;
    return sortedTickets.filter((t) => t.status === activeFilter);
  }, [sortedTickets, activeFilter]);

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
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
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
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
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
      Alert.alert(STRINGS.tickets.exportTitle, res.error);
    }
  };

  const handleImport = async () => {
    const res = await importTicketsFromJson();
    if (res.success) {
      haptics.success();
      Alert.alert(
        STRINGS.tickets.importTitle,
        res.message || STRINGS.tickets.importSuccess(res.importedCount),
      );
    } else if (res.error) {
      Alert.alert(STRINGS.tickets.importTitle, res.error);
    }
  };

  const menuButton = (
    <IconButton
      testID="tickets-menu-btn"
      accessibilityLabel={STRINGS.tickets.optionsMenuA11y}
      onPress={() => setIsMenuOpen(true)}
      icon={<Icon name="more" size={20} color={colors.textMain} />}
      style={[
        styles.menuBtn,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    />
  );

  return (
    <SafeAreaView
      edges={['bottom']}
      className="flex-1 bg-background"
      style={{ backgroundColor: colors.background }}
      testID="tickets-screen"
    >
      {/* Offline Banner — pinned directly under header (T11.48) */}
      <OfflineBanner onRetry={() => refetchPending(true)} />

      {/* Corrupt storage: data kept, writes blocked (T11.07) */}
      {storeHealth.state === 'corrupt' ? (
        <View style={styles.bannerWrap}>
          <Banner
            variant="error"
            title={STRINGS.tickets.corruptTitle}
            message={STRINGS.tickets.corruptMessage}
            actionText={STRINGS.tickets.corruptExport}
            onAction={() => {
              exportCorruptTicketBackup(storeHealth.backupKey).then((res) => {
                if (!res.success) {
                  Alert.alert(
                    STRINGS.tickets.exportTitle,
                    res.error ?? STRINGS.tickets.exportError,
                  );
                }
              });
            }}
          />
        </View>
      ) : null}

      {/* Recheck Progress & Result Banners (T10.51) */}
      {isRechecking || recheckBannerMessage ? (
        <View style={styles.bannerWrap}>
          {isRechecking ? (
            <View
              testID="pending-recheck-indicator"
              style={[
                styles.recheckBanner,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary} />
              <Text
                variant="caption"
                color={colors.textMain}
                style={styles.recheckText}
              >
                {summaryStats.pending > 0
                  ? `Đang cập nhật ${summaryStats.pending} vé chờ…`
                  : STRINGS.tickets.recheckingStatus}
              </Text>
            </View>
          ) : null}

          {recheckBannerMessage ? (
            <View
              testID="pending-recheck-banner"
              style={[
                styles.recheckBanner,
                {
                  backgroundColor: colors.winTint,
                  borderColor: colors.winBorder,
                },
              ]}
            >
              <Icon name="checkCircle" size={16} color={colors.win} />
              <Text
                variant="caption"
                color={colors.win}
                style={styles.recheckDoneText}
              >
                {recheckBannerMessage}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {sortedTickets.length === 0 ? (
        <View style={styles.emptyOuter}>
          <View style={styles.emptyToolbar}>{menuButton}</View>

          <View testID="saved-tickets-empty" style={styles.emptyCenter}>
            <TicketEmptyIllustration testID="tickets-empty-illustration" />
            <Text
              variant="title"
              align="center"
              color={colors.textMain}
              accessibilityRole="header"
              style={styles.emptyTitle}
            >
              {STRINGS.tickets.emptyTitle}
            </Text>
            <Text
              variant="body"
              align="center"
              color={colors.textMuted}
              style={styles.emptyDesc}
            >
              {STRINGS.tickets.emptyDesc}
            </Text>

            <Button
              testID="tickets-empty-check-btn"
              size="lg"
              title={STRINGS.tickets.emptyAction}
              accessibilityLabel={STRINGS.tickets.emptyAction}
              onPress={() => router.push('/(tabs)/check')}
              style={styles.emptyPrimaryBtn}
            />

            <Button
              testID="empty-import-btn"
              variant="secondary"
              size="md"
              title={STRINGS.tickets.emptyRestoreAction}
              accessibilityLabel={STRINGS.tickets.emptyRestoreAction}
              onPress={handleImport}
              style={styles.emptySecondaryBtn}
            />

            <View
              testID="tickets-privacy-notice"
              style={[
                styles.privacyPill,
                { backgroundColor: colors.surfaceSubtle },
              ]}
            >
              <Icon name="info" size={13} color={colors.textMuted} />
              <Text
                variant="caption"
                color={colors.textMuted}
                style={styles.privacyPillText}
              >
                {STRINGS.tickets.privacyNotice}
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <TicketList
          sections={ticketSections}
          summaryStats={summaryStats}
          filterCounts={filterCounts}
          filteredCount={filteredTickets.length}
          hasAnyTickets={sortedTickets.length > 0}
          activeFilter={activeFilter}
          isRechecking={isRechecking}
          onRefresh={() => refetchPending(true)}
          onSelectFilter={setActiveFilter}
          onPressTicket={(item) => {
            setSelectedDetailTicket(item);
            setNoteDraft(item.note || '');
          }}
          onDeleteTicket={handleDeleteTicket}
          headerRight={menuButton}
        />
      )}

      {/* Undo Delete Ticket Snackbar (T10.47) */}
      <Snackbar
        visible={isUndoVisible && Boolean(lastDeletedTicket)}
        message={
          lastDeletedTicket ? `Đã xóa vé ${lastDeletedTicket.ticket}` : ''
        }
        actionLabel="Hoàn tác"
        actionTestID="undo-delete-btn"
        onAction={handleUndoDelete}
        testID="undo-delete-snackbar"
      />

      {/* Saved Ticket Detail Bottom Sheet (T10.48) */}
      <TicketDetailSheet
        ticket={selectedDetailTicket}
        noteDraft={noteDraft}
        isSavingNote={isSavingNote}
        onChangeNote={setNoteDraft}
        onSaveNote={handleSaveNote}
        onViewDraw={(t) => {
          setSelectedDetailTicket(null);
          router.push(`/(tabs)/results?station=${t.station}&date=${t.drawDate}`);
        }}
        onRecheck={(t) => {
          setSelectedDetailTicket(null);
          router.push(
            `/(tabs)/check?ticket=${t.ticket}&station=${t.station}&date=${t.drawDate}`,
          );
        }}
        onDelete={(t) => {
          setSelectedDetailTicket(null);
          handleDeleteTicket(t);
        }}
        onClose={() => setSelectedDetailTicket(null)}
      />

      {/* Overflow Menu Sheet (T10.49) */}
      <TicketsMenu
        visible={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onExport={handleExport}
        onImport={handleImport}
        onClearAll={handleClearAll}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bannerWrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
  },
  recheckBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  recheckText: {
    marginLeft: 8,
    fontFamily: 'BeVietnamPro-Medium',
  },
  recheckDoneText: {
    marginLeft: 8,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  menuBtn: {
    borderWidth: 1,
    borderRadius: radii.full,
  },
  emptyOuter: {
    flex: 1,
    width: '100%',
    maxWidth: layout.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  emptyToolbar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  emptyCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 28,
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptyDesc: {
    maxWidth: 290,
    lineHeight: 22,
    marginBottom: 20,
  },
  emptyPrimaryBtn: {
    minWidth: 200,
  },
  emptySecondaryBtn: {
    marginTop: 10,
    minWidth: 200,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.md,
  },
  privacyPillText: {
    marginLeft: 6,
  },
});
