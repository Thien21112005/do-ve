import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text, usePressed } from '@/components/ui';
import { useTheme, radii } from '@/theme';
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

interface StatCellProps {
  testID: string;
  label: string;
  value: string;
  subtitle: string;
  selected: boolean;
  accentColor: string;
  valueColor: string;
  a11yLabel: string;
  onPress: () => void;
}

function StatCell({
  testID,
  label,
  value,
  subtitle,
  selected,
  accentColor,
  valueColor,
  a11yLabel,
  onPress,
}: StatCellProps) {
  const { colors } = useTheme();
  const { pressed, pressHandlers } = usePressed();

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      {...pressHandlers}
      style={[
        styles.statCell,
        {
          backgroundColor: selected ? colors.surfaceSubtle : colors.surface,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text
        variant="caption"
        color={selected ? accentColor : colors.textMuted}
        style={styles.statLabel}
      >
        {label}
      </Text>
      <Text
        variant="bodyStrong"
        color={valueColor}
        numberOfLines={1}
        style={styles.statValue}
      >
        {value}
      </Text>
      <Text variant="caption" color={colors.textMuted} numberOfLines={1}>
        {subtitle}
      </Text>
    </Pressable>
  );
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
    haptics.selection?.();
    onSelectFilter?.(filter);
  };

  return (
    <View
      testID={testID}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <StatCell
        testID="summary-stat-total"
        label={STRINGS.tickets.summaryTotal}
        value={String(totalTickets)}
        subtitle={STRINGS.tickets.summaryAllSubtitle}
        selected={activeFilter === 'ALL'}
        accentColor={colors.primary}
        valueColor={colors.textMain}
        a11yLabel={`${STRINGS.tickets.summaryTotal}: ${totalTickets} vé`}
        onPress={() => handlePress('ALL')}
      />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <StatCell
        testID="summary-stat-pending"
        label={STRINGS.tickets.summaryPending}
        value={String(pendingCount)}
        subtitle={STRINGS.tickets.summaryPendingSubtitle}
        selected={activeFilter === 'PENDING'}
        accentColor={colors.pending}
        valueColor={pendingCount > 0 ? colors.pending : colors.textMain}
        a11yLabel={`${STRINGS.tickets.summaryPending}: ${pendingCount} vé`}
        onPress={() => handlePress('PENDING')}
      />

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <StatCell
        testID="summary-stat-won"
        label={STRINGS.tickets.summaryWon}
        value={formatCurrency(totalWonPrize)}
        subtitle={STRINGS.tickets.summaryWonSubtitle(wonCount)}
        selected={activeFilter === 'WON'}
        accentColor={colors.win}
        valueColor={totalWonPrize > 0 ? colors.win : colors.textMain}
        a11yLabel={`${STRINGS.tickets.summaryWon}: ${formatCurrency(totalWonPrize)}`}
        onPress={() => handlePress('WON')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontFamily: 'BeVietnamPro-Medium',
  },
  statValue: {
    marginVertical: 2,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
});
