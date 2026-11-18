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
    await fireEvent.press(retryBtn);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders as a compact header sub-strip and keeps retry button outside accessible=true ancestors (T11.48)', async () => {
    const { getByTestId } = await render(
      <OfflineBanner isOffline={true} onRetry={jest.fn()} />,
    );

    const strip = getByTestId('offline-banner-strip');
    const stripStyles = [strip.props.style].flat();
    expect(stripStyles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ borderBottomWidth: 1 }),
      ]),
    );

    const retryBtn = getByTestId('offline-banner-retry-btn');
    let parent = retryBtn.parent;
    while (parent) {
      expect(parent.props?.accessible).not.toBe(true);
      parent = parent.parent;
    }
  });
});
