import React, { useState, useMemo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, Button, Chip, Perforation, usePressed } from './ui';
import { Icon } from './Icon';
import {
  HighlightedTicket,
  getLongestMatchedSuffix,
} from './HighlightedTicket';
import { useTheme } from '../theme';
import { radii } from '../theme/tokens';
import { formatCurrency, formatDateVN } from '../lib/format';
import { STRINGS } from '../lib/strings';
import { haptics } from '../lib/haptics';
import { useSavedTickets, normalizeStationCode } from '../store/ticketStore';
import type { BatchCheckResponse, SavedTicketStatus } from '../types';
import { getStationName, type UiBatchResult } from '../api/mappers';

export interface BatchResultListProps {
  batchResult: UiBatchResult | BatchCheckResponse;
  onCheckAgain?: () => void;
  onSaveTicket?: (item: any) => void;
  onSaveAllTickets?: (items: any[]) => void;
  testID?: string;
}

function BatchSaveBookmark({
  testID,
  isSaved,
  ticket,
  onPress,
}: {
  testID: string;
  isSaved: boolean;
  ticket: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={
        isSaved ? STRINGS.check.savedTicket : `${STRINGS.check.saveTicket} ${ticket}`
      }
      {...pressHandlers}
      style={[styles.bookmarkBtn, { opacity: pressed ? 0.65 : 1 }]}
    >
      <Icon
        name={isSaved ? 'check' : 'bookmark'}
        size={16}
        color={isSaved ? colors.win : colors.textMuted}
      />
    </Pressable>
  );
}

