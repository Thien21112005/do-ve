import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { useRouter } from 'expo-router';

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

  it('recovers error boundary by changing child key and navigating to safe route (T09.55)', async () => {
    const router = useRouter();
    let mountCount = 0;
    let shouldCrash = true;

    function CrashOnce() {
      React.useEffect(() => {
        mountCount++;
      }, []);
      if (shouldCrash) {
        throw new Error('Fatal crash');
      }
      return <Text testID="recovered-child">Recovered</Text>;
    }

    const onReset = jest.fn();
    const { getByTestId, queryByTestId } = await render(
      <ErrorBoundary onReset={onReset}>
        <CrashOnce />
      </ErrorBoundary>,
    );

    expect(getByTestId('error-boundary-fallback')).toBeTruthy();
    expect(mountCount).toBe(0);

    // User clicks retry
    shouldCrash = false;
    fireEvent.press(getByTestId('error-boundary-retry-btn'));

    expect(onReset).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith('/(tabs)');

    await waitFor(() => {
      expect(queryByTestId('error-boundary-fallback')).toBeNull();
    });
    expect(getByTestId('recovered-child')).toBeTruthy();
    expect(mountCount).toBe(1);
  });
});
