import React from 'react';
import { render } from '@testing-library/react-native';
import { DrawTable, DRAW_TIERS } from '../DrawTable';
import { REAL_DRAW_PAYLOAD } from '@/api/__fixtures__/realBackendPayloads';
import { updateSettings, resetSettings } from '@/store/settings';

const mockPrizes: Record<string, string[]> = {
  SPECIAL: ['654321'],
  FIRST: ['12345'],
  SECOND: ['23456'],
  THIRD: ['34567', '34568'],
  FOURTH: ['45671', '45672', '45673', '45674', '45675', '45676', '45677'],
  FIFTH: ['5678'],
  SIXTH: ['6781', '6782', '6783'],
  SEVENTH: ['789'],
  EIGHTH: ['89'],
};

describe('DrawTable', () => {
  beforeEach(() => {
    resetSettings();
  });

  it('renders all 9 prize tiers in printed sheet order by default (G8 down to SPECIAL) (T10.38)', async () => {
    const { getByTestId, getByText } = await render(
      <DrawTable prizes={mockPrizes} />,
    );

    expect(getByTestId('draw-table')).toBeTruthy();
    expect(DRAW_TIERS).toHaveLength(9);
    expect(DRAW_TIERS[0].key).toBe('EIGHTH');
    expect(DRAW_TIERS[8].key).toBe('SPECIAL');

    // Compact labels like printed sheets: G.8 ... ĐB
    expect(getByText('G.8')).toBeTruthy();
    expect(getByText('G.7')).toBeTruthy();
    expect(getByText('G.6')).toBeTruthy();
    expect(getByText('G.5')).toBeTruthy();
    expect(getByText('G.4')).toBeTruthy();
    expect(getByText('G.3')).toBeTruthy();
    expect(getByText('G.2')).toBeTruthy();
    expect(getByText('G.1')).toBeTruthy();
    expect(getByText('ĐB')).toBeTruthy();
  });

  it('supports reversing order from SPECIAL to G8 via order prop (T10.38)', async () => {
    const { getByTestId } = await render(
      <DrawTable prizes={mockPrizes} order="special_to_g8" />,
    );

    const firstRow = getByTestId('draw-table-row-0');
    expect(firstRow.props.accessibilityLabel).toContain('Đặc biệt');

    const lastRow = getByTestId('draw-table-row-8');
    expect(lastRow.props.accessibilityLabel).toContain('Giải tám');
  });

  it('supports reading drawTableOrder from settings when order prop is not passed (T10.38)', async () => {
    updateSettings({ drawTableOrder: 'special_to_g8' });
    const { getByTestId } = await render(<DrawTable prizes={mockPrizes} />);

    const firstRow = getByTestId('draw-table-row-0');
    expect(firstRow.props.accessibilityLabel).toContain('Đặc biệt');
  });

  it('renders all winning numbers accurately with preserved leading zeros', async () => {
    const prizesWithZeros: Record<string, string[]> = {
      ...mockPrizes,
      SPECIAL: ['012345'],
      EIGHTH: ['09'],
    };

    const { getByText } = await render(<DrawTable prizes={prizesWithZeros} />);

    expect(getByText('012345')).toBeTruthy();
    expect(getByText('09')).toBeTruthy();
    expect(getByText('12345')).toBeTruthy();
    expect(getByText('34567')).toBeTruthy();
    expect(getByText('34568')).toBeTruthy();
    expect(getByText('45671')).toBeTruthy();
    expect(getByText('45677')).toBeTruthy();
  });

  it('renders accurately when passed numbers property from real backend fixture (T09.08)', async () => {
    const { getByText } = await render(
      <DrawTable numbers={REAL_DRAW_PAYLOAD.numbers} />,
    );

    expect(getByText('482915')).toBeTruthy();
    expect(getByText('73924')).toBeTruthy();
    expect(getByText('81057')).toBeTruthy();
    expect(getByText('62481')).toBeTruthy();
    expect(getByText('90135')).toBeTruthy();
    expect(getByText('15')).toBeTruthy();
  });

  it('renders placeholder dash when prizes are empty or undefined', async () => {
    const { getAllByText } = await render(<DrawTable prizes={{}} />);
    // Tiers with missing prizes should render '-'
    const dashes = getAllByText('-');
    expect(dashes.length).toBeGreaterThanOrEqual(9);
  });

  it('provides accessibility labels for assistive technologies', async () => {
    const { getByLabelText } = await render(<DrawTable prizes={mockPrizes} />);
    expect(getByLabelText(/Đặc biệt.*654321/)).toBeTruthy();
    expect(getByLabelText(/Giải tám.*89/)).toBeTruthy();
  });
});
