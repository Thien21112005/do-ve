import React from 'react';
import type { ReactNode } from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CheckScreen from '../(tabs)/check';
import * as apiDraws from '@/api/draws';

jest.mock('@/api/draws');
jest.mock('@/api/check');
// 9h Monday 2026-11-16: the latest drawn session is Sunday 2026-11-15
jest.mock('@/hooks/useActiveDrawSession', () => ({
  useActiveDrawSession: () => ({
    date: '2026-11-15',
    dayOfWeek: 7,
    stations: [{ code: 'tien-giang', name: 'Tiền Giang' }],
  }),
}));

function Wrapper({ children }: { children: ReactNode }) {
  const [client] = React.useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('Check tab default date (T11.18)', () => {
  it('defaults to the latest drawn session, not today', async () => {
    (apiDraws.fetchScheduleByDate as jest.Mock).mockResolvedValue([]);
    await render(<CheckScreen />, { wrapper: Wrapper });
    await waitFor(() =>
      expect(apiDraws.fetchScheduleByDate).toHaveBeenCalledWith('2026-11-15'),
    );
  });
});
