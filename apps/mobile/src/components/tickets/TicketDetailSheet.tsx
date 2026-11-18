import React from 'react';
import {
  View,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native';
import { Icon } from '@/components/Icon';
import { TicketStatusBadge } from '@/components/TicketStatusBadge';
import { Sheet, Text, Button, usePressed } from '@/components/ui';
import { useTheme, radii } from '@/theme';
import { formatDateVN } from '@/lib/format';
import { STRINGS } from '@/lib/strings';
import type { SavedTicket } from '@/types';

export interface TicketDetailSheetProps {
  ticket: SavedTicket | null;
  noteDraft: string;
  isSavingNote: boolean;
  onChangeNote: (val: string) => void;
  onSaveNote: () => void;
  onViewDraw: (ticket: SavedTicket) => void;
  onRecheck: (ticket: SavedTicket) => void;
  onDelete: (ticket: SavedTicket) => void;
  onClose: () => void;
}

export function TicketDetailSheet({
  ticket,
  noteDraft,
  isSavingNote,
  onChangeNote,
  onSaveNote,
  onViewDraw,
  onRecheck,
  onDelete,
  onClose,
}: TicketDetailSheetProps) {
  const { colors } = useTheme();
  const { pressed: delPressed, pressHandlers: delHandlers } = usePressed();

  return (
    <Sheet
      visible={Boolean(ticket)}
      onClose={onClose}
      title="Chi tiết vé đã lưu"
      closeLabel={STRINGS.tickets.closeDetailA11y}
      closeTestID="detail-sheet-close-btn"
      testID="saved-ticket-detail-sheet"
    >
      {ticket ? (
        <View>
          <View
            style={[
              styles.ticketSummaryBox,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.stationDateRow}>
              <Text variant="bodyStrong" color={colors.textMain}>
                {ticket.stationName || ticket.station}
              </Text>
              <Text variant="caption" color={colors.textMuted}>
                {formatDateVN(ticket.drawDate)}
              </Text>
            </View>

            <View
              style={[
                styles.ticketNumberRow,
                { borderTopColor: colors.border },
              ]}
            >
              <View>
                <Text variant="caption" color={colors.textMuted}>
                  {STRINGS.check.ticketNumberLabel}
                </Text>
                <Text
                  testID="detail-sheet-ticket-number"
                  variant="ticketLg"
                  color={colors.textMain}
                >
                  {ticket.ticket}
                </Text>
              </View>
              <TicketStatusBadge
                status={ticket.status}
                totalPrize={ticket.totalPrize}
                size="md"
              />
            </View>
          </View>

          <View style={styles.noteSection}>
            <Text
              variant="caption"
              color={colors.textMuted}
              style={styles.noteLabel}
            >
              Ghi chú cá nhân
            </Text>
            <View style={styles.noteInputRow}>
              <TextInput
                testID="detail-sheet-note-input"
                value={noteDraft}
                onChangeText={onChangeNote}
                placeholder={STRINGS.tickets.notePlaceholder}
                placeholderTextColor={colors.textMuted}
                maxLength={100}
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.textMain,
                  },
                  Platform.OS === 'web'
                    ? ({ outlineStyle: 'none' } as any)
                    : null,
                ]}
              />
              <Button
                testID="detail-sheet-save-note-btn"
                size="md"
                title={
                  isSavingNote
                    ? STRINGS.tickets.savingNote
                    : STRINGS.tickets.saveNote
                }
                accessibilityLabel={STRINGS.tickets.saveNoteA11y}
                disabled={isSavingNote}
                loading={isSavingNote}
                onPress={onSaveNote}
              />
            </View>
          </View>

          <View style={styles.actionsStack}>
            <Button
              testID="detail-sheet-view-draw-btn"
              variant="secondary"
              size="md"
              title={STRINGS.tickets.viewDrawResultA11y}
              accessibilityLabel={STRINGS.tickets.viewDrawResultA11y}
              onPress={() => onViewDraw(ticket)}
            />
            <Button
              testID="detail-sheet-recheck-btn"
              variant="secondary"
              size="md"
              title={STRINGS.tickets.recheckTicketA11y}
              accessibilityLabel={STRINGS.tickets.recheckTicketA11y}
              onPress={() => onRecheck(ticket)}
            />

            <Pressable
              testID="detail-sheet-delete-btn"
              onPress={() => onDelete(ticket)}
              accessibilityRole="button"
              accessibilityLabel={STRINGS.tickets.deleteTicketA11y}
              {...delHandlers}
              style={[
                styles.deleteRowBtn,
                { opacity: delPressed ? 0.7 : 1 },
              ]}
            >
              <Icon name="trash" size={15} color={colors.error} />
              <Text
                variant="caption"
                color={colors.error}
                style={styles.deleteRowText}
              >
                Xóa vé khỏi máy
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  ticketSummaryBox: {
    padding: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: 14,
  },
  stationDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ticketNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  noteSection: {
    marginBottom: 14,
  },
  noteLabel: {
    marginBottom: 6,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
  noteInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteInput: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    fontSize: 14,
    fontFamily: 'BeVietnamPro-Regular',
  },
  actionsStack: {
    gap: 8,
  },
  deleteRowBtn: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  deleteRowText: {
    marginLeft: 6,
    fontFamily: 'BeVietnamPro-SemiBold',
  },
});
