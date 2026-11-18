import React from 'react';
import {
  View,
  SectionList,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Icon } from '@/components/Icon';
import {
  SavedTicketsSummary,
  type TicketFilterStatus,
} from '@/components/SavedTicketsSummary';
import { Text, Chip, Button } from '@/components/ui';
import { useTheme, layout, radii } from '@/theme';
import { STRINGS } from '@/lib/strings';
import type { SavedTicket } from '@/types';
import { TicketRow } from './TicketRow';

export interface TicketSection {
  title: string;
  drawDate: string;
  data: SavedTicket[];
}

export interface TicketListProps {
  sections: TicketSection[];
  summaryStats: {
    total: number;
    pending: number;
    won: number;
    totalWonPrize: number;
  };
  filterCounts: Record<TicketFilterStatus, number>;
  filteredCount: number;
  hasAnyTickets: boolean;
  activeFilter: TicketFilterStatus;
  isRechecking: boolean;
  onRefresh: () => void;
  onSelectFilter: (filter: TicketFilterStatus) => void;
  onPressTicket: (ticket: SavedTicket) => void;
  onDeleteTicket: (ticket: SavedTicket) => void;
  headerRight?: React.ReactNode;
}

const FILTER_OPTIONS: { key: TicketFilterStatus; label: string }[] = [
  { key: 'ALL', label: STRINGS.tickets.filterAll },
  { key: 'WON', label: STRINGS.tickets.filterWon },
  { key: 'PENDING', label: STRINGS.tickets.filterPending },
  { key: 'LOST', label: STRINGS.tickets.filterLost },
];

export function TicketList({
  sections,
  summaryStats,
  filterCounts,
  filteredCount,
  hasAnyTickets,
  activeFilter,
  isRechecking,
  onRefresh,
  onSelectFilter,
  onPressTicket,
  onDeleteTicket,
  headerRight,
}: TicketListProps) {
  const { colors } = useTheme();

  return (
    <SectionList
      testID="saved-tickets-list"
      sections={sections}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          testID="tickets-refresh-control"
          refreshing={isRechecking}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 40,
        width: '100%',
        maxWidth: layout.contentMaxWidth,
        alignSelf: 'center',
      }}
      renderSectionHeader={({ section }) => (
        <View
          testID={`section-header-${section.drawDate}`}
          style={[
            styles.sectionHeader,
            { backgroundColor: colors.background },
          ]}
        >
          <Text
            variant="caption"
            color={colors.textMuted}
            style={styles.sectionTitle}
          >
            {STRINGS.tickets.drawDateGroup(section.title).toUpperCase()}
          </Text>
          <Text variant="caption" color={colors.textMuted}>
            {STRINGS.tickets.ticketCount(section.data.length)}
          </Text>
        </View>
      )}
      renderItem={({ item, index, section }) => {
        const isFirst = index === 0;
        const isLast = index === section.data.length - 1;
        return (
          <View
            style={[
              {
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: colors.border,
              },
              isFirst && {
                borderTopWidth: 1,
                borderTopLeftRadius: radii.md,
                borderTopRightRadius: radii.md,
                overflow: 'hidden',
              },
              isLast && {
                borderBottomWidth: 1,
                borderBottomLeftRadius: radii.md,
                borderBottomRightRadius: radii.md,
                marginBottom: 8,
                overflow: 'hidden',
              },
            ]}
          >
            <TicketRow
              ticket={item}
              isLastInSection={isLast}
              onPress={onPressTicket}
              onDelete={onDeleteTicket}
            />
          </View>
        );
      }}
      ListHeaderComponent={
        <View style={styles.listHeader}>
          <SavedTicketsSummary
            totalTickets={summaryStats.total}
            pendingCount={summaryStats.pending}
            wonCount={summaryStats.won}
            totalWonPrize={summaryStats.totalWonPrize}
            activeFilter={activeFilter}
            onSelectFilter={onSelectFilter}
          />

          <View
            testID="tickets-filter-chips"
            style={styles.filterToolbar}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
              contentContainerStyle={styles.chipsContent}
            >
              {FILTER_OPTIONS.map((opt) => {
                const count = filterCounts[opt.key];
                return (
                  <Chip
                    key={opt.key}
                    testID={`ticket-filter-chip-${opt.key}`}
                    label={`${opt.label} (${count})`}
                    selected={activeFilter === opt.key}
                    onPress={() => onSelectFilter(opt.key)}
                  />
                );
              })}
            </ScrollView>
            {headerRight}
          </View>

          <View
            style={[
              styles.countRow,
              { borderBottomColor: colors.border },
            ]}
          >
            <Text variant="caption" color={colors.textMuted}>
              {STRINGS.tickets.ticketCount(filteredCount)}
            </Text>
          </View>
        </View>
      }
      ListEmptyComponent={
        hasAnyTickets ? (
          <View
            testID="tickets-filter-empty"
            style={[
              styles.filterEmptyBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Icon name="search" size={24} color={colors.textMuted} />
            <Text
              variant="bodyStrong"
              align="center"
              color={colors.textMain}
              style={styles.filterEmptyTitle}
            >
              {STRINGS.tickets.filterEmptyTitle}
            </Text>
            <Text
              variant="caption"
              align="center"
              color={colors.textMuted}
              style={styles.filterEmptyDesc}
            >
              {STRINGS.tickets.filterEmptyDesc}
            </Text>
            <Button
              testID="tickets-filter-empty-reset-btn"
              size="md"
              title={STRINGS.tickets.filterEmptyReset}
              onPress={() => onSelectFilter('ALL')}
              style={styles.filterResetBtn}
            />
          </View>
        ) : undefined
      }
      ListFooterComponent={
        <View
          testID="tickets-privacy-notice"
          style={[
            styles.privacyFooter,
            { backgroundColor: colors.surfaceSubtle },
          ]}
        >
          <Icon name="info" size={13} color={colors.textMuted} />
          <Text
            variant="caption"
            color={colors.textMuted}
            style={styles.privacyText}
          >
            {STRINGS.tickets.privacyNotice}
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listHeader: {
    marginBottom: 4,
  },
  filterToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  chipsScroll: {
    flex: 1,
  },
  chipsContent: {
    gap: 8,
    paddingRight: 4,
  },
  countRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  sectionHeader: {
    paddingTop: 12,
    paddingBottom: 6,
    paddingHorizontal: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'BeVietnamPro-SemiBold',
    letterSpacing: 0.6,
  },
  filterEmptyBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.lg,
    borderWidth: 1,
    marginVertical: 16,
  },
  filterEmptyTitle: {
    marginTop: 8,
  },
  filterEmptyDesc: {
    marginTop: 4,
  },
  filterResetBtn: {
    marginTop: 14,
  },
  privacyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.md,
  },
  privacyText: {
    marginLeft: 6,
  },
});
