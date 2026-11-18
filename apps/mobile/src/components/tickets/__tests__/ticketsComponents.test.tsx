import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  TicketRow,
  TicketList,
  TicketDetailSheet,
  TicketsMenu,
} from '../index';
import type { SavedTicket } from '@/types';

const sampleTicket: SavedTicket = {
  id: 't-1',
  ticket: '045123',
  station: 'ben-tre',
  stationName: 'Bến Tre',
  drawDate: '2026-11-17',
  status: 'WON',
  totalPrize: 200000,
  wins: [],
  note: 'Vé đầu tuần',
  createdAt: '2026-11-17T10:00:00Z',
};

describe('Split Tickets components (T11.41)', () => {
  it('renders TicketRow and calls onPress / onDelete', async () => {
    const onPress = jest.fn();
    const onDelete = jest.fn();
    const { getByTestId, getByText } = await render(
      <TicketRow
        ticket={sampleTicket}
        onPress={onPress}
        onDelete={onDelete}
      />,
    );

    expect(getByText('045123')).toBeTruthy();
    expect(getByText('Bến Tre')).toBeTruthy();
    await fireEvent.press(getByTestId('saved-ticket-item-t-1'));
    expect(onPress).toHaveBeenCalledWith(sampleTicket);

    await fireEvent.press(getByTestId('swipe-delete-btn-t-1'));
    expect(onDelete).toHaveBeenCalledWith(sampleTicket);
  });

  it('renders TicketList with grouped sections and filter chips', async () => {
    const onSelectFilter = jest.fn();
    const { getByTestId, getByText } = await render(
      <TicketList
        sections={[
          {
            title: '17/11/2026',
            drawDate: '2026-11-17',
            data: [sampleTicket],
          },
        ]}
        summaryStats={{ total: 1, pending: 0, won: 1, totalWonPrize: 200000 }}
        filterCounts={{ ALL: 1, WON: 1, PENDING: 0, LOST: 0 }}
        filteredCount={1}
        hasAnyTickets={true}
        activeFilter="ALL"
        isRechecking={false}
        onRefresh={jest.fn()}
        onSelectFilter={onSelectFilter}
        onPressTicket={jest.fn()}
        onDeleteTicket={jest.fn()}
      />,
    );

    expect(getByTestId('saved-tickets-list')).toBeTruthy();
    expect(getByTestId('section-header-2026-11-17')).toBeTruthy();
    expect(getByText('045123')).toBeTruthy();

    await fireEvent.press(getByTestId('ticket-filter-chip-WON'));
    expect(onSelectFilter).toHaveBeenCalledWith('WON');
  });

  it('renders TicketDetailSheet when ticket is provided and triggers actions', async () => {
    const onClose = jest.fn();
    const onSaveNote = jest.fn();
    const onViewDraw = jest.fn();
    const onRecheck = jest.fn();
    const onDelete = jest.fn();
    const { getByTestId } = await render(
      <TicketDetailSheet
        ticket={sampleTicket}
        noteDraft="Vé đầu tuần"
        isSavingNote={false}
        onChangeNote={jest.fn()}
        onSaveNote={onSaveNote}
        onViewDraw={onViewDraw}
        onRecheck={onRecheck}
        onDelete={onDelete}
        onClose={onClose}
      />,
    );

    expect(getByTestId('saved-ticket-detail-sheet')).toBeTruthy();
    expect(getByTestId('detail-sheet-ticket-number')).toBeTruthy();

    await fireEvent.press(getByTestId('detail-sheet-save-note-btn'));
    expect(onSaveNote).toHaveBeenCalled();

    await fireEvent.press(getByTestId('detail-sheet-view-draw-btn'));
    expect(onViewDraw).toHaveBeenCalledWith(sampleTicket);

    await fireEvent.press(getByTestId('detail-sheet-recheck-btn'));
    expect(onRecheck).toHaveBeenCalledWith(sampleTicket);
  });

  it('renders TicketsMenu when visible and fires export/import/clear callbacks', async () => {
    const onExport = jest.fn();
    const onImport = jest.fn();
    const onClearAll = jest.fn();
    const onClose = jest.fn();
    const { getByTestId } = await render(
      <TicketsMenu
        visible={true}
        onClose={onClose}
        onExport={onExport}
        onImport={onImport}
        onClearAll={onClearAll}
      />,
    );

    expect(getByTestId('tickets-overflow-menu')).toBeTruthy();
    await fireEvent.press(getByTestId('export-tickets-btn'));
    expect(onExport).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByTestId('import-tickets-btn'));
    expect(onImport).toHaveBeenCalledTimes(1);

    await fireEvent.press(getByTestId('clear-all-tickets-btn'));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });
});
