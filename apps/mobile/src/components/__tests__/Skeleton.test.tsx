import React from 'react';
import { render } from '@testing-library/react-native';
import { Skeleton, HomeDrawsSkeleton } from '../Skeleton';

describe('Skeleton and HomeDrawsSkeleton Components (T10.21)', () => {
  it('renders base Skeleton with custom dimensions', async () => {
    const { getByTestId } = await render(
      <Skeleton testID="custom-skeleton" width={100} height={24} borderRadius={12} />,
    );

    const skeleton = getByTestId('custom-skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('renders HomeDrawsSkeleton with 3 realistic card shapes', async () => {
    const { getByTestId } = await render(
      <HomeDrawsSkeleton testID="home-draws-skeleton" count={3} />,
    );

    expect(getByTestId('home-draws-skeleton')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-0')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-1')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-2')).toBeTruthy();
  });
});
