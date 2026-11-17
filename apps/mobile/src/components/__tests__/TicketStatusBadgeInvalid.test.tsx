import React from 'react';
import { render } from '@testing-library/react-native';
import { TicketStatusBadge } from '../TicketStatusBadge';
import { STRINGS } from '@/lib/strings';

describe('TicketStatusBadge INVALID (T11.16)', () => {
  it('says the station does not draw that day, in words', async () => {
    const { getByText, getByTestId } = await render(<TicketStatusBadge status="INVALID" />);
    expect(getByText(STRINGS.tickets.statusInvalidBadge)).toBeTruthy();
    expect(getByTestId('ticket-status-badge').props.accessibilityLabel).toBe(
      STRINGS.tickets.statusInvalidBadge,
    );
  });
});
