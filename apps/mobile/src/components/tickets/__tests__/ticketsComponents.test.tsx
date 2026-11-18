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

  it('renders >=56pt flat TicketRow with text+color status and Perforation between date groups (T11.42)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { colors } = require('@/theme/colors');
    const lostTicket: SavedTicket = {
      ...sampleTicket,
      id: 't-2',
      ticket: '778102',
      drawDate: '2026-11-16',
      status: 'LOST',
      totalPrize: 0,
    };

    const { getByTestId, getByText, queryByTestId } = await render(
      <TicketList
        sections={[
          {
            title: '17/11/2026',
            drawDate: '2026-11-17',
            data: [sampleTicket],
          },
          {
            title: '16/11/2026',
            drawDate: '2026-11-16',
            data: [lostTicket],
          },
        ]}
        summaryStats={{ total: 2, pending: 0, won: 1, totalWonPrize: 200000 }}
        filterCounts={{ ALL: 2, WON: 1, PENDING: 0, LOST: 1 }}
        filteredCount={2}
        hasAnyTickets={true}
        activeFilter="ALL"
        isRechecking={false}
        onRefresh={jest.fn()}
        onSelectFilter={jest.fn()}
        onPressTicket={jest.fn()}
        onDeleteTicket={jest.fn()}
      />,
    );

    const row = getByTestId('saved-ticket-item-t-1');
    const rowStyle = Object.assign(
      {},
      ...(Array.isArray(row.props.style)
        ? row.props.style.filter(Boolean)
        : [row.props.style]),
    );
    expect(rowStyle.minHeight).toBeGreaterThanOrEqual(56);
    expect(queryByTestId('delete-ticket-btn-t-1')).toBeNull();

    // Text + color status
    const wonText = getByText('Trúng 200.000 đ');
    const wonStyle = Object.assign(
      {},
      ...(Array.isArray(wonText.props.style)
        ? wonText.props.style.filter(Boolean)
        : [wonText.props.style]),
    );
    expect(wonStyle.color).toBe(colors.light.win);
    expect(getByText('Không trúng')).toBeTruthy();

    // Perforation rendered between sections
    expect(
      getByTestId('ticket-section-perforation-2026-11-17', {
        includeHiddenElements: true,
      }),
    ).toBeTruthy();
  });
});
