import React from 'react';
import { render } from '@testing-library/react-native';
import { ResultCard } from '../ResultCard';
import type { UiCheckResult } from '@/api/mappers';

const lost: UiCheckResult = {
  ticket: '654321',
  stationCode: 'tp-hcm',
  station: 'tp-hcm',
  stationName: 'TP. Hồ Chí Minh',
  drawDate: '2026-11-15',
  status: 'CHECKED',
  won: false,
  wins: [],
  totalAmount: 0,
  totalPrize: 0,
};

function hasAccessibleAncestor(node: any): boolean {
  let p = node.parent;
  while (p) {
    if (p.props?.accessible === true) return true;
    p = p.parent;
  }
  return false;
}

describe('ResultCard actions stay reachable by screen readers (T11.22)', () => {
  it('the save button is not swallowed by an accessible ancestor', async () => {
    const { getByTestId } = await render(<ResultCard result={lost} onSaveTicket={jest.fn()} />);
    expect(hasAccessibleAncestor(getByTestId('result-card-save-btn'))).toBe(false);
  });

  it('only the summary region is grouped and announced', async () => {
    const { getByTestId } = await render(<ResultCard result={lost} onSaveTicket={jest.fn()} />);
    const summary = getByTestId('result-card');
    expect(summary.props.accessible).toBe(true);
    expect(summary.props.accessibilityLiveRegion).toBe('assertive');
  });
});
