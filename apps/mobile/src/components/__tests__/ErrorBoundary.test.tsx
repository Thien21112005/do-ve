import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';

// Suppress console.error in this test because intentional throw triggers React error boundary logging
const originalError = console.error;

function BadComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Crash in component with ticket 654321');
  }
  return <Text testID="good-child">Everything is normal</Text>;
}

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('renders children when there is no error', async () => {
    const { getByTestId } = await render(
      <ErrorBoundary>
        <BadComponent shouldThrow={false} />
      </ErrorBoundary>,
    );

    expect(getByTestId('good-child')).toBeTruthy();
  });

  it('catches render errors and renders fallback UI with retry button', async () => {
    const { getByTestId, getByText } = await render(
      <ErrorBoundary>
        <BadComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(getByTestId('error-boundary-fallback')).toBeTruthy();
    expect(getByText('Đã xảy ra lỗi không mong muốn')).toBeTruthy();
    expect(getByTestId('error-boundary-retry-btn')).toBeTruthy();

    // Clicking retry resets error boundary state
    fireEvent.press(getByTestId('error-boundary-retry-btn'));
  });
});
