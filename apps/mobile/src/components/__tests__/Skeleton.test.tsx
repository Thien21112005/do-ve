import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { render, waitFor } from '@testing-library/react-native';
import * as Reanimated from 'react-native-reanimated';
import {
  Skeleton,
  HomeDrawsSkeleton,
  DrawTableSkeleton,
} from '../Skeleton';
import { ResultSkeleton } from '../ResultSkeleton';

describe('Skeleton and HomeDrawsSkeleton Components (T10.21 / T11.48)', () => {
  it('renders base Skeleton with custom dimensions', async () => {
    const { getByTestId } = await render(
      <Skeleton testID="custom-skeleton" width={100} height={24} borderRadius={12} />,
    );

    const skeleton = getByTestId('custom-skeleton');
    expect(skeleton).toBeTruthy();
  });

  it('renders HomeDrawsSkeleton with 3 flat row shapes inside 1 list frame', async () => {
    const { getByTestId } = await render(
      <HomeDrawsSkeleton testID="home-draws-skeleton" count={3} />,
    );

    expect(getByTestId('home-draws-skeleton')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-0')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-1')).toBeTruthy();
    expect(getByTestId('home-draws-skeleton-card-2')).toBeTruthy();
  });

  it('renders DrawTableSkeleton with 9 flat prize rows without nested bordered cards (T11.48)', async () => {
    const { getByTestId } = await render(
      <DrawTableSkeleton testID="draw-table-skeleton" rowCount={9} />,
    );

    const frame = getByTestId('draw-table-skeleton');
    expect(frame).toBeTruthy();
    expect(getByTestId('draw-table-skeleton-row-0')).toBeTruthy();
    expect(getByTestId('draw-table-skeleton-row-8')).toBeTruthy();
  });

  it('does not start repeating shimmer animation when Reduce Motion is enabled (T11.48)', async () => {
    const reduceSpy = jest
      .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
      .mockResolvedValue(true);
    const repeatSpy = jest.spyOn(Reanimated, 'withRepeat');
    repeatSpy.mockClear();

    try {
      await render(
        <>
          <Skeleton testID="rm-skeleton" />
          <ResultSkeleton testID="rm-result-skeleton" />
        </>,
      );

      await waitFor(() => {
        expect(reduceSpy).toHaveBeenCalled();
      });
      expect(repeatSpy).not.toHaveBeenCalled();
    } finally {
      reduceSpy.mockRestore();
      repeatSpy.mockRestore();
    }
  });
});

