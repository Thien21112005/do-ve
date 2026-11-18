import React from 'react';
import { render } from '@testing-library/react-native';
import { MultiStationDrawTable } from '../MultiStationDrawTable';
import type { UiDrawView } from '@/api/mappers';

const mockDrawsSaturday4Stations: UiDrawView[] = [
  {
    stationCode: 'TPHCM',
    stationName: 'TP. Hồ Chí Minh',
    drawDate: '2026-11-14',
    prizes: {
      SPECIAL: ['123456'],
      FIRST: ['65432'],
      SECOND: ['11223'],
      THIRD: ['33445', '33446'],
      FOURTH: ['44401', '44402', '44403', '44404', '44405', '44406', '44407'],
      FIFTH: ['5501'],
      SIXTH: ['6601', '6602', '6603'],
      SEVENTH: ['701'],
      EIGHTH: ['81'],
    },
    numbers: {
      SPECIAL: ['123456'],
      FIRST: ['65432'],
      SECOND: ['11223'],
      THIRD: ['33445', '33446'],
      FOURTH: ['44401', '44402', '44403', '44404', '44405', '44406', '44407'],
      FIFTH: ['5501'],
      SIXTH: ['6601', '6602', '6603'],
      SEVENTH: ['701'],
      EIGHTH: ['81'],
    },
    status: 'FINAL',
    isComplete: true,
  },
  {
    stationCode: 'LONG_AN',
    stationName: 'Long An',
    drawDate: '2026-11-14',
    prizes: {
      SPECIAL: ['234567'],
      FIRST: ['76543'],
      SECOND: ['22334'],
      THIRD: ['44556', '44557'],
      FOURTH: ['55501', '55502', '55503', '55504', '55505', '55506', '55507'],
      FIFTH: ['6601'],
      SIXTH: ['7701', '7702', '7703'],
      SEVENTH: ['801'],
      EIGHTH: ['92'],
    },
    numbers: {
      SPECIAL: ['234567'],
      FIRST: ['76543'],
      SECOND: ['22334'],
      THIRD: ['44556', '44557'],
      FOURTH: ['55501', '55502', '55503', '55504', '55505', '55506', '55507'],
      FIFTH: ['6601'],
      SIXTH: ['7701', '7702', '7703'],
      SEVENTH: ['801'],
      EIGHTH: ['92'],
    },
    status: 'FINAL',
    isComplete: true,
  },
  {
    stationCode: 'BINH_PHUOC',
    stationName: 'Bình Phước',
    drawDate: '2026-11-14',
    prizes: {
      SPECIAL: ['345678'],
      FIRST: ['87654'],
      SECOND: ['33445'],
      THIRD: ['55667', '55668'],
      FOURTH: ['66601', '66602', '66603', '66604', '66605', '66606', '66607'],
      FIFTH: ['7701'],
      SIXTH: ['8801', '8802', '8803'],
      SEVENTH: ['901'],
      EIGHTH: ['03'],
    },
    numbers: {
      SPECIAL: ['345678'],
      FIRST: ['87654'],
      SECOND: ['33445'],
      THIRD: ['55667', '55668'],
      FOURTH: ['66601', '66602', '66603', '66604', '66605', '66606', '66607'],
      FIFTH: ['7701'],
      SIXTH: ['8801', '8802', '8803'],
      SEVENTH: ['901'],
      EIGHTH: ['03'],
    },
    status: 'FINAL',
    isComplete: true,
  },
  {
    stationCode: 'HAU_GIANG',
    stationName: 'Hậu Giang',
    drawDate: '2026-11-14',
    prizes: {
      SPECIAL: ['456789'],
      FIRST: ['98765'],
      SECOND: ['44556'],
      THIRD: ['66778', '66779'],
      FOURTH: ['77701', '77702', '77703', '77704', '77705', '77706', '77707'],
      FIFTH: ['8801'],
      SIXTH: ['9901', '9902', '9903'],
      SEVENTH: ['001'],
      EIGHTH: ['14'],
    },
    numbers: {
      SPECIAL: ['456789'],
      FIRST: ['98765'],
      SECOND: ['44556'],
      THIRD: ['66778', '66779'],
      FOURTH: ['77701', '77702', '77703', '77704', '77705', '77706', '77707'],
      FIFTH: ['8801'],
      SIXTH: ['9901', '9902', '9903'],
      SEVENTH: ['001'],
      EIGHTH: ['14'],
    },
    status: 'FINAL',
    isComplete: true,
  },
];

