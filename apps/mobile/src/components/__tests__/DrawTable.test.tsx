import React from 'react';
import { render } from '@testing-library/react-native';
import { DrawTable, DRAW_TIERS } from '../DrawTable';

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
  it('renders all 9 prize tiers in order from SPECIAL down to EIGHTH', async () => {
    const { getByTestId, getByText } = await render(
      <DrawTable prizes={mockPrizes} />,
    );

    expect(getByTestId('draw-table')).toBeTruthy();
    expect(DRAW_TIERS).toHaveLength(9);
    expect(DRAW_TIERS[0].key).toBe('SPECIAL');
    expect(DRAW_TIERS[8].key).toBe('EIGHTH');

    // Labels for all tiers
    expect(getByText('Đặc biệt')).toBeTruthy();
    expect(getByText('Giải nhất')).toBeTruthy();
    expect(getByText('Giải nhì')).toBeTruthy();
    expect(getByText('Giải ba')).toBeTruthy();
    expect(getByText('Giải tư')).toBeTruthy();
    expect(getByText('Giải năm')).toBeTruthy();
    expect(getByText('Giải sáu')).toBeTruthy();
    expect(getByText('Giải bảy')).toBeTruthy();
    expect(getByText('Giải tám')).toBeTruthy();
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
