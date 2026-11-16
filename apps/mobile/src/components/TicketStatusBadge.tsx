import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from './Icon';
import { useTheme } from '@/theme';
import { formatCurrency } from '@/lib/format';
import { STRINGS } from '@/lib/strings';
import type { SavedTicketStatus } from '@/types';

export interface TicketStatusBadgeProps {
  status: SavedTicketStatus;
  totalPrize?: number;
  testID?: string;
  size?: 'sm' | 'md';
}

export function TicketStatusBadge({
  status,
  totalPrize = 0,
  testID = 'ticket-status-badge',
  size = 'md',
}: TicketStatusBadgeProps) {
  const { colors } = useTheme();

  const isWon = status === 'WON';
  const isPending = status === 'PENDING';
  const hasPrize = isWon && totalPrize > 0;

  // Visual styling with borders and icons to remain clear even in monochrome
  const badgeConfig = isPending
    ? {
        icon: 'clock' as const,
        iconColor: colors.pending,
        bgColor: `${colors.pending}18`,
        borderColor: colors.pendingBorder,
        textColor: colors.pending,
        label: STRINGS.tickets.statusPendingBadge,
        a11y: STRINGS.tickets.statusPending,
      }
    : isWon
      ? {
          icon: 'trophy' as const,
          iconColor: colors.win,
          bgColor: `${colors.win}18`,
          borderColor: colors.winBorder,
          textColor: colors.win,
          label: STRINGS.tickets.statusWonBadge,
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
          label: STRINGS.tickets.statusLostBadge,
          a11y: STRINGS.tickets.statusLost,
        };

  const isSmall = size === 'sm';

  return (
    <View
      testID={testID}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={badgeConfig.a11y}
      className={`flex-row items-center rounded-full border ${
        isSmall ? 'px-2 py-0.5' : 'px-2.5 py-1'
      }`}
      style={{
        backgroundColor: badgeConfig.bgColor,
        borderColor: badgeConfig.borderColor,
      }}
    >
      <Icon
        name={badgeConfig.icon}
        size={isSmall ? 10 : 13}
        color={badgeConfig.iconColor}
      />
      <Text
        className="font-semibold ml-1.5 text-xs"
        style={{ color: badgeConfig.textColor }}
      >
        {badgeConfig.label}
        {hasPrize ? ` • ${formatCurrency(totalPrize)}` : ''}
      </Text>
    </View>
  );
}