export const BatchResultList: React.FC<BatchResultListProps> = ({
  batchResult,
  onCheckAgain,
  onSaveTicket,
  onSaveAllTickets,
  testID = 'batch-result-list',
}) => {
  const { colors } = useTheme();
  const { pressed: saveAllPressed, pressHandlers: saveAllHandlers } = usePressed();
  const [filterWonOnly, setFilterWonOnly] = useState(false);
  const [savedTickets, { save: saveTicketToStore, saveMany: saveManyTicketsToStore }] =
    useSavedTickets();

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

  const isTicketSaved = (ticketNumber: string) => {
    return savedTickets.some(
      (t) =>
        t.ticket === ticketNumber &&
        t.drawDate === (batchResult.drawDate || '') &&
        (normalizeStationCode(t.station) === normalizeStationCode(rawStation) ||
          t.stationName === stationName),
    );
  };

  const areAllTicketsSaved =
    totalTickets > 0 &&
    (batchResult.results || []).every((item) => isTicketSaved(item.ticket ?? ''));

  const handleSaveItem = async (item: any) => {
    haptics.light();
    if (onSaveTicket) {
      onSaveTicket(item);
      return;
    }
    const status: SavedTicketStatus =
      item.status === 'RESULT_NOT_AVAILABLE'
        ? 'PENDING'
        : item.won
          ? 'WON'
          : 'LOST';
    const itemTotalPrize =
      typeof item.totalPrize === 'number'
        ? item.totalPrize
        : typeof item.totalAmount === 'number'
          ? item.totalAmount
          : 0;

    await saveTicketToStore({
      ticket: item.ticket,
      station: rawStation,
      stationName,
      drawDate: batchResult.drawDate || item.drawDate || '',
      status,
      totalPrize: itemTotalPrize,
      wins: item.wins || [],
    });
  };

  const handleSaveAll = async () => {
    haptics.light();
    if (onSaveAllTickets) {
      onSaveAllTickets(batchResult.results || []);
      return;
    }
    const toSave = (batchResult.results || []).map((item) => {
      const status: SavedTicketStatus =
        item.status === 'RESULT_NOT_AVAILABLE'
          ? 'PENDING'
          : item.won
            ? 'WON'
            : 'LOST';
      const itemTotalPrize =
        typeof (item as any).totalPrize === 'number'
          ? (item as any).totalPrize
          : typeof (item as any).totalAmount === 'number'
            ? (item as any).totalAmount
            : 0;
      return {
        ticket: item.ticket || '',
        station: rawStation,
        stationName,
        drawDate: batchResult.drawDate || item.drawDate || '',
        status,
        totalPrize: itemTotalPrize,
        wins: (item.wins || []) as any,
      };
    });
    await saveManyTicketsToStore(toSave);
  };

  // Winning tickets grouped at top (T11.35)
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
    <View testID={testID} style={styles.root}>
      <Perforation />

      {/* 1. Compact Summary Bar — Total prize shown once (T11.35) */}
      <View
        testID="batch-summary-bar"
        style={[
          styles.summaryBar,
          {
            backgroundColor: hasWon ? colors.winTint : colors.surface,
            borderColor: hasWon ? colors.winBorder : colors.border,
          },
        ]}
      >
        <Text variant="caption" color={colors.textMuted}>
          Đài {stationName} · {formattedDrawDate}
        </Text>
        <Text variant="bodyStrong" color={colors.textMain} style={styles.summaryStats}>
          {`Dò ${totalTickets} vé · ${wonTickets} vé trúng · ${formatCurrency(totalPrize)}`}
        </Text>

        <View style={[styles.summaryFooter, { borderTopColor: colors.border }]}>
          <Pressable
            testID="batch-save-all-btn"
            onPress={handleSaveAll}
            accessibilityRole="button"
            accessibilityLabel={
              areAllTicketsSaved ? STRINGS.check.savedAllTickets : STRINGS.check.saveAllTickets
            }
            {...saveAllHandlers}
            style={[
              styles.saveAllBtn,
              {
                backgroundColor: areAllTicketsSaved ? colors.winTint : colors.surface,
                borderColor: areAllTicketsSaved ? colors.win : colors.border,
                opacity: saveAllPressed ? 0.8 : 1,
              },
            ]}
          >
            <Icon
              name={areAllTicketsSaved ? 'check' : 'bookmark'}
              size={14}
              color={areAllTicketsSaved ? colors.win : colors.textMain}
            />
            <Text
              variant="caption"
              color={areAllTicketsSaved ? colors.win : colors.textMain}
              style={styles.saveAllLabel}
            >
              {areAllTicketsSaved
                ? STRINGS.check.savedAll
                : STRINGS.check.saveAll(totalTickets)}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* 2. Filter Chips */}
      {hasWon ? (
        <View style={styles.filterRow}>
          <Chip
            testID="batch-filter-all"
            label={`Tất cả (${totalTickets})`}
            selected={!filterWonOnly}
            onPress={() => setFilterWonOnly(false)}
          />
          <Chip
            testID="batch-filter-won"
            label={`Chỉ vé trúng (${wonTickets})`}
            selected={filterWonOnly}
            onPress={() => setFilterWonOnly(true)}
          />
        </View>
      ) : null}

      {/* 3. Grouped Flat Rows */}
      <View
        style={[
          styles.listBox,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        {displayResults.map((item, idx) => {
          const isItemWon = item.won === true;
          const isNotAvailable = item.status === 'RESULT_NOT_AVAILABLE';
          const itemTotalPrize =
            typeof (item as any).totalPrize === 'number'
              ? (item as any).totalPrize
              : typeof (item as any).totalAmount === 'number'
                ? (item as any).totalAmount
                : 0;
          const isSaved = isTicketSaved(item.ticket ?? '');
          const isLast = idx === displayResults.length - 1;

          return (
            <View
              key={`batch-item-${item.ticket}`}
              testID={`batch-item-${item.ticket}`}
              style={[
                styles.row,
                !isLast && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
                isItemWon && { backgroundColor: colors.winTint },
              ]}
            >
              <View style={styles.rowLeft}>
                <Text
                  variant="caption"
                  color={colors.textMuted}
                  style={styles.indexText}
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
                    variant="bodyStrong"
                    color={colors.textMain}
                    style={styles.tabular}
                  >
                    {item.ticket}
                  </Text>
                )}
              </View>

              <View style={styles.rowMiddle}>
                {isItemWon && item.wins ? (
                  <View>
                    {item.wins.map((win, winIdx) => (
                      <Text
                        key={`${win.tier}-${winIdx}`}
                        variant="caption"
                        color={colors.win}
                      >
                        {(win as any).tierName || win.tier}
                      </Text>
                    ))}
                  </View>
                ) : null}
                {isNotAvailable ? (
                  <Text variant="caption" color={colors.pending}>
                    {STRINGS.check.resultPendingTitle}
                  </Text>
                ) : null}
                {!isItemWon && !isNotAvailable ? (
                  <Text variant="caption" color={colors.textMuted}>
                    {STRINGS.check.resultLostBadge}
                  </Text>
                ) : null}
              </View>

              <View style={styles.rowRight}>
                <View style={styles.amountCol}>
                  {isItemWon ? (
                    <Text
                      variant="bodyStrong"
                      color={colors.win}
                      style={styles.tabularRight}
                    >
                      {formatCurrency(itemTotalPrize)}
                    </Text>
                  ) : (
                    <Text
                      variant="body"
                      color={colors.textMuted}
                      style={styles.tabularRight}
                    >
                      —
                    </Text>
                  )}
                </View>

                <BatchSaveBookmark
                  testID={`batch-save-ticket-${item.ticket}`}
                  isSaved={isSaved}
                  ticket={item.ticket ?? ''}
                  onPress={() => handleSaveItem(item)}
                />
              </View>
            </View>
          );
        })}
      </View>

      {onCheckAgain ? (
        <Button
          testID="batch-check-again-btn"
          variant="secondary"
          title={STRINGS.check.batchCheckAgain}
          accessibilityLabel={STRINGS.check.batchCheckAgain}
          icon={<Icon name="refresh" size={16} color={colors.textMain} />}
          onPress={onCheckAgain}
        />
      ) : null}

      <Text variant="caption" color={colors.textMuted} style={styles.disclaimer}>
        {STRINGS.check.disclaimer}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  summaryBar: {
    padding: 16,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 12,
  },
  summaryStats: {
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  saveAllLabel: {
    marginLeft: 6,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  listBox: {
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  row: {
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  indexText: {
    width: 24,
    textAlign: 'right',
    marginRight: 8,
    fontVariant: ['tabular-nums'],
  },
  rowMiddle: {
    flex: 1,
    paddingHorizontal: 6,
    alignItems: 'flex-start',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountCol: {
    minWidth: 74,
    alignItems: 'flex-end',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  tabularRight: {
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },
  bookmarkBtn: {
    minWidth: 36,
    minHeight: 36,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimer: {
    marginTop: 12,
    textAlign: 'center',
  },
});
