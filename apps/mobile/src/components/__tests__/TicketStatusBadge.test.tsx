import React from 'react';
import { render } from '@testing-library/react-native';
import { TicketStatusBadge } from '../TicketStatusBadge';

describe('TicketStatusBadge Component', () => {
  it('renders PENDING status with clock icon and "Chờ kết quả" text (T10.57)', async () => {
    const { getByTestId, getByText } = await render(
      <TicketStatusBadge status="PENDING" />,
    );

    const badge = getByTestId('ticket-status-badge');
    expect(badge).toBeTruthy();
    expect(getByText('Chờ kết quả')).toBeTruthy();
    expect(badge.props.accessibilityLabel).toContain('Chờ kết quả');
  });

  it('renders WON status with trophy icon, "Trúng" text and total prize amount', async () => {
    const { getByTestId, getByText } = await render(
      <TicketStatusBadge status="WON" totalPrize={2000000000} />,
    );

    const badge = getByTestId('ticket-status-badge');
    expect(badge).toBeTruthy();
    expect(getByText(/Trúng/)).toBeTruthy();
    expect(getByText(/2.000.000.000 đ/)).toBeTruthy();
    expect(badge.props.accessibilityLabel).toContain('Trúng thưởng: 2.000.000.000 đ');
  });

  it('renders LOST status with icon and "Không trúng" text', async () => {
    const { getByTestId, getByText } = await render(
      <TicketStatusBadge status="LOST" />,
    );

    const badge = getByTestId('ticket-status-badge');
    expect(badge).toBeTruthy();
    expect(getByText('Không trúng')).toBeTruthy();
    expect(badge.props.accessibilityLabel).toContain('Không trúng');
  });

  it('renders WON status without prize amount when totalPrize is 0 or undefined', async () => {
    const { getByTestId, getByText } = await render(
      <TicketStatusBadge status="WON" />,
    );

    const badge = getByTestId('ticket-status-badge');
    expect(badge).toBeTruthy();
    expect(getByText('Trúng')).toBeTruthy();
  });
});

