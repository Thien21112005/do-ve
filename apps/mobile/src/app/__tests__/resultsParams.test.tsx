import React from 'react';
import type { ReactNode } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as expoRouter from 'expo-router';
import ResultsScreen from '../(tabs)/results';
import * as apiDraws from '@/api/draws';

jest.mock('@/api/draws');

function Wrapper({ children }: { children: ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('ResultsScreen route params (T11.05)', () => {
  beforeEach(() => {
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue([
      { code: 'tp-hcm', name: 'TP. Hồ Chí Minh', region: 'SOUTH' },
      { code: 'dong-thap', name: 'Đồng Tháp', region: 'SOUTH' },
    ]);
    (apiDraws.fetchDraw as jest.Mock).mockResolvedValue(null);
    (apiDraws.fetchLatestDayDraws as jest.Mock).mockResolvedValue([]);
  });

  it('follows new station/date params pushed while the screen is mounted', async () => {
    const spy = jest
      .spyOn(expoRouter, 'useLocalSearchParams')
      .mockReturnValue({ station: 'tp-hcm', date: '2026-11-16' });

    const { rerender } = await render(<ResultsScreen />, { wrapper: Wrapper });
    await waitFor(() =>
      expect(apiDraws.fetchDraw).toHaveBeenCalledWith('2026-11-16', 'tp-hcm'),
    );

    spy.mockReturnValue({ station: 'dong-thap', date: '2026-11-15' });
    await rerender(<ResultsScreen />);

    await waitFor(() =>
      expect(apiDraws.fetchDraw).toHaveBeenCalledWith('2026-11-15', 'dong-thap'),
    );
    spy.mockRestore();
  });
});
