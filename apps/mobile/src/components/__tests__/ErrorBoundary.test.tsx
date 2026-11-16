import React from 'react';
import { Text, Appearance } from 'react-native';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { ErrorBoundary } from '../ErrorBoundary';
import { useRouter } from 'expo-router';
import { colors } from '@/theme/colors';

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

  it('renders theme token styling in both light and dark appearances (T10.56)', async () => {
    // Test Light Mode styling
    const colorSchemeSpy = jest.spyOn(Appearance, 'getColorScheme').mockReturnValue('light');
    const { getByTestId } = await render(
      <ErrorBoundary>
        <BadComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    const fallbackLight = getByTestId('error-boundary-fallback');
    const lightStyle = [fallbackLight.props.style].flat();
    expect(lightStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.light.background }),
      ]),
    );

    // Test Dark Mode styling
    colorSchemeSpy.mockReturnValue('dark');
    const { getByTestId: getByTestIdDark } = await render(
      <ErrorBoundary>
        <BadComponent shouldThrow={true} />
      </ErrorBoundary>,
    );

    const fallbackDark = getByTestIdDark('error-boundary-fallback');
    const darkStyle = [fallbackDark.props.style].flat();
    expect(darkStyle).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ backgroundColor: colors.dark.background }),
      ]),
    );
  });
});
