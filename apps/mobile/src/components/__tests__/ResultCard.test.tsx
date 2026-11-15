import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ResultCard } from '../ResultCard';
import { haptics } from '@/lib/haptics';
import type { UiCheckResult } from '@/api/mappers';

jest.mock('@/lib/haptics', () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
  },
}));

describe('ResultCard Component', () => {
  const winningResult: UiCheckResult = {
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
  };

  const losingResult: UiCheckResult = {
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
  };

  const notAvailableResult: UiCheckResult = {
    ticket: '777888',
    stationCode: 'TPHCM',
    station: 'TPHCM',
    stationName: 'TP. Hồ Chí Minh',
    drawDate: '2026-11-14',
    status: 'RESULT_NOT_AVAILABLE',
    won: null,
    wins: [],
    totalAmount: 0,
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
    expect(getByTestId('ticket-segment-matched')).toBeTruthy();
    expect(getByText('456')).toBeTruthy();
    expect(getByText('123')).toBeTruthy();
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

  it('fires onSaveTicket callback and triggers haptics.light when save button is pressed', async () => {
    const onSave = jest.fn();
    const { getByTestId } = await render(
      <ResultCard result={winningResult} onSaveTicket={onSave} />,
    );

    const saveBtn = getByTestId('result-card-save-btn');
    fireEvent.press(saveBtn);

    expect(haptics.light).toHaveBeenCalled();
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

  it('renders RESULT_NOT_AVAILABLE state with 16h30 notice and retry button', async () => {
    const onCheckAgain = jest.fn();
    const { getByText, getByTestId } = await render(
      <ResultCard result={notAvailableResult} onCheckAgain={onCheckAgain} />,
    );

    expect(getByTestId('result-card')).toBeTruthy();
    expect(getByText('Chưa có kết quả')).toBeTruthy();
    expect(getByText('Chưa có kết quả, thường có sau 16h35')).toBeTruthy();
    expect(getByText('777888')).toBeTruthy();

    const retryBtn = getByTestId('result-card-retry-btn');
    expect(retryBtn).toBeTruthy();
    fireEvent.press(retryBtn);
    expect(onCheckAgain).toHaveBeenCalled();
  });
});
