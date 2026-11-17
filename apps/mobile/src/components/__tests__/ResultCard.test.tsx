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

  it('renders winning state with hero ticket number, context line, prize list, and 22px status title (T10.30)', async () => {
    const { getByText, getByTestId, queryByText } = await render(
      <ResultCard result={winningResult} />,
    );

    expect(getByTestId('result-card')).toBeTruthy();

    // 1. Context Line: Đài · Ngày
    const contextLine = getByTestId('result-card-context-line');
    expect(contextLine).toBeTruthy();
    expect(getByText(/TP\. Hồ Chí Minh · 14\/11\/2026/)).toBeTruthy();

    // 2. Hero Ticket Number (Nhân vật chính)
    expect(getByTestId('result-card-hero-ticket')).toBeTruthy();
    expect(getByTestId('ticket-segment-matched')).toBeTruthy();
    expect(getByText('456')).toBeTruthy();
    expect(getByText('123')).toBeTruthy();

    // 3. Status title 22px bold
    const statusTitle = getByTestId('result-card-status-title');
    expect(statusTitle).toBeTruthy();
    expect(getByText('Trúng 2 giải')).toBeTruthy();

    // 4. Duplicate badges removed
    expect(queryByText('TRÚNG')).toBeNull();

    // 5. Prize list & total
    expect(getByText('Giải bảy')).toBeTruthy();
    expect(getByText('200.000 đ')).toBeTruthy();
    expect(getByText('Giải tám')).toBeTruthy();
    expect(getByText('100.000 đ')).toBeTruthy();
    expect(getByText('300.000 đ')).toBeTruthy();
  });

  it('renders clearer prize breakdown with matched details, aligned prize, and tax note (T10.31)', async () => {
    const { getByText, getByTestId } = await render(
      <ResultCard result={winningResult} />,
    );

    // Prize match comparison label
    expect(getByText(/khớp 3 số cuối · 456/i)).toBeTruthy();
    expect(getByText(/khớp 2 số cuối · 56/i)).toBeTruthy();

    // Total prize text
    expect(getByTestId('result-card-total-prize')).toBeTruthy();
    expect(getByText('300.000 đ')).toBeTruthy();

    // Tax disclaimer note
    const taxNote = getByTestId('result-card-tax-note');
    expect(taxNote).toBeTruthy();
    expect(taxNote.props.children).toContain('chưa trừ thuế TNCN');
  });

  it('triggers haptics.success once on winning reveal in-card and provides polite a11y announcement (T10.37)', async () => {
    (haptics.success as jest.Mock).mockClear();
    const { getByTestId } = await render(<ResultCard result={winningResult} />);
    expect(haptics.success).toHaveBeenCalledTimes(1);

    const card = getByTestId('result-card');
    expect(card.props.accessibilityLabel).toBe(
      'Chúc mừng, vé trúng 2 giải, tổng 300.000 đồng',
    );
  });

  it('renders non-winning state with hero ticket and clean status (T10.30)', async () => {
    const { getByText, getByTestId, queryByText } = await render(
      <ResultCard result={losingResult} />,
    );

    expect(getByTestId('result-card')).toBeTruthy();
    expect(getByTestId('result-card-hero-ticket')).toBeTruthy();
    expect(getByText('654321')).toBeTruthy();
    expect(getByTestId('result-card-status-title')).toBeTruthy();
    expect(getByText('Không trúng')).toBeTruthy();
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

  it('renders actionable pending state with estimated time, primary save-to-recheck button, and secondary retry button (T10.33)', async () => {
    const onCheckAgain = jest.fn();
    const onSaveTicket = jest.fn();

    const { getByText, getByTestId } = await render(
      <ResultCard
        result={notAvailableResult}
        onCheckAgain={onCheckAgain}
        onSaveTicket={onSaveTicket}
      />,
    );

    expect(getByTestId('result-card')).toBeTruthy();
    expect(getByText('Chưa có kết quả')).toBeTruthy();

    // 1. Estimated time message (T10.33)
    const estimateBox = getByTestId('result-card-pending-estimate');
    expect(estimateBox).toBeTruthy();
    expect(getByText(/thường có lúc 16h35/i)).toBeTruthy();

    // 2. Action buttons order: Primary Save button above Secondary Retry button
    const saveBtn = getByTestId('result-card-save-btn');
    const retryBtn = getByTestId('result-card-retry-btn');
    expect(saveBtn).toBeTruthy();
    expect(retryBtn).toBeTruthy();

    expect(getByText('Lưu để tự dò lại')).toBeTruthy();
    expect(getByText('Dò lại')).toBeTruthy();
  });

  it('triggers onSaveTicket callback when pressing save-to-recheck button in pending state (T10.33)', async () => {
    const onSaveTicket = jest.fn();
    const { getByTestId } = await render(
      <ResultCard
        result={notAvailableResult}
        onSaveTicket={onSaveTicket}
      />,
    );

    const saveBtn = getByTestId('result-card-save-btn');
    fireEvent.press(saveBtn);
    expect(onSaveTicket).toHaveBeenCalledWith(notAvailableResult);
  });

  it('displays saved state for pending ticket (T10.33)', async () => {
    const { getByText } = await render(
      <ResultCard
        result={notAvailableResult}
        isSaved={true}
        onSaveTicket={jest.fn()}
      />,
    );

    expect(getByText('Đã lưu để tự dò lại')).toBeTruthy();
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

describe('ResultCard Khuyến khích label (T11.53)', () => {
  it('does not claim a 6-digit match for an ENCOURAGEMENT win', async () => {
    const result: UiCheckResult = {
      ticket: '123457',
      stationCode: 'tp-hcm',
      station: 'tp-hcm',
      stationName: 'TP. Hồ Chí Minh',
      drawDate: '2026-11-15',
      status: 'CHECKED',
      won: true,
      wins: [
        {
          tier: 'ENCOURAGEMENT',
          tierName: 'Giải Khuyến khích',
          matchedNumber: '123456',
          matchedDigits: '',
          prizeAmount: 6000000,
        },
      ],
      totalAmount: 6000000,
      totalPrize: 6000000,
    };
    const { getByText, queryByText } = await render(<ResultCard result={result} />);
    expect(getByText('Giải Khuyến khích')).toBeTruthy();
    expect(getByText(/sai 1 số so với giải Đặc biệt · 123456/)).toBeTruthy();
    expect(queryByText(/Trùng khớp 6 số/)).toBeNull();
  });
});
