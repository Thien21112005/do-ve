import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { OfflineBanner } from '../OfflineBanner';

describe('OfflineBanner Component', () => {
  it('renders banner when isOffline is true', async () => {
    const { getByTestId, getByText } = await render(
      <OfflineBanner isOffline={true} />,
    );

    expect(getByTestId('offline-banner')).toBeTruthy();
    expect(getByText(/Không có kết nối mạng/i)).toBeTruthy();
  });

  it('renders nothing when isOffline is false', async () => {
    const { queryByTestId } = await render(<OfflineBanner isOffline={false} />);

    expect(queryByTestId('offline-banner')).toBeNull();
  });

  it('calls onRetry callback when retry button is pressed', async () => {
    const onRetry = jest.fn();
    const { getByTestId } = await render(
      <OfflineBanner isOffline={true} onRetry={onRetry} />,
    );

    const retryBtn = getByTestId('offline-banner-retry-btn');
    fireEvent.press(retryBtn);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