describe('MultiStationDrawTable (T10.39)', () => {
  it('renders all 4 stations side-by-side on 1 screen for Saturday draws at normal font scale (T10.39, T12.06)', async () => {
    const { getByTestId, queryByTestId, getByText } = await render(
      <MultiStationDrawTable draws={mockDrawsSaturday4Stations} />,
    );

    expect(getByTestId('multi-station-draw-table')).toBeTruthy();
    // All 4 stations fit side-by-side without horizontal scroll at normal fontScale
    expect(queryByTestId('multi-station-scroll-view')).toBeNull();
    expect(queryByTestId('multi-station-scroll-hint')).toBeNull();

    // Compact header for TP. Hồ Chí Minh -> TP.HCM + other 3 stations
    expect(getByText('TP.HCM')).toBeTruthy();
    expect(getByText('Long An')).toBeTruthy();
    expect(getByText('Bình Phước')).toBeTruthy();
    expect(getByText('Hậu Giang')).toBeTruthy();

    // Compact tier labels in left column
    expect(getByText('G.8')).toBeTruthy();
    expect(getByText('G.1')).toBeTruthy();
    expect(getByText('ĐB')).toBeTruthy();

    // All Special prizes of 4 stations displayed
    expect(getByText('123456')).toBeTruthy();
    expect(getByText('234567')).toBeTruthy();
    expect(getByText('345678')).toBeTruthy();
    expect(getByText('456789')).toBeTruthy();
  });

  it('orders rows from G8 down to SPECIAL by default and preserves leading zeros', async () => {
    const { getByTestId, getByText } = await render(
      <MultiStationDrawTable draws={mockDrawsSaturday4Stations} />,
    );

    // Row 0 is G.8, Row 8 is ĐB
    const row0 = getByTestId('multi-station-row-0');
    expect(row0).toBeTruthy();
    expect(getByText('03')).toBeTruthy(); // preserved leading zero for Binh Phuoc G8
    expect(getByText('001')).toBeTruthy(); // preserved leading zero for Hau Giang G7
  });

  it('supports reversing order from SPECIAL to G8 via order prop', async () => {
    const { getByTestId } = await render(
      <MultiStationDrawTable
        draws={mockDrawsSaturday4Stations}
        order="special_to_g8"
      />,
    );

    const row0 = getByTestId('multi-station-row-0');
    expect(row0.props.accessibilityLabel).toContain('Đặc biệt');
  });

  it('highlights matching numbers ending with query (T10.40)', async () => {
    const { getAllByTestId, getByText } = await render(
      <MultiStationDrawTable
        draws={mockDrawsSaturday4Stations}
        highlightQuery="01"
      />,
    );

    const matched = getAllByTestId('draw-number-matched');
    expect(matched.length).toBeGreaterThan(0);
    expect(getByText('44401')).toBeTruthy();
  });

  it('pins left tier column, prints G8 & ĐB in vermilion, and switches 4-station view to horizontal scroll with hint banner when fontScale > 1.2 (T11.38, T12.06)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const RN = require('react-native');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { colors } = require('@/theme/colors');

    const dimSpy = jest
      .spyOn(RN, 'useWindowDimensions')
      .mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1.35 });

    try {
      const { getByTestId, getByText, rerender } = await render(
        <MultiStationDrawTable draws={mockDrawsSaturday4Stations} />,
      );

      expect(getByTestId('multi-station-fixed-tier-col')).toBeTruthy();
      expect(getByTestId('multi-station-scroll-view').props.scrollEnabled).toBe(
        true,
      );
      expect(getByTestId('multi-station-scroll-hint')).toBeTruthy();
      expect(getByText(/Vuốt ngang xem đủ 4 đài/)).toBeTruthy();

      const flatten = (node: any) =>
        Object.assign(
          {},
          ...(Array.isArray(node.props.style)
            ? node.props.style.filter(Boolean)
            : [node.props.style]),
        );

      expect(flatten(getByText('81')).color).toBe(colors.light.special);
      expect(flatten(getByText('123456')).color).toBe(colors.light.special);

      // Review I3: row height & column width scale with fontScale (1.35x) so 7-number G.4 never overlaps
      expect(flatten(getByTestId('multi-station-row-4')).height).toBeGreaterThan(200);
      expect(
        flatten(getByTestId('multi-station-header-cell-0')).width,
      ).toBeGreaterThan(130);

      // 3 stations -> fits viewport width in unified grid even at fontScale 1.35
      await rerender(
        <MultiStationDrawTable draws={mockDrawsSaturday4Stations.slice(0, 3)} />,
      );
      expect(
        flatten(getByTestId('multi-station-header-cell-0')).flexBasis,
      ).toBe(0);
    } finally {
      dimSpy.mockRestore();
    }
  });

  it('aligns 3-station columns with unified flexBasis: 0 and crisp 1dp borders without horizontal ScrollView (T12.05)', async () => {
    const threeDraws = mockDrawsSaturday4Stations.slice(0, 3);
    const { getByTestId, queryByTestId } = await render(
      <MultiStationDrawTable draws={threeDraws} />,
    );

    // No horizontal ScrollView wrapper skewing header vs body flex widths
    expect(queryByTestId('multi-station-scroll-view')).toBeNull();

    const flatten = (node: any) =>
      Object.assign(
        {},
        ...(Array.isArray(node.props.style)
          ? node.props.style.filter(Boolean)
          : [node.props.style]),
      );

    for (const sIdx of [0, 1, 2]) {
      const headerCellStyle = flatten(
        getByTestId(`multi-station-header-cell-${sIdx}`),
      );
      const dataCellStyle = flatten(
        getByTestId(`multi-station-cell-0-${sIdx}`),
      );
      expect(headerCellStyle.flexGrow).toBe(1);
      expect(headerCellStyle.flexShrink).toBe(1);
      expect(headerCellStyle.flexBasis).toBe(0);
      expect(headerCellStyle.minWidth).toBe(0);
      expect(dataCellStyle.flexGrow).toBe(1);
      expect(dataCellStyle.flexShrink).toBe(1);
      expect(dataCellStyle.flexBasis).toBe(0);
      expect(dataCellStyle.minWidth).toBe(0);
    }

    // Crisp 1dp horizontal and vertical grid lines (never sub-pixel hairlineWidth)
    expect(flatten(getByTestId('multi-station-header-row')).borderBottomWidth).toBe(1);
    expect(flatten(getByTestId('multi-station-row-0')).borderBottomWidth).toBe(1);
    expect(flatten(getByTestId('multi-station-header-cell-0')).borderRightWidth).toBe(1);
    expect(flatten(getByTestId('multi-station-cell-0-0')).borderRightWidth).toBe(1);
  });
});
