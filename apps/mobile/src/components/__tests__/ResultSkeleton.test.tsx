import React from 'react';
import { render } from '@testing-library/react-native';
import { ResultSkeleton } from '../ResultSkeleton';

describe('ResultSkeleton Component', () => {
  it('renders skeleton placeholders with default testID', async () => {
    const { getByTestId } = await render(<ResultSkeleton />);

    expect(getByTestId('result-skeleton')).toBeTruthy();
    expect(getByTestId('result-skeleton-header')).toBeTruthy();
    expect(getByTestId('result-skeleton-subtitle')).toBeTruthy();
    expect(getByTestId('result-skeleton-total')).toBeTruthy();
  });

  it('renders correctly with custom testID', async () => {
    const { getByTestId } = await render(
      <ResultSkeleton testID="custom-skeleton" />,
    );

    expect(getByTestId('custom-skeleton')).toBeTruthy();
    expect(getByTestId('custom-skeleton-header')).toBeTruthy();
    expect(getByTestId('custom-skeleton-subtitle')).toBeTruthy();
    expect(getByTestId('custom-skeleton-total')).toBeTruthy();
  });
});
