import React from 'react';
import {
  View,
  ScrollView,
  TextInput,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native';
import { Icon } from '@/components/Icon';
import { ResultStub } from '@/components/ResultStub';
import { Sheet, Text, Button, Banner, usePressed } from '@/components/ui';
import { useTheme, radii } from '@/theme';
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {ticket.status === 'INVALID' ? (
            <Banner
              variant="warning"
              message={`${ticket.stationName || ticket.station} · ${STRINGS.tickets.statusInvalidBadge}`}
              style={styles.invalidBanner}
            />
          ) : null}

          <View style={styles.stubWrap}>
            <ResultStub
              testID="detail-sheet-stub"
              compact={true}
              showPerforation={false}
              hideDisclaimer={true}
              result={{
                ticket: ticket.ticket,
                stationCode: ticket.station,
                stationName: ticket.stationName || ticket.station,
                drawDate: ticket.drawDate,
                status:
                  ticket.status === 'PENDING'
                    ? 'RESULT_NOT_AVAILABLE'
                    : 'CHECKED',
                won: ticket.status === 'WON',
                totalAmount: ticket.totalPrize || 0,
                wins: (ticket.wins || []) as any,
              }}
            />
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
        </ScrollView>
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  invalidBanner: {
    marginBottom: 10,
  },
  stubWrap: {
    marginBottom: 14,
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
