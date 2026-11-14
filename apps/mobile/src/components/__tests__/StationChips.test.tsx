import React, { type ReactNode } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StationChips } from '../StationChips';
import * as api from '@/api/draws';
import type { StationResponse } from '@/types';

jest.mock('@/api/draws');

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
    },
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'StationChipsQueryWrapper';
  return Wrapper;
}

const mockStationsSaturday: StationResponse[] = [
  {
    code: 'TPHCM',
    name: 'TP. Hồ Chí Minh',
    region: 'SOUTH',
    drawDays: ['SATURDAY', 'MONDAY'],
    liveStreamUrl: null,
  },
  {
    code: 'LONG_AN',
    name: 'Long An',
    region: 'SOUTH',
    drawDays: ['SATURDAY'],
    liveStreamUrl: null,
  },
  {
    code: 'BINH_PHUOC',
    name: 'Bình Phước',
    region: 'SOUTH',
    drawDays: ['SATURDAY'],
    liveStreamUrl: null,
  },
  {
    code: 'HAU_GIANG',
    name: 'Hậu Giang',
    region: 'SOUTH',
    drawDays: ['SATURDAY'],
    liveStreamUrl: null,
  },
];

const mockStationsSunday: StationResponse[] = [
  {
    code: 'TIEN_GIANG',
    name: 'Tiền Giang',
    region: 'SOUTH',
    drawDays: ['SUNDAY'],
    liveStreamUrl: null,
  },
  {
    code: 'KIEN_GIANG',
    name: 'Kiên Giang',
    region: 'SOUTH',
    drawDays: ['SUNDAY'],
    liveStreamUrl: null,
  },
  {
    code: 'DA_LAT',
    name: 'Đà Lạt',
    region: 'SOUTH',
    drawDays: ['SUNDAY'],
    liveStreamUrl: null,
  },
];

describe('StationChips Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders list of stations for selected date', async () => {
    (api.fetchScheduleByDate as jest.Mock).mockResolvedValue(
      mockStationsSaturday,
    );

    const onSelect = jest.fn();
    const { getByTestId, getByText } = await render(
      <StationChips
        selectedDate="2026-11-14"
        selectedStation="TPHCM"
        onSelectStation={onSelect}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      expect(getByText('TP. Hồ Chí Minh')).toBeTruthy();
      expect(getByText('Long An')).toBeTruthy();
      expect(getByText('Bình Phước')).toBeTruthy();
      expect(getByText('Hậu Giang')).toBeTruthy();
    });

    expect(getByTestId('station-chips-TPHCM')).toBeTruthy();
  });

  it('calls onSelectStation when a station chip is clicked', async () => {
    (api.fetchScheduleByDate as jest.Mock).mockResolvedValue(
      mockStationsSaturday,
    );

    const onSelect = jest.fn();
    const { getByTestId } = await render(
      <StationChips
        selectedDate="2026-11-14"
        selectedStation="TPHCM"
        onSelectStation={onSelect}
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(getByTestId('station-chips-LONG_AN')).toBeTruthy(),
    );

    fireEvent.press(getByTestId('station-chips-LONG_AN'));
    expect(onSelect).toHaveBeenCalledWith('LONG_AN');
  });

  it('auto-selects first station when current selected station does not exist in new date', async () => {
    (api.fetchScheduleByDate as jest.Mock).mockResolvedValue(
      mockStationsSunday,
    );

    const onSelect = jest.fn();
    await render(
      <StationChips
        selectedDate="2026-11-15"
        selectedStation="TPHCM" // TPHCM does not draw on Sunday
        onSelectStation={onSelect}
        autoSelectFirst
      />,
      { wrapper: createWrapper() },
    );

    await waitFor(() => {
      // First station of Sunday is TIEN_GIANG
      expect(onSelect).toHaveBeenCalledWith('TIEN_GIANG');
    });
  });
});
