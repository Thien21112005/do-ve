import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { BatchResultList } from '../BatchResultList';
import { haptics } from '@/lib/haptics';
import type { UiBatchResult } from '@/api/mappers';

jest.mock('@/lib/haptics', () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

const mockBatchResult: UiBatchResult = {
  stationCode: 'TPHCM',
  station: 'TPHCM',
  stationName: 'TP. Hồ Chí Minh',
  drawDate: '2026-11-14',
  totalAmount: 300000,
  totalPrize: 300000,
  totalWonTickets: 1,
  totalTickets: 3,
  results: [
    {
      ticket: '123456',
      stationCode: 'TPHCM',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'WIN',
      won: true,
      wins: [
        {
          tier: 'SEVENTH',
          tierName: 'Giải bảy',
          prizeAmount: 200000,
          matchedNumber: '456',
          matchedDigits: '456',
        },
        {
          tier: 'EIGHTH',
          tierName: 'Giải tám',
          prizeAmount: 100000,
          matchedNumber: '56',
          matchedDigits: '56',
        },
      ],
      totalAmount: 300000,
      totalPrize: 300000,
    },
    {
      ticket: '654321',
      stationCode: 'TPHCM',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'LOSE',
      won: false,
      wins: [],
      totalAmount: 0,
      totalPrize: 0,
    },
    {
      ticket: '999888',
      stationCode: 'TPHCM',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'RESULT_NOT_AVAILABLE',
      won: null,
      wins: [],
      totalAmount: 0,
      totalPrize: 0,
    },
  ],
};

describe('BatchResultList Component', () => {
  it('renders batch summary with total tickets, won tickets count, and total prize', async () => {
    const { getByTestId, getByText, getAllByText } = await render(
      <BatchResultList batchResult={mockBatchResult} />,
    );

    expect(getByTestId('batch-result-list')).toBeTruthy();
    expect(getByText(/3 vé/)).toBeTruthy();
    expect(getByText(/1 vé trúng/)).toBeTruthy();
    expect(getAllByText('300.000 đ').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all tickets in the batch with their respective statuses', async () => {
    const { getByText, getAllByText, getByTestId } = await render(
      <BatchResultList batchResult={mockBatchResult} />,
    );

    // Ticket 1: Won
    expect(getByTestId('batch-item-123456')).toBeTruthy();
    expect(getByText('Giải bảy')).toBeTruthy();
    expect(getByText('Giải tám')).toBeTruthy();

    // Ticket 2: Lost
    expect(getByTestId('batch-item-654321')).toBeTruthy();
    expect(getAllByText(/Không trúng/i).length).toBeGreaterThanOrEqual(1);

    // Ticket 3: Result not available
    expect(getByTestId('batch-item-999888')).toBeTruthy();
    expect(getAllByText(/Chưa có kết quả/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders compact summary bar with clean station name and stats (T10.34)', async () => {
    const { getByTestId, getByText } = await render(
      <BatchResultList batchResult={mockBatchResult} />,
    );

    const summaryBar = getByTestId('batch-summary-bar');
    expect(summaryBar).toBeTruthy();
    expect(getByText(/TP\. Hồ Chí Minh · 14\/11\/2026/)).toBeTruthy();
    expect(getByText(/Dò 3 vé · 1 vé trúng · 300\.000 đ/)).toBeTruthy();
  });

  it('sorts winning tickets to the top of the list (T10.34)', async () => {
    const mixedBatchResult: UiBatchResult = {
      ...mockBatchResult,
      results: [
        mockBatchResult.results![1], // 654321 (LOSE)
        mockBatchResult.results![0], // 123456 (WIN)
        mockBatchResult.results![2], // 999888 (PENDING)
      ],
    };

    const { getAllByTestId } = await render(
      <BatchResultList batchResult={mixedBatchResult} />,
    );

    // First rendered row should be the winning ticket 123456
    const rows = getAllByTestId(/^batch-item-/);
    expect(rows[0].props.testID).toBe('batch-item-123456');
  });

  it('filters list to show only winning tickets when filter is selected (T10.34)', async () => {
    const { getByTestId, queryByTestId } = await render(
      <BatchResultList batchResult={mockBatchResult} />,
    );

    expect(getByTestId('batch-item-123456')).toBeTruthy();
    expect(getByTestId('batch-item-654321')).toBeTruthy();

    // Toggle filter: Only winning tickets
    const wonOnlyFilter = getByTestId('batch-filter-won');
    fireEvent.press(wonOnlyFilter);

    // Only winning ticket remains
    await waitFor(() => {
      expect(queryByTestId('batch-item-654321')).toBeNull();
      expect(queryByTestId('batch-item-999888')).toBeNull();
    });
    expect(getByTestId('batch-item-123456')).toBeTruthy();

    // Toggle back: All tickets
    const allFilter = getByTestId('batch-filter-all');
    fireEvent.press(allFilter);

    await waitFor(() => {
      expect(getByTestId('batch-item-123456')).toBeTruthy();
      expect(getByTestId('batch-item-654321')).toBeTruthy();
    });
  });

  it('triggers onCheckAgain when the check again button is pressed', async () => {
    const onAgain = jest.fn();
    const { getByTestId } = await render(
      <BatchResultList batchResult={mockBatchResult} onCheckAgain={onAgain} />,
    );

    const btn = getByTestId('batch-check-again-btn');
    fireEvent.press(btn);

    expect(onAgain).toHaveBeenCalled();
  });

  it('displays full station name instead of raw code when only station code is provided (T09.27)', async () => {
    const rawCodeBatchResult = {
      station: 'tphcm',
      stationCode: 'tphcm',
      drawDate: '2026-11-14',
      results: [],
      totalAmount: 0,
      totalTickets: 0,
      totalWonTickets: 0,
    } as any;

    const { getByText } = await render(
      <BatchResultList batchResult={rawCodeBatchResult} />,
    );

    expect(getByText(/Đài TP\. Hồ Chí Minh/)).toBeTruthy();
  });

  it('saves a single ticket with bookmark button and haptics (T10.35)', async () => {
    const onSave = jest.fn();
    const { getByTestId } = await render(
      <BatchResultList
        batchResult={mockBatchResult}
        onSaveTicket={onSave}
      />,
    );

    const bookmarkBtn = getByTestId('batch-save-ticket-123456');
    expect(bookmarkBtn).toBeTruthy();

    fireEvent.press(bookmarkBtn);
    expect(haptics.light).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });

  it('saves all tickets when clicking save-all button (T10.35)', async () => {
    const onSaveAll = jest.fn();
    const { getByTestId, getByText } = await render(
      <BatchResultList
        batchResult={mockBatchResult}
        onSaveAllTickets={onSaveAll}
      />,
    );

    const saveAllBtn = getByTestId('batch-save-all-btn');
    expect(saveAllBtn).toBeTruthy();
    expect(getByText(/Lưu tất cả/)).toBeTruthy();

    fireEvent.press(saveAllBtn);
    expect(haptics.light).toHaveBeenCalled();
    expect(onSaveAll).toHaveBeenCalled();
  });
});
