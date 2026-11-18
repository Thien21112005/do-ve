import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { Text } from '@/components/ui';
import { useTheme, radii } from '@/theme';
import { formatCurrency } from '@/lib/format';
import { STRINGS } from '@/lib/strings';
import type { SavedTicketStatus } from '@/types';

export interface TicketStatusBadgeProps {
  status: SavedTicketStatus;
  totalPrize?: number;
  testID?: string;
  size?: 'sm' | 'md';
  /** Flat inline text+color mode for flat ticket list rows (T11.42). */
  flat?: boolean;
}

export function TicketStatusBadge({
  status,
  totalPrize = 0,
  testID = 'ticket-status-badge',
  size = 'md',
  flat = false,
}: TicketStatusBadgeProps) {
  const { colors } = useTheme();

  const isWon = status === 'WON';
  const isPending = status === 'PENDING';
  const hasPrize = isWon && totalPrize > 0;

  const badgeConfig =
    status === 'INVALID'
      ? {
          icon: 'alertCircle' as const,
          iconColor: colors.textMuted,
          bgColor: colors.surfaceSubtle,
          borderColor: colors.border,
          textColor: colors.textMuted,
          text: STRINGS.tickets.statusInvalidBadge,
          a11y: STRINGS.tickets.statusInvalidBadge,
        }
      : isPending
        ? {
            icon: 'clock' as const,
            iconColor: colors.pending,
            bgColor: colors.pendingTint,
            borderColor: colors.pendingBorder,
            textColor: colors.pending,
            text: STRINGS.tickets.statusPendingBadge,
            a11y: STRINGS.tickets.statusPending,
          }
        : isWon
          ? {
              icon: 'trophy' as const,
              iconColor: colors.win,
              bgColor: colors.winTint,
              borderColor: colors.winBorder,
              textColor: colors.win,
              text: hasPrize
                ? `${STRINGS.tickets.statusWonBadge} ${formatCurrency(totalPrize)}`
                : STRINGS.tickets.statusWonBadge,
              a11y: hasPrize
                ? `${STRINGS.tickets.statusWon}: ${formatCurrency(totalPrize)}`
                : STRINGS.tickets.statusWon,
            }
          : {
              icon: 'x' as const,
              iconColor: colors.textMuted,
              bgColor: colors.surfaceSubtle,
              borderColor: colors.border,
              textColor: colors.textMuted,
              text: STRINGS.tickets.statusLostBadge,
              a11y: STRINGS.tickets.statusLost,
            };

  if (flat) {
    return (
      <View
        testID={testID}
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={badgeConfig.a11y}
        style={styles.flatRow}
      >
        <Text
          variant={isWon ? 'bodyStrong' : 'caption'}
          color={badgeConfig.textColor}
          style={styles.flatText}
        >
          {badgeConfig.text}
        </Text>
      </View>
    );
  }

  const isSmall = size === 'sm';

  return (
    <View
      testID={testID}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={badgeConfig.a11y}
      style={[
        styles.pill,
        isSmall ? styles.pillSm : styles.pillMd,
        {
          backgroundColor: badgeConfig.bgColor,
          borderColor: badgeConfig.borderColor,
        },
      ]}
    >
      <Icon
        name={badgeConfig.icon}
        size={isSmall ? 11 : 13}
        color={badgeConfig.iconColor}
      />
      <Text
        variant="caption"
        color={badgeConfig.textColor}
        style={styles.pillText}
      >
        {badgeConfig.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.full,
    borderWidth: 1,
  },
  pillSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: {
    marginLeft: 5,
    fontFamily: 'BeVietnamPro-SemiBold',
    fontVariant: ['tabular-nums'],
  },
  flatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flatText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontVariant: ['tabular-nums'],
  },
});
