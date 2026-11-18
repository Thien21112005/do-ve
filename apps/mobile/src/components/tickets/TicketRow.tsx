import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { Icon } from '@/components/Icon';
import { TicketStatusBadge } from '@/components/TicketStatusBadge';
import { Text, usePressed } from '@/components/ui';
import { useTheme, radii } from '@/theme';
import { haptics } from '@/lib/haptics';
import type { SavedTicket } from '@/types';

export interface TicketRowProps {
  ticket: SavedTicket;
  isLastInSection?: boolean;
  onPress: (ticket: SavedTicket) => void;
  onDelete: (ticket: SavedTicket) => void;
}

export function TicketRow({
  ticket,
  isLastInSection = false,
  onPress,
  onDelete,
}: TicketRowProps) {
  const { colors } = useTheme();
  const { pressed: rowPressed, pressHandlers: rowHandlers } = usePressed();
  const { pressed: swipePressed, pressHandlers: swipeHandlers } = usePressed();

  const stationLabel = ticket.stationName || ticket.station;

  const renderRightActions = () => (
    <Pressable
      testID={`swipe-delete-btn-${ticket.id}`}
      onPress={() => onDelete(ticket)}
      accessibilityRole="button"
      accessibilityLabel={`Xóa vé ${ticket.ticket}`}
      {...swipeHandlers}
      style={[
        styles.swipeDeleteAction,
        {
          backgroundColor: colors.error,
          opacity: swipePressed ? 0.8 : 1,
        },
      ]}
    >
      <Icon name="trash" size={18} color={colors.onPrimary} />
      <Text
        variant="caption"
        color={colors.onPrimary}
        style={styles.swipeDeleteText}
      >
        Xóa
      </Text>
    </Pressable>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      testID={`swipeable-${ticket.id}`}
    >
      <Pressable
        testID={`saved-ticket-item-${ticket.id}`}
        onPress={() => {
          haptics.light();
          onPress(ticket);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Chi tiết vé ${ticket.ticket}, đài ${stationLabel}`}
        accessibilityActions={[{ name: 'delete', label: 'Xóa vé' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'delete') {
            onDelete(ticket);
          }
        }}
        {...rowHandlers}
        style={[
          styles.rowContainer,
          {
            backgroundColor: colors.surface,
            borderBottomWidth: isLastInSection ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
            opacity: rowPressed ? 0.72 : 1,
          },
        ]}
      >
        <View style={styles.leftInfo}>
          <Text
            variant="ticketMd"
            color={colors.textMain}
            style={styles.ticketDigits}
          >
            {ticket.ticket}
          </Text>
          <Text
            variant="caption"
            color={colors.textMuted}
            numberOfLines={1}
          >
            {stationLabel}
          </Text>
        </View>

        <View style={styles.rightInfo}>
          <TicketStatusBadge
            status={ticket.status}
            totalPrize={ticket.totalPrize}
            flat={true}
          />
          <Text
            variant="body"
            color={colors.textMuted}
            style={styles.chevron}
          >
            ›
          </Text>
        </View>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  leftInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketDigits: {
    letterSpacing: 1.2,
  },
  rightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 8,
    fontSize: 18,
    lineHeight: 20,
  },
  swipeDeleteAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginLeft: 8,
    borderRadius: radii.md,
  },
  swipeDeleteText: {
    marginTop: 2,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
});
