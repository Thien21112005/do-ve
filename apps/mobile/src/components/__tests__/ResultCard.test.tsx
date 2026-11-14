import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ResultCard } from '../ResultCard';
import type { CheckTicketResponse } from '@/types';

describe('ResultCard Component', () => {
  const winningResult: CheckTicketResponse = {
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
  };

  const losingResult: CheckTicketResponse = {
    ticket: '654321',
    station: 'TPHCM',
    stationName: 'TP. Hồ Chí Minh',
    drawDate: '2026-11-14',
    status: 'CHECKED',
    won: false,
    wins: [],
    totalPrize: 0,
  };

  it('renders winning state with congratulation message, prize list, and total amount', async () => {
    const { getByText, getByTestId } = await render(
      <ResultCard result={winningResult} />,
    );

    expect(getByTestId('result-card')).toBeTruthy();
    expect(getByText(/CHÚC MỪNG/i)).toBeTruthy();
    expect(getByText('Trúng 2 giải')).toBeTruthy();
    expect(getByText('Giải bảy')).toBeTruthy();
    expect(getByText('200.000 đ')).toBeTruthy();
    expect(getByText('Giải tám')).toBeTruthy();
    expect(getByText('100.000 đ')).toBeTruthy();
    expect(getByText('300.000 đ')).toBeTruthy();
    expect(getByText('123456')).toBeTruthy();
    expect(getByText(/TP. Hồ Chí Minh/)).toBeTruthy();
    expect(getByText(/14\/11\/2026/)).toBeTruthy();
  });

  it('renders non-winning state with polite message and 0 đ', async () => {
    const { getByText, getByTestId, queryByText } = await render(
      <ResultCard result={losingResult} />,
    );

    expect(getByTestId('result-card')).toBeTruthy();
    expect(getByText(/không trúng giải/i)).toBeTruthy();
    expect(getByText('654321')).toBeTruthy();
    expect(queryByText('Trúng 2 giải')).toBeNull();
  });

  it('fires onSaveTicket callback when save button is pressed', async () => {
    const onSave = jest.fn();
    const { getByTestId } = await render(
      <ResultCard result={winningResult} onSaveTicket={onSave} />,
    );

    const saveBtn = getByTestId('result-card-save-btn');
    fireEvent.press(saveBtn);

    expect(onSave).toHaveBeenCalledWith(winningResult);
  });

  it('displays saved state when isSaved is true', async () => {
    const { getByText } = await render(
      <ResultCard
        result={winningResult}
        isSaved={true}
        onSaveTicket={jest.fn()}
      />,
    );

    expect(getByText('Đã lưu vé')).toBeTruthy();
  });

  it('displays the disclaimer note per FR-SYS-03', async () => {
    const { getByText } = await render(<ResultCard result={winningResult} />);

    expect(getByText(/tham khảo/i)).toBeTruthy();
  });
});
