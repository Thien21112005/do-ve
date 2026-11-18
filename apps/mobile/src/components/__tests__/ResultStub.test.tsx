import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ResultStub } from '../ResultStub';
import { colors } from '@/theme/colors';
import { haptics } from '@/lib/haptics';
import type { UiCheckResult } from '@/api/mappers';

jest.mock('@/lib/haptics', () => ({
  haptics: {
    light: jest.fn(),
    medium: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    error: jest.fn(),
    selection: jest.fn(),
  },
}));

describe('ResultStub (T11.34)', () => {
  const wonSingle: UiCheckResult = {
    ticket: '045123',
    stationCode: 'tien-giang',
    station: 'tien-giang',
    stationName: 'Tiền Giang',
    drawDate: '2026-11-16',
    status: 'CHECKED',
    won: true,
    wins: [
      {
        tier: 'FIFTH',
        tierName: 'Giải năm',
        prizeAmount: 200000,
        matchedNumber: '5123',
        matchedDigits: '5123',
      },
    ],
    totalAmount: 200000,
    totalPrize: 200000,
  };

  const lostResult: UiCheckResult = {
    ticket: '654321',
    stationCode: 'tien-giang',
    station: 'tien-giang',
    stationName: 'Tiền Giang',
    drawDate: '2026-11-16',
    status: 'CHECKED',
    won: false,
    wins: [],
    totalAmount: 0,
    totalPrize: 0,
  };

  const pendingResult: UiCheckResult = {
    ticket: '777888',
    stationCode: 'tien-giang',
    station: 'tien-giang',
    stationName: 'Tiền Giang',
    drawDate: '2026-11-16',
    status: 'RESULT_NOT_AVAILABLE',
    won: null,
    wins: [],
    totalAmount: 0,
    totalPrize: 0,
  };

  it('renders winning stub on winTint with TicketNumber, display amount, and amountInWordsVN', async () => {
    (haptics.success as jest.Mock).mockClear();
    const { getByTestId, getByText } = await render(
      <ResultStub result={wonSingle} onSaveTicket={jest.fn()} />,
    );

    const stub = getByTestId('result-card-container');
    const stubStyle = Object.assign(
      {},
      ...(Array.isArray(stub.props.style) ? stub.props.style.filter(Boolean) : [stub.props.style]),
    );
    expect(stubStyle.backgroundColor).toBe(colors.light.winTint);
    expect(stubStyle.borderColor).toBe(colors.light.winBorder);

    expect(getByText(/Tiền Giang · 16\/11\/2026/)).toBeTruthy();
    expect(getByText('Trúng Giải năm')).toBeTruthy();
    expect(getByText('200.000 đ')).toBeTruthy();
    expect(getByText('Hai trăm nghìn đồng')).toBeTruthy();
    expect(haptics.success).toHaveBeenCalledTimes(1);

    // Matched trailing 4 digits get 2px win underline in TicketNumber
    const d5 = getByTestId('result-card-hero-ticket-digit-5');
    const d5Style = Object.assign(
      {},
      ...(Array.isArray(d5.props.style) ? d5.props.style.filter(Boolean) : [d5.props.style]),
    );
    expect(d5Style.borderBottomColor).toBe(colors.light.win);
  });

  it('renders polite non-winning stub on neutral paper surface without red colors', async () => {
    const { getByTestId, getByText } = await render(
      <ResultStub result={lostResult} onSaveTicket={jest.fn()} />,
    );

    const stub = getByTestId('result-card-container');
    const stubStyle = Object.assign(
      {},
      ...(Array.isArray(stub.props.style) ? stub.props.style.filter(Boolean) : [stub.props.style]),
    );
    expect(stubStyle.backgroundColor).toBe(colors.light.surface);
    expect(stubStyle.borderColor).toBe(colors.light.border);
    expect(getByText(/không trúng giải/i)).toBeTruthy();
  });

  it('renders pending stub on pendingTint with expected draw time and save-to-recheck CTA', async () => {
    const onSave = jest.fn();
    const onRetry = jest.fn();
    const { getByTestId, getByText } = await render(
      <ResultStub
        result={pendingResult}
        onSaveTicket={onSave}
        onCheckAgain={onRetry}
      />,
    );

    const stub = getByTestId('result-card-container');
    const stubStyle = Object.assign(
      {},
      ...(Array.isArray(stub.props.style) ? stub.props.style.filter(Boolean) : [stub.props.style]),
    );
    expect(stubStyle.backgroundColor).toBe(colors.light.pendingTint);
    expect(getByTestId('result-card-pending-estimate')).toBeTruthy();
    expect(getByText('Chưa có kết quả, thường có lúc 16h40')).toBeTruthy();

    fireEvent.press(getByTestId('result-card-save-btn'));
    expect(onSave).toHaveBeenCalledWith(pendingResult);
  });
});
