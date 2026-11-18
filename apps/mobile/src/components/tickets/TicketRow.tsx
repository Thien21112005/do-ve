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
  const { pressed: delPressed, pressHandlers: delHandlers } = usePressed();

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
      <View
        style={[
          styles.rowWrap,
          {
            backgroundColor: colors.surface,
            borderBottomWidth: isLastInSection ? 0 : StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Pressable
          testID={`saved-ticket-item-${ticket.id}`}
          onPress={() => {
            haptics.light();
            onPress(ticket);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Chi tiết vé ${ticket.ticket}, đài ${stationLabel}`}
          {...rowHandlers}
          style={[
            styles.rowMainPressable,
            { opacity: rowPressed ? 0.72 : 1 },
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

          <TicketStatusBadge
            status={ticket.status}
            totalPrize={ticket.totalPrize}
            size="sm"
          />
        </Pressable>

        <Pressable
          testID={`delete-ticket-btn-${ticket.id}`}
          onPress={() => onDelete(ticket)}
          accessibilityRole="button"
          accessibilityLabel={`Xóa vé ${ticket.ticket}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          {...delHandlers}
          style={[
            styles.inlineDeleteBtn,
            { opacity: delPressed ? 0.65 : 1 },
          ]}
        >
          <Icon name="trash" size={16} color={colors.textMuted} />
        </Pressable>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingLeft: 14,
    paddingRight: 8,
  },
  rowMainPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: 10,
  },
  leftInfo: {
    flex: 1,
    marginRight: 10,
  },
  ticketDigits: {
    letterSpacing: 1.2,
  },
  inlineDeleteBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
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
