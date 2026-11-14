import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BatchResultList } from '../BatchResultList';
import type { BatchCheckResponse } from '@/types';

const mockBatchResult: BatchCheckResponse = {
  station: 'TPHCM',
  drawDate: '2026-11-14',
  totalPrize: 300000,
  totalWonTickets: 1,
  results: [
    {
      ticket: '123456',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: true,
      wins: [
        {
          tier: 'SEVENTH',
          tierName: 'Giải bảy',
          prizeAmount: 200000,
          matchedDigits: '456',
        },
        {
          tier: 'EIGHTH',
          tierName: 'Giải tám',
          prizeAmount: 100000,
          matchedDigits: '56',
        },
      ],
      totalPrize: 300000,
    },
    {
      ticket: '654321',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'CHECKED',
      won: false,
      wins: [],
      totalPrize: 0,
    },
    {
      ticket: '999888',
      station: 'TPHCM',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-14',
      status: 'RESULT_NOT_AVAILABLE',
      won: null,
      wins: [],
      totalPrize: 0,
    },
  ],
};

describe('BatchResultList Component', () => {
  it('renders batch summary with total tickets, won tickets count, and total prize', async () => {
    const { getByTestId, getByText } = await render(
      <BatchResultList batchResult={mockBatchResult} />,
    );

    expect(getByTestId('batch-result-list')).toBeTruthy();
    expect(getByText(/3 vé/)).toBeTruthy();
    expect(getByText(/1 vé trúng/)).toBeTruthy();
    expect(getByText('300.000 đ')).toBeTruthy();
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

  it('triggers onCheckAgain when the check again button is pressed', async () => {
    const onAgain = jest.fn();
    const { getByTestId } = await render(
      <BatchResultList batchResult={mockBatchResult} onCheckAgain={onAgain} />,
    );

    const btn = getByTestId('batch-check-again-btn');
    fireEvent.press(btn);

    expect(onAgain).toHaveBeenCalled();
  });
});
