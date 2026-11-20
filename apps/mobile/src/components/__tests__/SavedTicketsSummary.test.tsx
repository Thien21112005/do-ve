import React from 'react';
import { render } from '@testing-library/react-native';
import { SavedTicketsSummary } from '../SavedTicketsSummary';

describe('T13.13 SavedTicketsSummary prize total', () => {
  it('shows the exact won amount and lets it wrap instead of cutting it off', async () => {
    const { getByTestId } = await render(
      <SavedTicketsSummary totalTickets={3} pendingCount={0} wonCount={2} totalWonPrize={4_050_300_000} />,
    );

    const value = getByTestId('summary-stat-won-value');
    expect(value.props.children).toBe('4.050.300.000 đ');
    expect(value.props.numberOfLines).not.toBe(1);
  });

  it('gives the prize cell more room than the count cells', async () => {
    const { getByTestId } = await render(
      <SavedTicketsSummary totalTickets={1} pendingCount={0} wonCount={1} totalWonPrize={2_000_000_000} />,
    );

    const flexOf = (id: string) => {
      const style = [getByTestId(id).props.style].flat(Infinity).filter(Boolean);
      return Object.assign({}, ...style).flex as number;
    };
    expect(flexOf('summary-stat-won')).toBeGreaterThan(flexOf('summary-stat-total'));
  });
});
